'use client'
import { useState, useEffect } from 'react'
import RoleGuard from '@/components/RoleGuard'
import { supabase } from '@/lib/supabase'

type Broker = {
    id: string
    name: string
    address: string
    established_date: string
    description: string
    logo_url: string
    website: string
    email: string
    password?: string
    contact_phone: string
    latitude: number
    longitude: number
    average_rating: number
    total_ratings: number
    profile_views: number
    created_at: string
    updated_at: string
}

export default function BrokerManagement() {
    const [brokers, setBrokers] = useState<Broker[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [currentBroker, setCurrentBroker] = useState<Partial<Broker>>({})
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        loadBrokers()
    }, [])

    const loadBrokers = async () => {
        try {
            const { data, error } = await supabase
                .from('brokers')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setBrokers(data || [])
        } catch (error) {
            console.error('Error loading brokers:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            
            if (!e.target.files || e.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            // Upload image to Supabase Storage
            const { error: uploadError, data } = await supabase.storage
                .from('brokers')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) {
                console.error('Upload error:', uploadError)
                throw uploadError
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('brokers')
                .getPublicUrl(filePath)

            // Update form state with the URL
            setCurrentBroker({
                ...currentBroker,
                logo_url: publicUrl
            })

        } catch (error) {
            console.error('Error uploading image:', error)
            alert('Error uploading image. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (!isEditing) {
                // For new brokers, first create auth user
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: currentBroker.email,
                    password: currentBroker.password as string,
                    options: {
                        data: {
                            role: 'broker'
                        }
                    }
                })

                if (authError) throw authError

                if (authData.user) {
                    // Then create broker record
                    const { error: brokerError } = await supabase
                        .from('brokers')
                        .insert([{
                            ...currentBroker,
                            id: authData.user.id,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            password: undefined
                        }])

                    if (brokerError) throw brokerError
                }
            } else {
                // For updates, don't touch auth user
                const { error } = await supabase
                    .from('brokers')
                    .update({
                        ...currentBroker,
                        updated_at: new Date().toISOString(),
                        password: undefined
                    })
                    .eq('id', currentBroker.id)

                if (error) throw error
            }

            await loadBrokers()
            setIsEditing(false)
            setCurrentBroker({})
            alert(isEditing ? 'Broker updated successfully!' : 'New broker added successfully!')
        } catch (error) {
            console.error('Error saving broker:', error)
            alert('Error saving broker. Please try again.')
        }
    }

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this broker?')) {
            try {
                const { error } = await supabase
                    .from('brokers')
                    .delete()
                    .eq('id', id)

                if (error) throw error
                await loadBrokers()
            } catch (error) {
                console.error('Error deleting broker:', error)
            }
        }
    }

    const handleAddNew = () => {
        setCurrentBroker({
            name: '',
            email: '',
            password: '',
            contact_phone: '',
            website: '',
            established_date: '',
            address: '',
            description: '',
            logo_url: '',
            average_rating: 0,
            total_ratings: 0,
            profile_views: 0
        })
        setIsEditing(false)
    }

    return (
        <RoleGuard allowedRoles={['admin']}>
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Broker Management</h1>
                    <button
                        onClick={handleAddNew}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Add New Broker
                    </button>
                </div>

                {/* Form */}
                {(isEditing || Object.keys(currentBroker).length > 0) && (
                    <div className="mb-8 bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            {isEditing ? 'Edit Broker' : 'Add New Broker'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        value={currentBroker.name || ''}
                                        onChange={(e) => setCurrentBroker({...currentBroker, name: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={currentBroker.email || ''}
                                        onChange={(e) => setCurrentBroker({...currentBroker, email: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <input
                                        type="password"
                                        value={currentBroker.password || ''}
                                        onChange={(e) => setCurrentBroker({...currentBroker, password: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required={!isEditing}
                                        disabled={isEditing}
                                    />
                                    {isEditing && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            Password cannot be changed here. User must use password reset.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        type="text"
                                        value={currentBroker.contact_phone || ''}
                                        onChange={(e) => setCurrentBroker({...currentBroker, contact_phone: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Website</label>
                                    <input
                                        type="url"
                                        value={currentBroker.website || ''}
                                        onChange={(e) => setCurrentBroker({...currentBroker, website: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Established Date</label>
                                    <input
                                        type="date"
                                        value={currentBroker.established_date || ''}
                                        onChange={(e) => setCurrentBroker({...currentBroker, established_date: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Address</label>
                                    <input
                                        type="text"
                                        value={currentBroker.address || ''}
                                        onChange={(e) => setCurrentBroker({...currentBroker, address: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={currentBroker.description || ''}
                                        onChange={(e) => setCurrentBroker({...currentBroker, description: e.target.value})}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Logo</label>
                                    <div className="mt-1 flex items-center space-x-4">
                                        {currentBroker.logo_url && (
                                            <img
                                                src={currentBroker.logo_url}
                                                alt="Logo Preview"
                                                className="h-20 w-20 object-cover rounded"
                                            />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="mt-1 block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-md file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-blue-50 file:text-blue-700
                                                hover:file:bg-blue-100"
                                            disabled={uploading}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false)
                                        setCurrentBroker({})
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

                {/* Brokers List */}
                {loading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Broker
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rating
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Views
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {brokers.map((broker) => (
                                    <tr key={broker.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {broker.logo_url && (
                                                    <img
                                                        className="h-10 w-10 rounded-full mr-3"
                                                        src={broker.logo_url}
                                                        alt={broker.name}
                                                    />
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {broker.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {broker.address}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{broker.email}</div>
                                            <div className="text-sm text-gray-500">{broker.contact_phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {broker.average_rating?.toFixed(1) || 'N/A'} ({broker.total_ratings || 0})
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {broker.profile_views || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setCurrentBroker(broker)
                                                    setIsEditing(true)
                                                }}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(broker.id)}
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