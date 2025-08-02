import {
  users,
  games,
  packages,
  orders,
  addMoneyRequests,
  type User,
  type UpsertUser,
  type Game,
  type Package,
  type Order,
  type AddMoneyRequest,
  type InsertGame,
  type InsertPackage,
  type InsertOrder,
  type InsertAddMoneyRequest,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, data: Partial<User>): Promise<User>;
  deleteUserAccount(id: string): Promise<void>;
  
  // Game operations
  getGames(): Promise<Game[]>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: string, game: Partial<InsertGame>): Promise<Game>;
  deleteGame(id: string): Promise<void>;
  
  // Package operations
  getPackagesByGame(gameId: string): Promise<Package[]>;
  createPackage(packageData: InsertPackage): Promise<Package>;
  updatePackage(id: string, packageData: Partial<InsertPackage>): Promise<Package>;
  deletePackage(id: string): Promise<void>;
  getPackage(id: string): Promise<Package | undefined>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getRecentOrders(limit?: number): Promise<Order[]>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  
  // Add money request operations
  createAddMoneyRequest(request: InsertAddMoneyRequest): Promise<AddMoneyRequest>;
  getAddMoneyRequestsByUser(userId: string): Promise<AddMoneyRequest[]>;
  getAllAddMoneyRequests(): Promise<AddMoneyRequest[]>;
  updateAddMoneyRequestStatus(id: string, status: string): Promise<AddMoneyRequest>;
  
  // Admin operations
  updateUserBalance(userId: string, amount: string): Promise<User>;
  getStats(): Promise<{
    totalOrders: number;
    totalRevenue: string;
    activeUsers: number;
    pendingOrders: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, data: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUserAccount(id: string): Promise<void> {
    // Delete in order to respect foreign key constraints
    await db.delete(addMoneyRequests).where(eq(addMoneyRequests.userId, id));
    await db.delete(orders).where(eq(orders.userId, id));
    await db.delete(users).where(eq(users.id, id));
  }

  // Game operations
  async getGames(): Promise<Game[]> {
    return await db.select().from(games).where(eq(games.isActive, true)).orderBy(games.name);
  }

  async createGame(game: InsertGame): Promise<Game> {
    const [newGame] = await db.insert(games).values(game).returning();
    return newGame;
  }

  async updateGame(id: string, game: Partial<InsertGame>): Promise<Game> {
    const [updatedGame] = await db
      .update(games)
      .set(game)
      .where(eq(games.id, id))
      .returning();
    return updatedGame;
  }

  async deleteGame(id: string): Promise<void> {
    await db.update(games).set({ isActive: false }).where(eq(games.id, id));
  }

  // Package operations
  async getPackagesByGame(gameId: string): Promise<Package[]> {
    return await db
      .select()
      .from(packages)
      .where(and(eq(packages.gameId, gameId), eq(packages.isActive, true)))
      .orderBy(packages.price);
  }

  async createPackage(packageData: InsertPackage): Promise<Package> {
    const [newPackage] = await db.insert(packages).values(packageData).returning();
    return newPackage;
  }

  async updatePackage(id: string, packageData: Partial<InsertPackage>): Promise<Package> {
    const [updatedPackage] = await db
      .update(packages)
      .set(packageData)
      .where(eq(packages.id, id))
      .returning();
    return updatedPackage;
  }

  async deletePackage(id: string): Promise<void> {
    await db.update(packages).set({ isActive: false }).where(eq(packages.id, id));
  }

  async getPackage(id: string): Promise<Package | undefined> {
    const [pkg] = await db.select().from(packages).where(eq(packages.id, id));
    return pkg;
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return await db
      .select({
        id: orders.id,
        userId: orders.userId,
        gameId: orders.gameId,
        packageId: orders.packageId,
        gameUid: orders.gameUid,
        amount: orders.amount,
        status: orders.status,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        gameName: games.displayName,
        packageName: packages.name,
        packageAmount: packages.amount,
      })
      .from(orders)
      .leftJoin(games, eq(orders.gameId, games.id))
      .leftJoin(packages, eq(orders.packageId, packages.id))
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db
      .select({
        id: orders.id,
        userId: orders.userId,
        gameId: orders.gameId,
        packageId: orders.packageId,
        gameUid: orders.gameUid,
        amount: orders.amount,
        status: orders.status,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        userEmail: users.email,
        gameName: games.displayName,
        packageName: packages.name,
        packageAmount: packages.amount,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .leftJoin(games, eq(orders.gameId, games.id))
      .leftJoin(packages, eq(orders.packageId, packages.id))
      .orderBy(desc(orders.createdAt));
  }

  async getRecentOrders(limit = 10): Promise<Order[]> {
    return await db
      .select({
        id: orders.id,
        userId: orders.userId,
        gameId: orders.gameId,
        packageId: orders.packageId,
        gameUid: orders.gameUid,
        amount: orders.amount,
        status: orders.status,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        userEmail: users.email,
        gameName: games.displayName,
        packageName: packages.name,
        packageAmount: packages.amount,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .leftJoin(games, eq(orders.gameId, games.id))
      .leftJoin(packages, eq(orders.packageId, packages.id))
      .orderBy(desc(orders.createdAt))
      .limit(limit);
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  // Add money request operations
  async createAddMoneyRequest(request: InsertAddMoneyRequest): Promise<AddMoneyRequest> {
    const [newRequest] = await db.insert(addMoneyRequests).values(request).returning();
    return newRequest;
  }

  async getAddMoneyRequestsByUser(userId: string): Promise<AddMoneyRequest[]> {
    return await db
      .select()
      .from(addMoneyRequests)
      .where(eq(addMoneyRequests.userId, userId))
      .orderBy(desc(addMoneyRequests.createdAt));
  }

  async getAllAddMoneyRequests(): Promise<AddMoneyRequest[]> {
    return await db
      .select({
        id: addMoneyRequests.id,
        userId: addMoneyRequests.userId,
        amount: addMoneyRequests.amount,
        senderNumber: addMoneyRequests.senderNumber,
        transactionId: addMoneyRequests.transactionId,
        status: addMoneyRequests.status,
        createdAt: addMoneyRequests.createdAt,
        updatedAt: addMoneyRequests.updatedAt,
        userEmail: users.email,
      })
      .from(addMoneyRequests)
      .leftJoin(users, eq(addMoneyRequests.userId, users.id))
      .orderBy(desc(addMoneyRequests.createdAt));
  }

  async updateAddMoneyRequestStatus(id: string, status: string): Promise<AddMoneyRequest> {
    const [updatedRequest] = await db
      .update(addMoneyRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(addMoneyRequests.id, id))
      .returning();
    return updatedRequest;
  }

  // Admin operations
  async updateUserBalance(userId: string, amount: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ balance: sql`${users.balance} + ${amount}`, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async getStats(): Promise<{
    totalOrders: number;
    totalRevenue: string;
    activeUsers: number;
    pendingOrders: number;
  }> {
    const [orderStats] = await db
      .select({
        totalOrders: sql<number>`count(*)`,
        totalRevenue: sql<string>`sum(${orders.amount})`,
        pendingOrders: sql<number>`count(*) filter (where ${orders.status} = 'pending')`,
      })
      .from(orders);

    const [userStats] = await db
      .select({
        activeUsers: sql<number>`count(*)`,
      })
      .from(users);

    return {
      totalOrders: orderStats.totalOrders || 0,
      totalRevenue: orderStats.totalRevenue || "0",
      activeUsers: userStats.activeUsers || 0,
      pendingOrders: orderStats.pendingOrders || 0,
    };
  }
}

export const storage = new DatabaseStorage();
