"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"
import {
  LayoutDashboard,
  Receipt,
  Music,
  CalendarDays,
  Users,
  X,
  Building2,
  ChevronDown,
  Mic2,
  Code2,
  UserCircle,
  Plug,
  Landmark,
  CreditCard,
  Wallet,
  ShoppingCart,
  Database,
  DollarSign,
  FileText,
  LogOut,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
  comingSoon?: boolean
  children?: NavItem[]
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
    name: "A2G Talents",
    href: "/talents",
    icon: <Mic2 className="h-5 w-5" />,
    children: [
      {
        name: "Dashboard",
        href: "/talents",
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
      {
        name: "Artistas",
        href: "/talents/artists",
        icon: <UserCircle className="h-4 w-4" />,
      },
      {
        name: "Releases",
        href: "/talents/releases",
        icon: <Music className="h-4 w-4" />,
      },
      {
        name: "Bookings",
        href: "/talents/bookings",
        icon: <CalendarDays className="h-4 w-4" />,
      },
      {
        name: "Royalties",
        href: "/talents/royalties",
        icon: <DollarSign className="h-4 w-4" />,
      },
      {
        name: "Contratos",
        href: "/talents/contracts",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        name: "Contabilidad",
        href: "/talents/accounting",
        icon: <Receipt className="h-4 w-4" />,
      },
    ],
  },
  {
    name: "Audesign",
    href: "/audesign",
    icon: <Code2 className="h-5 w-5" />,
    children: [
      {
        name: "Dashboard",
        href: "/audesign",
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
      {
        name: "Contabilidad",
        href: "/audesign/accounting",
        icon: <Receipt className="h-4 w-4" />,
      },
    ],
  },
  {
    name: "Ingestion",
    href: "/ingestion",
    icon: <Database className="h-5 w-5" />,
  },
  {
    name: "Integraciones",
    href: "/integrations",
    icon: <Plug className="h-5 w-5" />,
    children: [
      {
        name: "Dashboard",
        href: "/integrations",
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
      {
        name: "Bank Import",
        href: "/integrations/bank-import",
        icon: <Landmark className="h-4 w-4" />,
      },
      {
        name: "Stripe",
        href: "/integrations/stripe",
        icon: <CreditCard className="h-4 w-4" />,
      },
      {
        name: "PayPal",
        href: "/integrations/paypal",
        icon: <Wallet className="h-4 w-4" />,
      },
      {
        name: "Shopify",
        href: "/integrations/shopify",
        icon: <ShoppingCart className="h-4 w-4" />,
      },
    ],
  },
  {
    name: "Empleados",
    href: "/employees",
    icon: <Users className="h-5 w-5" />,
  },
]

interface AppSidebarProps {
  open?: boolean
  onClose?: () => void
}

export function AppSidebar({ open = true, onClose }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [expandedSections, setExpandedSections] = useState<string[]>(["A2G Talents", "Audesign"])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const toggleSection = (name: string) => {
    setExpandedSections(prev =>
      prev.includes(name)
        ? prev.filter(n => n !== name)
        : [...prev, name]
    )
  }

  const isActive = (href: string, hasChildren?: boolean) => {
    if (href === "/") return pathname === "/"
    if (hasChildren) return pathname.startsWith(href)
    return pathname === href
  }

  const renderNavItem = (item: NavItem, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedSections.includes(item.name)
    const active = isActive(item.href, hasChildren)

    if (hasChildren) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleSection(item.name)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            {item.icon}
            <span className="flex-1 text-left">{item.name}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isExpanded ? "rotate-180" : ""
              )}
            />
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-3">
              {item.children!.map(child => renderNavItem(child, true))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.name}
        href={item.comingSoon ? "#" : item.href}
        onClick={(e) => {
          if (item.comingSoon) e.preventDefault()
          if (onClose && window.innerWidth < 1024) onClose()
        }}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group",
          isChild ? "py-1.5" : "py-2.5",
          active && !item.comingSoon
            ? isChild
              ? "bg-primary/10 text-primary font-medium"
              : "bg-primary text-primary-foreground"
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
  }

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
              <span className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">Headquarters</span>
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
            {navItems.map(item => renderNavItem(item))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesion</span>
          </button>
          <p className="text-[10px] text-sidebar-foreground/40 text-center uppercase tracking-wider">
            A2G Headquarters v3.0
          </p>
        </div>
      </aside>
    </>
  )
}
