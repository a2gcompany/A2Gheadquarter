import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Browser client that syncs auth session with cookies (readable by middleware)
export const supabase = createClientComponentClient()
