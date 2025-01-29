'use client'
import RoleGuard from '@/components/RoleGuard'
import { useAuth } from '@/lib/AuthContext'

export default function TrainerDashboard() {
    const { user } = useAuth()

    return (
        <RoleGuard allowedRoles={['trainer']}>
            <div className="max-w-7xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold mb-6">Trainer Dashboard</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Profile Overview</h2>
                        <div className="space-y-2">
                            <p className="text-gray-600">Email: {user?.email}</p>
                            <p className="text-gray-600">Role: Trainer</p>
                            <p className="text-gray-600">Status: Active</p>
                        </div>
                    </div>

                    {/* Training Stats */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Training Statistics</h2>
                        <div className="space-y-2">
                            <p className="text-gray-600">Total Trainees: 0</p>
                            <p className="text-gray-600">Active Sessions: 0</p>
                            <p className="text-gray-600">Completed Sessions: 0</p>
                        </div>
                    </div>

                    {/* Schedule Card */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                        <div className="space-y-2">
                            <button className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                Schedule Training
                            </button>
                            <button className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                                View Trainees
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </RoleGuard>
    )
} 