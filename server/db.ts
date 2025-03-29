import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

// Create and configure postgres client
const client = postgres(process.env.DATABASE_URL);

// Initialize Drizzle ORM
export const db = drizzle(client, { schema });
