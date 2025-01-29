'use client'
import RoleGuard from '@/components/RoleGuard'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
    const { user } = useAuth()
    const router = useRouter()

    const handleManageStaff = () => {
        router.push('/admin/staff')
    }

    return (
        <RoleGuard allowedRoles={['admin']}>
            <div className="max-w-7xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* System Overview */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">System Overview</h2>
                        <div className="space-y-2">
                            <p className="text-gray-600">Total Users: 0</p>
                            <p className="text-gray-600">Active Brokers: 0</p>
                            <p className="text-gray-600">Active Trainers: 0</p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
                        <div className="space-y-2">
                            <p className="text-gray-600">New Users Today: 0</p>
                            <p className="text-gray-600">Active Sessions: 0</p>
                            <p className="text-gray-600">Pending Approvals: 0</p>
                        </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                        <div className="space-y-2">
                            <button 
                                onClick={handleManageStaff}
                                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Manage Staff
                            </button>
                            <button className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                                System Settings
                            </button>
                            <button className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                                View Reports
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </RoleGuard>
    )
} 