// Server-only Supabase admin client. Do NOT import this in client components.
import { createClient, SupabaseClient } from "@supabase/supabase-js"

let supabaseAdminInstance: SupabaseClient | null = null

// Lazy initialization to avoid build-time errors when env vars are not available
function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase service role environment variables")
  }

  supabaseAdminInstance = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return supabaseAdminInstance
}

// Export a proxy that lazily initializes the client
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseAdmin()
    const value = client[prop as keyof SupabaseClient]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})

// Helper to validate credentials at runtime (now redundant but kept for compatibility)
export function validateAdminClient() {
  getSupabaseAdmin()
}
