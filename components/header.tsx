'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export function Header() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">A2G Command Center</h1>
          <span className="text-xs text-slate-500 font-mono">HEADQUARTERS</span>
        </div>
        
        <button
          onClick={handleLogout}
          disabled={loading}
          className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saliendo...' : 'Cerrar Sesión'}
        </button>
      </div>
    </header>
  )
}
