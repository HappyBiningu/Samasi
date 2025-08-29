import "./env.js"; // Load environment variables first
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Replit environment
neonConfig.webSocketConstructor = ws;
// Force use of fetch for all queries to avoid WebSocket SSL issues
neonConfig.poolQueryViaFetch = true;

// Support both NETLIFY_DATABASE_URL (for Netlify deployment) and DATABASE_URL (for Replit)
const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL or NETLIFY_DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });