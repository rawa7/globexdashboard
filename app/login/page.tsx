'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check if user is already authenticated
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                // Get role from user metadata and redirect accordingly
                const role = session.user.user_metadata.role
                switch (role) {
                    case 'admin':
                        router.replace('/admin')
                        break
                    case 'trainer':
                        router.replace('/trainer')
                        break
                    case 'broker':
                        router.replace('/broker')
                        break
                    default:
                        router.replace('/')
                }
            }
            setLoading(false)
        }
        
        checkUser()
    }, [router])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                setError(error.message)
                return
            }

            // Get role from user metadata and redirect accordingly
            const role = data.user?.user_metadata.role
            switch (role) {
                case 'admin':
                    router.replace('/admin')
                    break
                case 'trainer':
                    router.replace('/trainer')
                    break
                case 'broker':
                    router.replace('/broker')
                    break
                default:
                    router.replace('/')
            }
        } catch (error) {
            console.error('Error:', error)
            setError('An error occurred during login')
        }
    }

    if (loading) {
        return (
            <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">Login</h1>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                    Login
                </button>
            </form>
        </div>
    )
} 