"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Building2,
  BarChart3,
  Settings,
  X,
} from "lucide-react"

interface NavItem {
  name: string
  icon: React.ReactNode
  href: string
  active?: boolean
}

const navItems: NavItem[] = [
  { name: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, href: "/dashboard", active: true },
  { name: "Documentos", icon: <FileText className="h-4 w-4" />, href: "#" },
  { name: "Empresas", icon: <Building2 className="h-4 w-4" />, href: "#" },
  { name: "Reportes", icon: <BarChart3 className="h-4 w-4" />, href: "#" },
  { name: "Configuracion", icon: <Settings className="h-4 w-4" />, href: "#" },
]

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ open = true, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              A2G
            </div>
            <div>
              <span className="font-semibold text-sidebar-foreground block">A2G</span>
              <span className="text-xs text-sidebar-foreground/60">Command Center</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    item.active
                      ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/50 text-center">
            A2G Headquarters v1.0
          </p>
        </div>
      </aside>
    </>
  )
}
