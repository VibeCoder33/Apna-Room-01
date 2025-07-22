# replit.md

## Overview

This is a full-stack web application called "ApnaRoom" - a roommate and flat-sharing platform built for the Indian market. The application helps users find verified roommates and flat-sharing opportunities through a modern React-based frontend and Express.js backend with PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL store
- **Real-time Communication**: WebSocket support for messaging

### Key Components

#### Authentication System
- Uses Replit's built-in authentication system
- OpenID Connect integration for secure user authentication
- Session-based authentication with PostgreSQL session storage
- Mandatory user and session tables for Replit Auth compatibility

#### Database Schema
- **Users**: Profile management with roles (SEEKER/OWNER)
- **Listings**: Property listings with amenities, preferences, and images
- **Applications**: User applications to listings with status tracking
- **Messages**: Real-time messaging between users
- **Reviews**: User review system for trust building
- **Sessions**: Required for Replit Auth session management

#### API Structure
- RESTful API endpoints for CRUD operations
- Authentication middleware protecting routes
- Structured error handling and logging
- Real-time WebSocket connections for messaging

## Data Flow

1. **User Authentication**: Users authenticate through Replit's OAuth system
2. **Profile Management**: Users can update their profiles and select roles
3. **Listing Management**: Property owners can create, update, and manage listings
4. **Application Process**: Seekers can apply to listings with messages
5. **Communication**: Real-time messaging between users via WebSocket
6. **Review System**: Users can leave reviews after interactions

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL database
- **Drizzle ORM**: Type-safe database operations
- **Connection Pooling**: Using Neon's serverless connection pooling

### Authentication
- **Replit Auth**: Built-in authentication system
- **OpenID Client**: For OAuth integration
- **Passport.js**: Authentication middleware

### UI/UX
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-built component library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Icon library

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the stack
- **ESBuild**: Fast JavaScript bundler for production
- **Replit Development**: Integrated development environment

## Deployment Strategy

### Development Environment
- Runs on Replit with hot module replacement
- Vite development server for frontend
- tsx for TypeScript execution in development
- Runtime error overlay for debugging

### Production Build
- Frontend built with Vite to static assets
- Backend bundled with ESBuild for Node.js
- Assets served from Express with static file middleware
- Database migrations managed through Drizzle Kit

### Environment Configuration
- Environment variables for database connection
- Session secrets for security
- OIDC configuration for authentication
- Replit-specific environment detection

### Key Architectural Decisions

1. **Monorepo Structure**: Single repository with shared schema between frontend and backend for type safety
2. **Serverless Database**: Chose Neon for scalability and reduced infrastructure management
3. **Component Library**: Used shadcn/ui for consistent, accessible UI components
4. **Real-time Features**: WebSocket integration for immediate messaging experience
5. **Type Safety**: Full TypeScript implementation with shared types between client and server
6. **Authentication**: Leveraged Replit's built-in auth to reduce complexity and improve security