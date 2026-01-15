'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { UserProfile, UserRoleType, Vertical } from '@/lib/types/database'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  verticals: Vertical[]
  isLoading: boolean
  isAdmin: boolean
  isCofounder: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  hasVerticalAccess: (verticalSlug: string) => boolean
  canEditVertical: (verticalSlug: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface VerticalPermission {
  vertical_id: string
  can_view: boolean
  can_edit: boolean
  verticals: {
    slug: string
  } | null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [verticals, setVerticals] = useState<Vertical[]>([])
  const [permissions, setPermissions] = useState<VerticalPermission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    return data as UserProfile | null
  }

  const fetchVerticals = async () => {
    const { data } = await supabase
      .from('verticals')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    return (data || []) as Vertical[]
  }

  const fetchPermissions = async (userId: string) => {
    const { data } = await supabase
      .from('user_vertical_permissions')
      .select(`
        vertical_id,
        can_view,
        can_edit,
        verticals (
          slug
        )
      `)
      .eq('user_id', userId)

    // Transform the data to match our interface
    const permissions = (data || []).map((item: any) => ({
      vertical_id: item.vertical_id,
      can_view: item.can_view,
      can_edit: item.can_edit,
      verticals: item.verticals ? { slug: item.verticals.slug } : null
    }))

    return permissions as VerticalPermission[]
  }

  const refreshProfile = async () => {
    if (user) {
      const [profileData, verticalsData, permissionsData] = await Promise.all([
        fetchProfile(user.id),
        fetchVerticals(),
        fetchPermissions(user.id),
      ])

      setProfile(profileData)
      setVerticals(verticalsData)
      setPermissions(permissionsData)
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()

        if (initialSession?.user) {
          setSession(initialSession)
          setUser(initialSession.user)

          const [profileData, verticalsData, permissionsData] = await Promise.all([
            fetchProfile(initialSession.user.id),
            fetchVerticals(),
            fetchPermissions(initialSession.user.id),
          ])

          setProfile(profileData)
          setVerticals(verticalsData)
          setPermissions(permissionsData)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (newSession?.user) {
          const [profileData, verticalsData, permissionsData] = await Promise.all([
            fetchProfile(newSession.user.id),
            fetchVerticals(),
            fetchPermissions(newSession.user.id),
          ])

          setProfile(profileData)
          setVerticals(verticalsData)
          setPermissions(permissionsData)
        } else {
          setProfile(null)
          setPermissions([])
        }

        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
    setPermissions([])
  }

  const isAdmin = profile?.role_type === 'admin'
  const isCofounder = profile?.role_type === 'cofounder'

  const hasVerticalAccess = (verticalSlug: string): boolean => {
    if (isAdmin || isCofounder) return true
    return permissions.some(
      p => p.verticals?.slug === verticalSlug && p.can_view
    )
  }

  const canEditVertical = (verticalSlug: string): boolean => {
    if (isAdmin) return true
    if (isCofounder) return true // cofounders can edit assigned areas
    return permissions.some(
      p => p.verticals?.slug === verticalSlug && p.can_edit
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        verticals,
        isLoading,
        isAdmin,
        isCofounder,
        signOut,
        refreshProfile,
        hasVerticalAccess,
        canEditVertical,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
