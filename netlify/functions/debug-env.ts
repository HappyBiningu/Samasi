// netlify/functions/debug-env.ts
export async function handler() {
  return {
    statusCode: 200,
    body: JSON.stringify({
      DATABASE_URL: process.env.DATABASE_URL ? "✅ set" : "❌ missing",
      SESSION_SECRET: process.env.SESSION_SECRET ? "✅ set" : "❌ missing",
      NODE_ENV: process.env.NODE_ENV || "❌ missing"
    }),
  };
}
