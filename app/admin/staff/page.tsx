'use client'
import { useState, useEffect } from 'react'
import RoleGuard from '@/components/RoleGuard'
import { supabase } from '@/lib/supabase'
import { UserRole } from '@/types/auth'

type StaffMember = {
    id: string
    email: string
    username: string
    role: UserRole
    created_at: string
    status?: 'active' | 'inactive'
}

export default function StaffManagement() {
    const [staff, setStaff] = useState<StaffMember[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedRole, setSelectedRole] = useState<'all' | UserRole>('all')

    useEffect(() => {
        loadStaff()
    }, [])

    const loadStaff = async () => {
        try {
            const { data: { users }, error } = await supabase.auth.admin.listUsers()
            
            if (error) throw error

            // Filter users based on role and transform data
            const staffMembers = users
                .filter(user => ['trainer', 'broker'].includes(user.user_metadata.role))
                .map(user => ({
                    id: user.id,
                    email: user.email,
                    role: user.user_metadata.role as UserRole,
                    created_at: user.created_at,
                    status: user.user_metadata.status || 'active'
                }))

            setStaff(staffMembers)
        } catch (error) {
            console.error('Error loading staff:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive') => {
        try {
            const { error } = await supabase.auth.admin.updateUserById(userId, {
                user_metadata: { status: newStatus }
            })

            if (error) throw error
            
            // Update local state
            setStaff(staff.map(member => 
                member.id === userId 
                    ? { ...member, status: newStatus }
                    : member
            ))
        } catch (error) {
            console.error('Error updating status:', error)
        }
    }

    const filteredStaff = staff.filter(member => 
        selectedRole === 'all' || member.role === selectedRole
    )

    return (
        <RoleGuard allowedRoles={['admin']}>
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Staff Management</h1>
                    <div className="flex gap-4">
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as 'all' | UserRole)}
                            className="border rounded-md px-3 py-2"
                        >
                            <option value="all">All Staff</option>
                            <option value="trainer">Trainers</option>
                            <option value="broker">Brokers</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredStaff.map((member) => (
                                    <tr key={member.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {member.username}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {member.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                member.role === 'trainer' 
                                                    ? 'bg-purple-100 text-purple-800' 
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                member.status === 'active' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {member.status || 'active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(member.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <select
                                                value={member.status || 'active'}
                                                onChange={(e) => handleStatusChange(member.id, e.target.value as 'active' | 'inactive')}
                                                className="text-sm border rounded px-2 py-1"
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </RoleGuard>
    )
} 