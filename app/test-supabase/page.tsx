'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TestSupabasePage() {
  const [status, setStatus] = useState<any>({})

  useEffect(() => {
    async function testConnection() {
      try {
        // Test 1: Check env vars
        const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
        const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        setStatus((prev: any) => ({
          ...prev,
          envVars: { url: hasUrl, key: hasKey }
        }))

        // Test 2: Simple query
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .limit(1)

        setStatus((prev: any) => ({
          ...prev,
          dbQuery: { success: !error, data, error: error?.message }
        }))

        // Test 3: Auth check
        const { data: session } = await supabase.auth.getSession()
        
        setStatus((prev: any) => ({
          ...prev,
          auth: { session: !!session }
        }))

      } catch (err: any) {
        setStatus((prev: any) => ({
          ...prev,
          error: err.message
        }))
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <pre className="bg-slate-900 p-4 rounded overflow-auto">
        {JSON.stringify(status, null, 2)}
      </pre>
    </div>
  )
}
