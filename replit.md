# Overview

GameTopup+ is a full-stack web application for purchasing gaming currency and digital packages across multiple games. The platform provides a secure marketplace where users can buy game credits (like Free Fire diamonds, PUBG UC, Mobile Legends diamonds) with real money. The application features user authentication, wallet management, order processing, and admin controls for managing games, packages, and transactions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for client-side routing
- **Styling**: Custom gaming-themed dark mode design with CSS variables and Tailwind utility classes

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **API Design**: RESTful APIs with JSON responses and proper error handling middleware

## Authentication & Authorization
- **Provider**: Replit's OpenID Connect (OIDC) authentication system
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Authorization**: Role-based access control (user/admin roles)
- **Security**: HTTP-only secure cookies, CSRF protection via session tokens

## Database Schema
- **Users**: Profile data, wallet balance, and role management
- **Games**: Game metadata with currency types and display information
- **Packages**: Game-specific purchasable items with pricing
- **Orders**: Transaction records with status tracking
- **Add Money Requests**: Wallet top-up requests requiring admin approval
- **Sessions**: Secure session storage for authentication state

## Data Flow & Business Logic
- **Order Processing**: User selects game → chooses package → validates balance → creates order → updates wallet
- **Wallet Management**: Users submit add-money requests → admin approval → balance updates
- **Admin Operations**: Comprehensive dashboard for order management, user oversight, and system analytics

# External Dependencies

## Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Replit Platform**: Hosting environment with integrated authentication and development tooling

## Authentication Services  
- **Replit OIDC**: Primary authentication provider with user profile management
- **OpenID Client**: Standard OAuth2/OIDC implementation for secure token handling

## Development & Build Tools
- **Vite**: Frontend build tool with hot module replacement and optimized production builds
- **ESBuild**: Backend TypeScript compilation for production deployment
- **PostCSS & Autoprefixer**: CSS processing pipeline for cross-browser compatibility

## UI & Styling Framework
- **Radix UI**: Headless component primitives for accessibility and keyboard navigation
- **Tailwind CSS**: Utility-first CSS framework with custom gaming theme variables
- **Lucide React**: Modern icon library with consistent design language

## Validation & Type Safety
- **Zod**: Runtime schema validation for API inputs and database operations
- **TypeScript**: Compile-time type checking across frontend, backend, and shared modules
- **Drizzle Zod**: Automatic schema generation from database models for type-safe validation