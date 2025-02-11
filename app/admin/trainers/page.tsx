'use client'
import { useState, useEffect } from 'react'
import RoleGuard from '@/components/RoleGuard'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

type Trainer = {
    id: string
    name: string
    experience_years: number
    bio: string
    image_url: string
    position: string
    website_url: string
    twitter_url: string
    facebook_url: string
    linkedin_url: string
    youtube_url: string
    rating: number
    user_id: string
    created_at: string
    updated_at: string
    email?: string // For form only
    password?: string // For form only
}

export default function TrainerManagement() {
    const [trainers, setTrainers] = useState<Trainer[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [currentTrainer, setCurrentTrainer] = useState<Partial<Trainer>>({})

    useEffect(() => {
        loadTrainers()
    }, [])

    const loadTrainers = async () => {
        try {
            const { data, error } = await supabase
                .from('trainers')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setTrainers(data || [])
        } catch (error) {
            console.error('Error loading trainers:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (trainer: Trainer) => {
        setCurrentTrainer(trainer)
        setIsEditing(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (isEditing && currentTrainer.id) {
                // Update existing trainer
                const { error } = await supabase
                    .from('trainers')
                    .update({
                        name: currentTrainer.name,
                        experience_years: currentTrainer.experience_years,
                        bio: currentTrainer.bio,
                        image_url: currentTrainer.image_url,
                        position: currentTrainer.position,
                        website_url: currentTrainer.website_url,
                        twitter_url: currentTrainer.twitter_url,
                        facebook_url: currentTrainer.facebook_url,
                        linkedin_url: currentTrainer.linkedin_url,
                        youtube_url: currentTrainer.youtube_url,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', currentTrainer.id)

                if (error) throw error
            } else {
                // Create auth user first using admin client
                const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                    email: currentTrainer.email as string,
                    password: currentTrainer.password as string,
                    email_confirm: true,
                    user_metadata: {
                        role: 'trainer'
                    }
                })

                if (authError) throw authError

                if (authData.user) {
                    // Then create trainer record
                    const { error: trainerError } = await supabase
                        .from('trainers')
                        .insert([{
                            id: authData.user.id,
                            name: currentTrainer.name,
                            experience_years: currentTrainer.experience_years,
                            bio: currentTrainer.bio,
                            image_url: currentTrainer.image_url,
                            position: currentTrainer.position,
                            website_url: currentTrainer.website_url,
                            twitter_url: currentTrainer.twitter_url,
                            facebook_url: currentTrainer.facebook_url,
                            linkedin_url: currentTrainer.linkedin_url,
                            youtube_url: currentTrainer.youtube_url,
                            rating: 0,
                            user_id: authData.user.id,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }])

                    if (trainerError) {
                        // If trainer creation fails, delete the auth user
                        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
                        throw trainerError
                    }
                }
            }

            await loadTrainers()
            setIsEditing(false)
            setCurrentTrainer({})
            alert(isEditing ? 'Trainer updated successfully!' : 'New trainer added successfully!')
        } catch (error) {
            console.error('Error saving trainer:', error)
            alert('Error saving trainer. Please try again.')
        }
    }

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this trainer?')) {
            try {
                const { error } = await supabase
                    .from('trainers')
                    .delete()
                    .eq('id', id)

                if (error) throw error
                await loadTrainers()
            } catch (error) {
                console.error('Error deleting trainer:', error)
            }
        }
    }

    const handleAddNew = () => {
        setCurrentTrainer({
            name: '',
            experience_years: 0,
            bio: '',
            image_url: '',
            position: '',
            website_url: '',
            twitter_url: '',
            facebook_url: '',
            linkedin_url: '',
            youtube_url: '',
            rating: 0,
            // These will be used for auth but not stored in trainers table
            email: '',
            password: ''
        })
        setIsEditing(false)
    }

    return (
        <RoleGuard allowedRoles={['admin']}>
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Trainer Management</h1>
                    <button
                        onClick={handleAddNew}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Add New Trainer
                    </button>
                </div>

                {/* Form for adding/editing trainers */}
                {(isEditing || Object.keys(currentTrainer).length > 0) && (
                    <div className="mb-8 bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            {isEditing ? 'Edit Trainer' : 'Add New Trainer'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        value={currentTrainer.name || ''}
                                        onChange={(e) => setCurrentTrainer({...currentTrainer, name: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Experience (Years)</label>
                                    <input
                                        type="number"
                                        value={currentTrainer.experience_years || ''}
                                        onChange={(e) => setCurrentTrainer({...currentTrainer, experience_years: parseInt(e.target.value)})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                                    <textarea
                                        value={currentTrainer.bio || ''}
                                        onChange={(e) => setCurrentTrainer({...currentTrainer, bio: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Position</label>
                                    <input
                                        type="text"
                                        value={currentTrainer.position || ''}
                                        onChange={(e) => setCurrentTrainer({...currentTrainer, position: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Website URL</label>
                                    <input
                                        type="url"
                                        value={currentTrainer.website_url || ''}
                                        onChange={(e) => setCurrentTrainer({...currentTrainer, website_url: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                {!isEditing && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <input
                                                type="email"
                                                value={currentTrainer.email || ''}
                                                onChange={(e) => setCurrentTrainer({...currentTrainer, email: e.target.value})}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Password</label>
                                            <input
                                                type="password"
                                                value={currentTrainer.password || ''}
                                                onChange={(e) => setCurrentTrainer({...currentTrainer, password: e.target.value})}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required={!isEditing}
                                            />
                                        </div>
                                    </>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Twitter URL</label>
                                    <input
                                        type="url"
                                        value={currentTrainer.twitter_url || ''}
                                        onChange={(e) => setCurrentTrainer({...currentTrainer, twitter_url: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Facebook URL</label>
                                    <input
                                        type="url"
                                        value={currentTrainer.facebook_url || ''}
                                        onChange={(e) => setCurrentTrainer({...currentTrainer, facebook_url: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                                    <input
                                        type="url"
                                        value={currentTrainer.linkedin_url || ''}
                                        onChange={(e) => setCurrentTrainer({...currentTrainer, linkedin_url: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">YouTube URL</label>
                                    <input
                                        type="url"
                                        value={currentTrainer.youtube_url || ''}
                                        onChange={(e) => setCurrentTrainer({...currentTrainer, youtube_url: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false)
                                        setCurrentTrainer({})
                                    }}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    {isEditing ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Trainers List */}
                {loading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trainer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Experience
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Position
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rating
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {trainers.map((trainer) => (
                                    <tr key={trainer.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {trainer.image_url && (
                                                    <img
                                                        className="h-10 w-10 rounded-full mr-3"
                                                        src={trainer.image_url}
                                                        alt={trainer.name}
                                                    />
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {trainer.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {trainer.experience_years} years
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {trainer.position}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {trainer.rating || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(trainer)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(trainer.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
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