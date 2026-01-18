"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  Search,
  Inbox,
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Calendar,
  FileText,
  Users,
  Building2,
  ChevronDown,
  ChevronRight,
  Plus,
  Folder,
  Globe,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"

interface NavItem {
  name: string
  icon: React.ReactNode
  href: string
  shortcut?: string
  active?: boolean
}

interface WorkGroup {
  id: string
  name: string
  icon: React.ReactNode
  expanded?: boolean
  children?: { id: string; name: string; icon?: React.ReactNode }[]
}

const navItems: NavItem[] = [
  { name: "Search", icon: <Search className="h-4 w-4" />, href: "#", shortcut: "/" },
  { name: "Inbox", icon: <Inbox className="h-4 w-4" />, href: "#" },
  { name: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, href: "/dashboard", active: true },
  { name: "My Tasks", icon: <CheckSquare className="h-4 w-4" />, href: "#" },
  { name: "Projects", icon: <FolderKanban className="h-4 w-4" />, href: "#" },
  { name: "Calendar", icon: <Calendar className="h-4 w-4" />, href: "#" },
  { name: "Documents", icon: <FileText className="h-4 w-4" />, href: "#" },
  { name: "Teams", icon: <Users className="h-4 w-4" />, href: "#" },
  { name: "Company", icon: <Building2 className="h-4 w-4" />, href: "#" },
]

const defaultWorkgroups: WorkGroup[] = [
  {
    id: "all-work",
    name: "All Work",
    icon: <Globe className="h-4 w-4" />,
    expanded: true,
    children: [
      { id: "website-copy", name: "Website Copy", icon: <Folder className="h-4 w-4" /> },
    ],
  },
  {
    id: "website-copy",
    name: "Website Copy",
    icon: <Folder className="h-4 w-4" />,
    expanded: true,
    children: [
      { id: "client-website", name: "Client website" },
      { id: "personal-project", name: "Personal project" },
    ],
  },
  { id: "ux-research", name: "UX Research", icon: <Folder className="h-4 w-4" /> },
  { id: "assets-library", name: "Assets Library", icon: <Folder className="h-4 w-4" /> },
  { id: "marketing", name: "Marketing", icon: <Folder className="h-4 w-4" /> },
  { id: "development", name: "Development", icon: <Folder className="h-4 w-4" /> },
  { id: "support", name: "Support", icon: <Folder className="h-4 w-4" /> },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const [workgroups, setWorkgroups] = useState(defaultWorkgroups)

  const toggleWorkgroup = (id: string) => {
    setWorkgroups(prev =>
      prev.map(wg =>
        wg.id === id ? { ...wg, expanded: !wg.expanded } : wg
      )
    )
  }

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Brand Header */}
      <div className="p-4 flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
          S
        </div>
        {!collapsed && (
          <span className="font-semibold text-sidebar-foreground">Square UI</span>
        )}
        <button
          onClick={onToggle}
          className="ml-auto p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  item.active
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                {item.icon}
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.shortcut && (
                      <span className="text-xs text-sidebar-foreground/40 bg-sidebar-accent px-1.5 py-0.5 rounded">
                        {item.shortcut}
                      </span>
                    )}
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Workgroups */}
        {!collapsed && (
          <div className="mt-6">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
                Workgroups
              </span>
              <div className="flex gap-1">
                <button className="p-1 rounded hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-sidebar-foreground">
                  <Search className="h-3.5 w-3.5" />
                </button>
                <button className="p-1 rounded hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-sidebar-foreground">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <ul className="space-y-0.5">
              {workgroups.map((group) => (
                <li key={group.id}>
                  <button
                    onClick={() => group.children && toggleWorkgroup(group.id)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
                  >
                    {group.children ? (
                      group.expanded ? (
                        <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                      )
                    ) : (
                      <span className="w-3.5" />
                    )}
                    {group.icon}
                    <span className="truncate">{group.name}</span>
                  </button>
                  {group.children && group.expanded && (
                    <ul className="ml-6 mt-0.5 space-y-0.5">
                      {group.children.map((child) => (
                        <li key={child.id}>
                          <button className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors">
                            {child.icon || <FileText className="h-3.5 w-3.5" />}
                            <span className="truncate">{child.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            <button className="w-full flex items-center gap-2 px-3 py-2 mt-2 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors">
              <Plus className="h-4 w-4" />
              <span>Create Group</span>
            </button>
          </div>
        )}
      </nav>

      {/* Open Source Badge */}
      {!collapsed && (
        <div className="p-4 m-2 rounded-lg bg-sidebar-accent/50">
          <h4 className="font-medium text-sm text-sidebar-foreground">Open-source layouts by Indev-ui</h4>
          <p className="text-xs text-sidebar-foreground/60 mt-1">
            Collection of beautifully crafted open-source layouts UI built with shadcn/ui.
          </p>
          <a
            href="#"
            className="mt-2 inline-block text-xs text-primary hover:underline"
          >
            square.Indev.me
          </a>
        </div>
      )}
    </aside>
  )
}
