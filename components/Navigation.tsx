'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Navigation() {
  const { user, userRole } = useAuth()
  const router = useRouter()

  const getDashboardLink = () => {
    switch (userRole) {
      case 'admin':
        return '/admin'
      case 'trainer':
        return '/trainer'
      case 'broker':
        return '/broker'
      default:
        return '/'
    }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      router.push('/login')
    }
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href={getDashboardLink()} className="text-xl font-bold">
                Dashboard
              </Link>
            </div>
            
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link href={getDashboardLink()} className="inline-flex items-center px-1 pt-1 text-gray-900">
                Home
              </Link>
              {userRole === 'admin' && (
                <>
                  <Link href="/admin" className="inline-flex items-center px-3 py-2 text-gray-900 hover:text-gray-600">
                    Dashboard
                  </Link>
                  <Link href="/admin/staff" className="inline-flex items-center px-3 py-2 text-gray-900 hover:text-gray-600">
                    Staff
                  </Link>
                  <Link href="/admin/trainers" className="inline-flex items-center px-3 py-2 text-gray-900 hover:text-gray-600">
                    Trainers
                  </Link>
                  <Link href="/admin/brokers" className="inline-flex items-center px-3 py-2 text-gray-900 hover:text-gray-600">
                    Brokers
                  </Link>
                  <Link href="/admin/carousel" className="inline-flex items-center px-3 py-2 text-gray-900 hover:text-gray-600">
                    Carousel
                  </Link>
                  <Link href="/users" className="inline-flex items-center px-3 py-2 text-gray-900 hover:text-gray-600">
                    Users
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  {user.email} ({userRole})
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/login"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 