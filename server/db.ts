
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Replit environment
neonConfig.webSocketConstructor = ws;
// Force use of fetch for all queries to avoid WebSocket SSL issues
neonConfig.poolQueryViaFetch = true;

// Hardcoded database URL
const databaseUrl = "postgresql://neondb_owner:npg_4QE1vOrmTyjF@ep-muddy-credit-ae6zy7i3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });
