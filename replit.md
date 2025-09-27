# Invoice Management System

## Project Overview
A full-stack invoice management application built with React, Express, and TypeScript. Features in-memory storage for invoice CRUD operations with a clean, professional interface.

## Architecture
- **Frontend**: React + Vite with TypeScript
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for data persistence
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

## Key Features
- Create, view, edit, and delete invoices
- Professional invoice templates with PDF generation
- VAT calculations and line item management
- Responsive design with dark/light mode support
- Type-safe API with shared schemas

## Project Structure
```
├── client/src/          # React frontend
├── server/              # Express backend
├── shared/              # Shared TypeScript schemas
└── public/              # Static assets
```

## User Preferences
- Modern, professional UI design
- Type-safe development with strict TypeScript
- Component-based architecture with reusable UI elements

## Recent Changes
- Migrated from Replit Agent to Replit environment
- Fixed build configuration and dependencies
- Ensured proper security practices and client/server separation
- Added editable bank details functionality to invoice system
- Fixed DOM nesting warnings in navigation components
- Updated database schema to support bank details storage
- Migrated from in-memory storage to PostgreSQL database with Drizzle ORM
- **Added complete email functionality for sending invoices**:
  - Secure SMTP integration using Replit secrets management
  - Professional email templates with PDF invoice attachments
  - Email dialog UI for payment reminders and direct invoice sending
  - Comprehensive error handling and user feedback
  - Automatic PDF generation using jsPDF
  - Email API routes with proper validation and debugging

## Development Notes
- Uses port 5000 for both frontend and backend serving
- Vite handles frontend development with HMR
- Express serves API routes under /api prefix
- PostgreSQL database with persistent storage for production use
- Database schema managed through Drizzle migrations with `npm run db:push`