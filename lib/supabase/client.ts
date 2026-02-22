import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { SupabaseClient } from "@supabase/supabase-js"

// Lazy-initialized browser client that syncs auth session with cookies.
// Uses Proxy to defer createClientComponentClient() call until runtime,
// avoiding crashes during Next.js static page generation (build time).
let _instance: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!_instance) {
    _instance = createClientComponentClient()
  }
  return _instance
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getClient()
    const value = (client as any)[prop]
    if (typeof value === "function") {
      return value.bind(client)
    }
    return value
  },
})
