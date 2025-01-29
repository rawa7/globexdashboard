'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'
import { UserRole } from '@/types/auth'

type AuthContextType = {
    user: User | null
    userRole: UserRole | null
    loading: boolean
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userRole: null,
    loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [userRole, setUserRole] = useState<UserRole | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchUserRole(session.user.id)
            }
            setLoading(false)
        })

        // Listen for changes on auth state (login, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                await fetchUserRole(session.user.id)
            } else {
                setUserRole(null)
            }
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchUserRole = async (userId: string) => {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', userId)
            .single()

        if (data) {
            setUserRole(data.role as UserRole)
        }
    }

    return (
        <AuthContext.Provider value={{ user, userRole, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext)
} 