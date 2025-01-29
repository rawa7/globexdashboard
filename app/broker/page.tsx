'use client'
import RoleGuard from '@/components/RoleGuard'
import { useAuth } from '@/lib/AuthContext'

export default function BrokerDashboard() {
    const { user } = useAuth()

    return (
        <RoleGuard allowedRoles={['broker']}>
            <div className="max-w-7xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold mb-6">Broker Dashboard</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Profile Overview</h2>
                        <div className="space-y-2">
                            <p className="text-gray-600">Email: {user?.email}</p>
                            <p className="text-gray-600">Role: Broker</p>
                            <p className="text-gray-600">Status: Active</p>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Your Statistics</h2>
                        <div className="space-y-2">
                            <p className="text-gray-600">Total Clients: 0</p>
                            <p className="text-gray-600">Active Deals: 0</p>
                            <p className="text-gray-600">Completed Deals: 0</p>
                        </div>
                    </div>

                    {/* Quick Actions Card */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                        <div className="space-y-2">
                            <button className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                New Client
                            </button>
                            <button className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                                Create Deal
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </RoleGuard>
    )
} 