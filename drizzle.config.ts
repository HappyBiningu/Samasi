import { defineConfig } from "drizzle-kit";

// Hardcoded database configuration
const DATABASE_URL = "postgresql://neondb_owner:npg_4QE1vOrmTyjF@ep-muddy-credit-ae6zy7i3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured. Please update the hardcoded value in drizzle.config.ts");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
