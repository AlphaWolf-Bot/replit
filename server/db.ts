import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

// Create and configure Neon client
const sql = neon(process.env.DATABASE_URL);

// Initialize Drizzle ORM
export const db = drizzle(sql, { schema });
