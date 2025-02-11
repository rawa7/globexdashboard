'use client'
import { useAuth } from '@/lib/AuthContext'
import { UserRole } from '@/types/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RoleGuard({
    children,
    allowedRoles,
}: {
    children: React.ReactNode
    allowedRoles: UserRole[]
}) {
    const { user, userRole, session, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && (!session || !user || !userRole || !allowedRoles.includes(userRole))) {
            router.push('/login')
        }
    }, [loading, session, user, userRole, allowedRoles, router])

    if (loading) {
        return <div>Loading...</div>
    }

    if (!session || !user || !userRole || !allowedRoles.includes(userRole)) {
        return null
    }

    return <>{children}</>
} 