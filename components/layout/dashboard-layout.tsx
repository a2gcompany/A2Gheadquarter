"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Menu } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button - fixed position */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-card border border-border shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex">
        {/* Sidebar - hidden on mobile by default */}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content */}
        <main className="flex-1 min-h-screen lg:ml-0">
          {children}
        </main>
      </div>
    </div>
  )
}
