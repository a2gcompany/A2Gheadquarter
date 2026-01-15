'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  Building2,
  Music,
  Users,
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  TrendingUp,
  Calendar,
  UserPlus,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  verticalSlug?: string
  adminOnly?: boolean
}

const mainNavItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
]

const verticalNavItems: NavItem[] = [
  {
    name: 'A2G Company',
    href: '/a2g-company',
    icon: Building2,
    verticalSlug: 'a2g-company',
  },
  {
    name: 'AUDESIGN',
    href: '/audesign',
    icon: Music,
    verticalSlug: 'audesign',
  },
  {
    name: 'A2G Talents',
    href: '/a2g-talents',
    icon: Users,
    verticalSlug: 'a2g-talents',
  },
]

const toolsNavItems: NavItem[] = [
  {
    name: 'Reportes',
    href: '/reports',
    icon: FileText,
  },
]

const adminNavItems: NavItem[] = [
  {
    name: 'Usuarios',
    href: '/admin/users',
    icon: UserPlus,
    adminOnly: true,
  },
  {
    name: 'Configuracion',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { profile, isAdmin, isCofounder, hasVerticalAccess, signOut } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const NavLink = ({ item }: { item: NavItem }) => {
    // Check access
    if (item.adminOnly && !isAdmin) return null
    if (item.verticalSlug && !hasVerticalAccess(item.verticalSlug)) return null

    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
    const Icon = item.icon

    return (
      <Link
        href={item.href}
        onClick={() => setIsMobileOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
          isActive
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
        )}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
      </Link>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-6 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-lg font-bold text-white">A2G</span>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-white">A2G Hub</h1>
              <p className="text-xs text-slate-500">Internal Platform</p>
            </div>
          )}
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-8 overflow-y-auto">
        {/* Main */}
        <div>
          {!isCollapsed && (
            <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Principal
            </p>
          )}
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </div>

        {/* Verticals */}
        <div>
          {!isCollapsed && (
            <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Verticales
            </p>
          )}
          <div className="space-y-1">
            {verticalNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </div>

        {/* Tools */}
        <div>
          {!isCollapsed && (
            <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Herramientas
            </p>
          )}
          <div className="space-y-1">
            {toolsNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </div>

        {/* Admin */}
        {(isAdmin || isCofounder) && (
          <div>
            {!isCollapsed && (
              <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Administracion
              </p>
            )}
            <div className="space-y-1">
              {adminNavItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-slate-800">
        <div className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50',
          isCollapsed && 'justify-center'
        )}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-white">
              {profile?.full_name?.[0] || profile?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile?.full_name || 'Usuario'}
              </p>
              <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                {isAdmin && <Shield className="w-3 h-3" />}
                {profile?.role_type || 'worker'}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => signOut()}
          className={cn(
            'mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors',
            isCollapsed && 'justify-center'
          )}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="text-sm">Cerrar sesion</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 lg:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
