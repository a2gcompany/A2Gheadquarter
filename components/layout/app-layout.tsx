"use client"

import { useState } from "react"
import { AppSidebar } from "./app-sidebar"
import { Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <AppSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top bar */}
          <header className="h-16 border-b border-border flex items-center justify-between px-4 lg:px-6 bg-background/95 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-muted"
              >
                <Menu className="h-5 w-5" />
              </button>
              {title && (
                <h1 className="text-lg font-semibold">{title}</h1>
              )}
            </div>

            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
