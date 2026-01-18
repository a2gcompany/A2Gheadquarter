"use client"

import { Button } from "@/components/ui/button"
import {
  Sparkles,
  Share2,
  RefreshCw,
  Bell,
  Plus,
  UserPlus,
  BarChart3,
} from "lucide-react"

interface DashboardHeaderProps {
  title?: string
  subtitle?: string
  userName?: string
}

export function DashboardHeader({
  title = "Dashboard",
  subtitle = "Let's tackle down some work",
  userName = "LN"
}: DashboardHeaderProps) {
  return (
    <header className="border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side - Dashboard title */}
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">{title}</span>
        </div>

        {/* Right side - User avatars and actions */}
        <div className="flex items-center gap-3">
          {/* Avatar group */}
          <div className="flex -space-x-2">
            <div className="h-8 w-8 rounded-full bg-emerald-500 ring-2 ring-background flex items-center justify-center text-white text-xs font-medium">
              A
            </div>
            <div className="h-8 w-8 rounded-full bg-violet-500 ring-2 ring-background flex items-center justify-center text-white text-xs font-medium">
              B
            </div>
            <div className="h-8 w-8 rounded-full bg-sky-500 ring-2 ring-background flex items-center justify-center text-white text-xs font-medium">
              C
            </div>
            <button className="h-8 w-8 rounded-full bg-muted ring-2 ring-background flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Ask AI button */}
          <Button variant="outline" size="sm" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Ask AI
          </Button>

          {/* Share button */}
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>

          {/* Refresh button */}
          <button className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Welcome message */}
      <div className="px-6 py-6 border-t border-border/30">
        <h1 className="text-2xl font-bold">Welcome Back {userName}!</h1>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>

      {/* Action buttons */}
      <div className="px-6 pb-4 flex gap-3">
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
        <Button variant="outline" className="gap-2">
          <UserPlus className="h-4 w-4" />
          New Client
        </Button>
      </div>
    </header>
  )
}
