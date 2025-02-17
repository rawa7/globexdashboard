'use client'
import { useState, useEffect } from 'react'
import RoleGuard from '@/components/RoleGuard'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'

type BrokerMedia = {
    id: string
    broker_id: string
    media_type: 'video' | 'image' | 'document'
    title: string
    description: string
    media_url: string
    thumbnail_url: string
    duration_seconds: number
    file_size_bytes: number
    created_at: string
    is_deleted: boolean
    views_count: number
}

export default function BrokerMediaManagement() {
    const { user } = useAuth()
    const [media, setMedia] = useState<BrokerMedia[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [currentMedia, setCurrentMedia] = useState<Partial<BrokerMedia>>({
        media_type: 'video',
        is_deleted: false,
        views_count: 0
    })
    const [uploading, setUploading] = useState(false)
    const [showForm, setShowForm] = useState(false)

    useEffect(() => {
        if (user) {
            loadMedia()
        }
    }, [user])

    const loadMedia = async () => {
        try {
            const { data, error } = await supabase
                .from('broker_media')
                .select('*')
                .eq('broker_id', user?.id)
                .eq('is_deleted', false)
                .order('created_at', { ascending: false })

            if (error) throw error
            setMedia(data || [])
        } catch (error) {
            console.error('Error loading media:', error)
            alert('Error loading media. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'media' | 'thumbnail') => {
        try {
            setUploading(true)
            
            if (!e.target.files || e.target.files.length === 0) {
                throw new Error('You must select a file to upload.')
            }

            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${user?.id}/${type}/${fileName}`

            // Validate file type
            if (type === 'media') {
                if (!validateFileType(file, currentMedia.media_type)) {
                    throw new Error(`Invalid file type for ${currentMedia.media_type}`)
                }
            } else if (type === 'thumbnail') {
                if (!file.type.startsWith('image/')) {
                    throw new Error('Thumbnail must be an image file')
                }
            }

            // Upload file to Supabase Storage
            const { error: uploadError, data } = await supabase.storage
                .from('broker-media')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: file.type
                })

            if (uploadError) {
                console.error('Upload error:', uploadError)
                throw new Error(uploadError.message)
            }

            if (!data?.path) {
                throw new Error('Upload failed - no path returned')
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('broker-media')
                .getPublicUrl(data.path)

            // Update form state
            if (type === 'media') {
                setCurrentMedia({
                    ...currentMedia,
                    media_url: publicUrl,
                    file_size_bytes: file.size,
                    ...(currentMedia.media_type === 'image' && { thumbnail_url: publicUrl })
                })
            } else {
                setCurrentMedia({
                    ...currentMedia,
                    thumbnail_url: publicUrl
                })
            }
        } catch (error) {
            console.error('Error uploading file:', error)
            alert(error instanceof Error ? error.message : 'Error uploading file. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    // Helper function to validate file types
    const validateFileType = (file: File, mediaType: string | undefined): boolean => {
        switch (mediaType) {
            case 'video':
                return file.type.startsWith('video/')
            case 'image':
                return file.type.startsWith('image/')
            case 'document':
                return file.type.startsWith('application/') || 
                       file.type.startsWith('text/') ||
                       file.type === 'application/pdf'
            default:
                return false
        }
    }

    // Add accept attribute to file inputs based on media type
    const getAcceptTypes = (mediaType: string | undefined): string => {
        switch (mediaType) {
            case 'video':
                return 'video/*'
            case 'image':
                return 'image/*'
            case 'document':
                return '.pdf,.doc,.docx,.txt,.rtf'
            default:
                return ''
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (!currentMedia.media_url) {
                throw new Error('Please upload a media file')
            }

            if (isEditing && currentMedia.id) {
                const { error } = await supabase
                    .from('broker_media')
                    .update({
                        title: currentMedia.title,
                        description: currentMedia.description,
                        media_type: currentMedia.media_type,
                        media_url: currentMedia.media_url,
                        thumbnail_url: currentMedia.thumbnail_url,
                        duration_seconds: currentMedia.duration_seconds || 0,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', currentMedia.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('broker_media')
                    .insert([{
                        broker_id: user?.id,
                        title: currentMedia.title,
                        description: currentMedia.description,
                        media_type: currentMedia.media_type,
                        media_url: currentMedia.media_url,
                        thumbnail_url: currentMedia.thumbnail_url,
                        duration_seconds: currentMedia.duration_seconds || 0,
                        file_size_bytes: currentMedia.file_size_bytes || 0,
                        is_deleted: false,
                        views_count: 0,
                        created_at: new Date().toISOString()
                    }])

                if (error) throw error
            }

            await loadMedia()
            resetForm()
            alert(isEditing ? 'Media updated successfully!' : 'New media added successfully!')
        } catch (error) {
            console.error('Error saving media:', error)
            alert(error instanceof Error ? error.message : 'Error saving media. Please try again.')
        }
    }

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this media?')) {
            try {
                // Soft delete
                const { error } = await supabase
                    .from('broker_media')
                    .update({ is_deleted: true })
                    .eq('id', id)

                if (error) throw error
                
                // Remove from local state
                setMedia(media.filter(item => item.id !== id))
                alert('Media deleted successfully!')
            } catch (error) {
                console.error('Error deleting media:', error)
                alert('Error deleting media. Please try again.')
            }
        }
    }

    const resetForm = () => {
        setCurrentMedia({
            media_type: 'video',
            is_deleted: false,
            views_count: 0
        })
        setIsEditing(false)
        setShowForm(false)
    }

    const handleEdit = (item: BrokerMedia) => {
        setCurrentMedia(item)
        setIsEditing(true)
        setShowForm(true)
    }

    const handleAddNew = () => {
        resetForm()
        setShowForm(true)
    }

    return (
        <RoleGuard allowedRoles={['broker']}>
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Media Management</h1>
                    <button
                        onClick={handleAddNew}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Add New Media
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="mb-8 bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                {isEditing ? 'Edit Media' : 'Add New Media'}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <input
                                        type="text"
                                        value={currentMedia.title || ''}
                                        onChange={(e) => setCurrentMedia({...currentMedia, title: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Media Type</label>
                                    <select
                                        value={currentMedia.media_type || 'video'}
                                        onChange={(e) => setCurrentMedia({...currentMedia, media_type: e.target.value as 'video' | 'image' | 'document'})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="video">Video</option>
                                        <option value="image">Image</option>
                                        <option value="document">Document</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={currentMedia.description || ''}
                                        onChange={(e) => setCurrentMedia({...currentMedia, description: e.target.value})}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Media File</label>
                                    <input
                                        type="file"
                                        accept={getAcceptTypes(currentMedia.media_type)}
                                        onChange={(e) => handleFileUpload(e, 'media')}
                                        className="mt-1 block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-md file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-blue-50 file:text-blue-700
                                            hover:file:bg-blue-100"
                                        disabled={uploading}
                                    />
                                    {uploading && <p className="mt-2 text-sm text-gray-500">Uploading...</p>}
                                </div>

                                {currentMedia.media_type !== 'image' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Thumbnail</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, 'thumbnail')}
                                            className="mt-1 block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-md file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-blue-50 file:text-blue-700
                                                hover:file:bg-blue-100"
                                            disabled={uploading}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    disabled={uploading}
                                >
                                    {isEditing ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Media List */}
                {loading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : media.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                        No media found. Click Add New Media to get started.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {media.map((item) => (
                            <div key={item.id} className="bg-white shadow rounded-lg overflow-hidden">
                                {/* Preview */}
                                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                                    {item.media_type === 'video' ? (
                                        <video
                                            src={item.media_url}
                                            poster={item.thumbnail_url}
                                            controls
                                            className="object-cover w-full h-full"
                                        />
                                    ) : item.media_type === 'image' ? (
                                        <img
                                            src={item.media_url}
                                            alt={item.title}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            {item.thumbnail_url ? (
                                                <img
                                                    src={item.thumbnail_url}
                                                    alt={item.title}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold truncate">{item.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                                    
                                    <div className="mt-4 flex justify-between items-center">
                                        <div className="text-sm text-gray-500">
                                            <div>Views: {item.views_count}</div>
                                            <div>Type: {item.media_type}</div>
                                        </div>
                                        <div className="space-x-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </RoleGuard>
    )
} 