'use client'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BrokerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, userRole } = useAuth()
    const router = useRouter()

    if (!user || userRole !== 'broker') {
        router.push('/login')
        return null
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Side Navigation */}
            

            {/* Main Content */}
            <div className="ml-64">
                {children}
            </div>
        </div>
    )
} 