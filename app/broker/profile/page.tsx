'use client'
import { useState, useEffect } from 'react'
import RoleGuard from '@/components/RoleGuard'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Broker = {
    id: string
    name: string
    address: string
    established_date: string
    description: string
    logo_url: string
    website: string
    email: string
    contact_phone: string
    latitude: number
    longitude: number
    username: string
    average_rating: number
    total_ratings: number
    profile_views: number
    is_deleted: boolean
}

export default function BrokerProfile() {
    const [broker, setBroker] = useState<Broker | null>(null)
    const [formData, setFormData] = useState<Partial<Broker>>({})
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        loadBrokerProfile()
    }, [])

    const loadBrokerProfile = async () => {
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // Get broker profile
            const { data, error } = await supabase
                .from('brokers')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) throw error
            setBroker(data)
        } catch (error) {
            console.error('Error loading broker profile:', error)
            alert('Error loading profile. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `broker-photos/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('brokers')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('brokers')
                .getPublicUrl(filePath)

            setFormData(prev => ({ ...prev, logo_url: publicUrl }))
        } catch (error) {
            console.error('Error uploading image:', error)
            alert('Error uploading image. Please try again.')
        }
    }

    useEffect(() => {
        if (broker) {
            setFormData(broker)
        }
    }, [broker])

    const handleUpdate = async () => {
        if (!broker || !formData) return

        try {
            const { error } = await supabase
                .from('brokers')
                .update({
                    ...formData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', broker.id)

            if (error) throw error
            
            setBroker({ ...broker, ...formData })
            alert('Profile updated successfully!')
        } catch (error) {
            console.error('Error updating profile:', error)
            alert('Error updating profile. Please try again.')
        }
    }

    if (loading) {
        return <div className="text-center py-4">Loading...</div>
    }

    if (!broker) {
        return <div className="text-center py-4">No broker profile found.</div>
    }

    return (
        <RoleGuard allowedRoles={['broker']}>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
                
                <div className="bg-white shadow rounded-lg p-6 space-y-6">
                    {/* Logo Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                        <div className="flex items-center space-x-4">
                            {(formData.logo_url || broker?.logo_url) && (
                                <img
                                    src={formData.logo_url || broker?.logo_url}
                                    alt="Company Logo"
                                    className="h-20 w-20 rounded-full object-cover"
                                />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                    </div>

                    {/* Basic Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                            <input
                                type="text"
                                value={formData.username || ''}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                            <input
                                type="tel"
                                value={formData.contact_phone || ''}
                                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Company Details */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <input
                            type="text"
                            value={formData.address || ''}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Established Date</label>
                            <input
                                type="date"
                                value={formData.established_date || ''}
                                onChange={(e) => setFormData({ ...formData, established_date: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                            <input
                                type="url"
                                value={formData.website || ''}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                            <input
                                type="number"
                                step="any"
                                value={formData.latitude || ''}
                                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                            <input
                                type="number"
                                step="any"
                                value={formData.longitude || ''}
                                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleUpdate}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </RoleGuard>
    )
} 