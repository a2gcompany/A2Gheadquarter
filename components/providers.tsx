'use client'

import { ReactNode, useEffect, useState } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/lib/hooks/useAuth'
import { Toaster } from '@/components/ui/toaster'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {mounted ? (
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      ) : (
        <>
          {children}
          <Toaster />
        </>
      )}
    </ThemeProvider>
  )
}
