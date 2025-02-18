'use client'
import { useState, useEffect } from 'react'
import RoleGuard from '@/components/RoleGuard'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

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
}

export default function TrainerProfile() {
    const [trainer, setTrainer] = useState<Trainer | null>(null)
    const [formData, setFormData] = useState<Partial<Trainer>>({})
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        loadTrainerProfile()
    }, [])

    const loadTrainerProfile = async () => {
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // Get trainer profile
            const { data, error } = await supabase
                .from('trainers')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (error) throw error
            setTrainer(data)
        } catch (error) {
            console.error('Error loading trainer profile:', error)
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
            const filePath = `trainer-photos/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('trainers')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('trainers')
                .getPublicUrl(filePath)

            setFormData(prev => ({ ...prev, image_url: publicUrl }))
        } catch (error) {
            console.error('Error uploading image:', error)
            alert('Error uploading image. Please try again.')
        }
    }

    useEffect(() => {
        if (trainer) {
            setFormData(trainer)
        }
    }, [trainer])

    const handleUpdate = async () => {
        if (!trainer || !formData) return

        try {
            const { error } = await supabase
                .from('trainers')
                .update({
                    ...formData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', trainer.id)

            if (error) throw error
            
            setTrainer({ ...trainer, ...formData })
            alert('Profile updated successfully!')
        } catch (error) {
            console.error('Error updating profile:', error)
            alert('Error updating profile. Please try again.')
        }
    }

    if (loading) {
        return <div className="text-center py-4">Loading...</div>
    }

    if (!trainer) {
        return <div className="text-center py-4">No trainer profile found.</div>
    }

    return (
        <RoleGuard allowedRoles={['trainer']}>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
                
                <div className="bg-white shadow rounded-lg p-6 space-y-6">
                    {/* Profile Photo Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                        <div className="flex items-center space-x-4">
                            {(formData.image_url || trainer?.image_url) && (
                                <img
                                    src={formData.image_url || trainer?.image_url}
                                    alt="Profile"
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years)</label>
                            <input
                                type="number"
                                value={formData.experience_years || ''}
                                onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Bio Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        <textarea
                            value={formData.bio || ''}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    {/* Position */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                        <input
                            type="text"
                            value={formData.position || ''}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    {/* Social Links Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Social Links</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                                <input
                                    type="url"
                                    value={formData.website_url || ''}
                                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                                <input
                                    type="url"
                                    value={formData.twitter_url || ''}
                                    onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                                <input
                                    type="url"
                                    value={formData.facebook_url || ''}
                                    onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                                <input
                                    type="url"
                                    value={formData.linkedin_url || ''}
                                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
                                <input
                                    type="url"
                                    value={formData.youtube_url || ''}
                                    onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
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