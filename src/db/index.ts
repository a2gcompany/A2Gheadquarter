import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// Connection string from environment
const connectionString = process.env.DATABASE_URL!

// Create postgres client
// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false })

// Create drizzle instance
export const db = drizzle(client, { schema })

// Re-export schema for convenience
export * from "./schema"
