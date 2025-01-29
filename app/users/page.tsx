'use client'
import { useState, useEffect } from 'react'
import { getAllUsers, createUser } from '@/lib/database-examples'
import RoleGuard from '@/components/RoleGuard'

export default function UsersPage() {
    const [users, setUsers] = useState([])
    
    // Load users when page loads
    useEffect(() => {
        loadUsers()
    }, [])
    
    async function loadUsers() {
        const data = await getAllUsers()
        if (data) setUsers(data)
    }
    
    // Handle form submission
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const form = e.target as HTMLFormElement
        const name = form.name.value
        const email = form.email.value
        
        await createUser(name, email)
        // Reload the users list
        loadUsers()
    }
    
    return (
        <RoleGuard allowedRoles={['admin', 'trainer']}>
            <div className="max-w-7xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold mb-6">Users Management</h1>
                <div className="bg-white shadow rounded-lg p-6">
                    <p>User management area. Admin and trainers can access this.</p>
                </div>
            </div>
        </RoleGuard>
    )
} 