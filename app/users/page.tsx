'use client'
import { useState, useEffect } from 'react'
import { getAllUsers, createUser } from '@/lib/database-examples'

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
        <div>
            <h1>Users</h1>
            
            {/* Add User Form */}
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Name" />
                <input name="email" placeholder="Email" />
                <button type="submit">Add User</button>
            </form>
            
            {/* Display Users */}
            <ul>
                {users.map((user: any) => (
                    <li key={user.id}>
                        {user.name} ({user.email})
                    </li>
                ))}
            </ul>
        </div>
    )
} 