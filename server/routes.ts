import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertOrderSchema, insertAddMoneyRequestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Initialize default games and packages
  await initializeDefaultData();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch('/api/auth/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName } = req.body;
      
      const updatedUser = await storage.updateUserProfile(userId, {
        firstName,
        lastName,
        updatedAt: new Date()
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.delete('/api/auth/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Delete user and all related data
      await storage.deleteUserAccount(userId);
      
      // Clear session
      req.logout(() => {
        res.json({ message: "Account deleted successfully" });
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Game routes
  app.get('/api/games', async (req, res) => {
    try {
      const games = await storage.getGames();
      res.json(games);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.get('/api/games/:gameId/packages', async (req, res) => {
    try {
      const packages = await storage.getPackagesByGame(req.params.gameId);
      res.json(packages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });

  // Order routes
  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId,
      });

      // Check user balance
      const user = await storage.getUser(userId);
      const pkg = await storage.getPackage(orderData.packageId);
      
      if (!user || !pkg) {
        return res.status(404).json({ message: "User or package not found" });
      }

      if (parseFloat(user.balance) < parseFloat(pkg.price)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Deduct balance and create order
      await storage.updateUserBalance(userId, `-${pkg.price}`);
      const order = await storage.createOrder({
        ...orderData,
        amount: pkg.price,
      });

      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getOrdersByUser(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/recent', async (req, res) => {
    try {
      const orders = await storage.getRecentOrders(10);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      res.status(500).json({ message: "Failed to fetch recent orders" });
    }
  });

  // Add money request routes
  app.get('/api/add-money-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getAddMoneyRequestsByUser(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching add money requests:", error);
      res.status(500).json({ message: "Failed to fetch add money requests" });
    }
  });

  app.post('/api/add-money-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requestData = insertAddMoneyRequestSchema.parse({
        ...req.body,
        userId,
      });

      const request = await storage.createAddMoneyRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating add money request:", error);
      res.status(500).json({ message: "Failed to create add money request" });
    }
  });

  app.get('/api/add-money-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getAddMoneyRequestsByUser(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching add money requests:", error);
      res.status(500).json({ message: "Failed to fetch add money requests" });
    }
  });

  // Admin routes
  app.get('/api/admin/orders', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.patch('/api/admin/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  app.get('/api/admin/add-money-requests', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const requests = await storage.getAllAddMoneyRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching add money requests:", error);
      res.status(500).json({ message: "Failed to fetch add money requests" });
    }
  });

  app.patch('/api/admin/add-money-requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status } = req.body;
      const request = await storage.updateAddMoneyRequestStatus(req.params.id, status);
      
      // If approved, add money to user balance
      if (status === 'approved') {
        await storage.updateUserBalance(request.userId, request.amount);
      }

      res.json(request);
    } catch (error) {
      console.error("Error updating add money request:", error);
      res.status(500).json({ message: "Failed to update add money request" });
    }
  });

  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function initializeDefaultData() {
  try {
    const existingGames = await storage.getGames();
    if (existingGames.length === 0) {
      // Create default games
      const games = [
        { name: "freefire", displayName: "Free Fire", currency: "Diamonds", icon: "fas fa-fire" },
        { name: "pubg", displayName: "PUBG Mobile", currency: "UC", icon: "fas fa-crosshairs" },
        { name: "mobilelegends", displayName: "Mobile Legends", currency: "Diamonds", icon: "fas fa-shield-alt" },
        { name: "minecraft", displayName: "Minecraft", currency: "Minecoins", icon: "fas fa-cube" },
        { name: "valorant", displayName: "Valorant", currency: "VP", icon: "fas fa-bullseye" },
        { name: "roblox", displayName: "Roblox", currency: "Robux", icon: "fas fa-shapes" },
      ];

      for (const game of games) {
        const newGame = await storage.createGame(game);
        
        // Create default packages for each game
        let packages = [];
        if (game.name === "freefire") {
          packages = [
            { name: "100 Diamonds", amount: 100, price: "80" },
            { name: "310 Diamonds", amount: 310, price: "250" },
            { name: "520 Diamonds", amount: 520, price: "400" },
          ];
        } else if (game.name === "pubg") {
          packages = [
            { name: "60 UC", amount: 60, price: "75" },
            { name: "325 UC", amount: 325, price: "390" },
            { name: "660 UC", amount: 660, price: "780" },
          ];
        } else if (game.name === "mobilelegends") {
          packages = [
            { name: "86 Diamonds", amount: 86, price: "85" },
            { name: "172 Diamonds", amount: 172, price: "170" },
            { name: "257 Diamonds", amount: 257, price: "255" },
          ];
        } else if (game.name === "minecraft") {
          packages = [
            { name: "320 Minecoins", amount: 320, price: "250" },
            { name: "1020 Minecoins", amount: 1020, price: "780" },
            { name: "1720 Minecoins", amount: 1720, price: "1300" },
          ];
        } else if (game.name === "valorant") {
          packages = [
            { name: "475 VP", amount: 475, price: "390" },
            { name: "1000 VP", amount: 1000, price: "780" },
            { name: "2050 VP", amount: 2050, price: "1560" },
          ];
        } else if (game.name === "roblox") {
          packages = [
            { name: "400 Robux", amount: 400, price: "320" },
            { name: "800 Robux", amount: 800, price: "640" },
            { name: "1700 Robux", amount: 1700, price: "1300" },
          ];
        }

        for (const pkg of packages) {
          await storage.createPackage({ ...pkg, gameId: newGame.id });
        }
      }
    }
  } catch (error) {
    console.error("Error initializing default data:", error);
  }
}
