import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// Lazy initialization for database connection
let dbInstance: PostgresJsDatabase<typeof schema> | null = null

function getDatabase(): PostgresJsDatabase<typeof schema> {
  if (dbInstance) return dbInstance

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. Please check your .env.local file."
    )
  }

  // Create postgres client
  // Disable prefetch as it is not supported for "Transaction" pool mode
  const client = postgres(connectionString, { prepare: false })

  // Create drizzle instance
  dbInstance = drizzle(client, { schema })
  return dbInstance
}

// Export a proxy that lazily initializes the database
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_, prop) {
    const database = getDatabase()
    const value = (database as any)[prop]
    if (typeof value === "function") {
      return value.bind(database)
    }
    return value
  },
})

// Re-export schema for convenience
export * from "./schema"
