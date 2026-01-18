"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Receipt,
  Music,
  CalendarDays,
  FileText,
  X,
  Building2,
} from "lucide-react"

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
  active?: boolean
  comingSoon?: boolean
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    name: "Contabilidad",
    href: "/accounting",
    icon: <Receipt className="h-5 w-5" />,
  },
  {
    name: "Releases",
    href: "/releases",
    icon: <Music className="h-5 w-5" />,
    comingSoon: true,
  },
  {
    name: "Bookings",
    href: "/bookings",
    icon: <CalendarDays className="h-5 w-5" />,
    comingSoon: true,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: <FileText className="h-5 w-5" />,
    comingSoon: true,
  },
]

interface AppSidebarProps {
  open?: boolean
  onClose?: () => void
}

export function AppSidebar({ open = true, onClose }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
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
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-sidebar-foreground block">A2G</span>
              <span className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">Command Center</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.name}
                  href={item.comingSoon ? "#" : item.href}
                  onClick={(e) => item.comingSoon && e.preventDefault()}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group",
                    isActive && !item.comingSoon
                      ? "bg-primary text-primary-foreground"
                      : item.comingSoon
                        ? "text-sidebar-foreground/40 cursor-not-allowed"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  {item.icon}
                  <span className="flex-1">{item.name}</span>
                  {item.comingSoon && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sidebar-accent text-sidebar-foreground/50">
                      Soon
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-[10px] text-sidebar-foreground/40 text-center uppercase tracking-wider">
            A2G Headquarters v2.0
          </p>
        </div>
      </aside>
    </>
  )
}
