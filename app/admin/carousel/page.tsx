'use client'
import { useState, useEffect } from 'react'
import RoleGuard from '@/components/RoleGuard'
import { supabase } from '@/lib/supabase'

interface Title {
    en: string;
    ar: string;
    ckb: string;
}

type CarouselItem = {
    id: string
    title: Title
    image_url: string
    link: string
    is_external: boolean
    active: boolean
    display_order: number
    created_at: string
}

export default function CarouselManagement() {
    const [items, setItems] = useState<CarouselItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [currentItem, setCurrentItem] = useState<Partial<CarouselItem>>({
        title: { en: '', ar: '', ckb: '' },
        is_external: false,
        active: true,
        display_order: 0
    })
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        loadItems()
    }, [])

    const loadItems = async () => {
        try {
            const { data, error } = await supabase
                .from('carousel_items')
                .select('*')
                .order('display_order', { ascending: true })

            if (error) throw error
            setItems(data || [])
        } catch (error) {
            console.error('Error loading carousel items:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (item: CarouselItem) => {
        setCurrentItem(item)
        setIsEditing(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (isEditing && currentItem.id) {
                // Update existing item
                const { error } = await supabase
                    .from('carousel_items')
                    .update({
                        title: currentItem.title,
                        image_url: currentItem.image_url,
                        link: currentItem.link,
                        is_external: currentItem.is_external,
                        active: currentItem.active,
                        display_order: currentItem.display_order
                    })
                    .eq('id', currentItem.id)

                if (error) throw error
            } else {
                // Create new item
                const { error } = await supabase
                    .from('carousel_items')
                    .insert([{
                        title: currentItem.title,
                        image_url: currentItem.image_url,
                        link: currentItem.link,
                        is_external: currentItem.is_external,
                        active: currentItem.active,
                        display_order: currentItem.display_order
                    }])

                if (error) throw error
            }

            await loadItems()
            setIsEditing(false)
            setCurrentItem({
                title: { en: '', ar: '', ckb: '' },
                is_external: false,
                active: true,
                display_order: 0
            })
            alert(isEditing ? 'Item updated successfully!' : 'New item added successfully!')
        } catch (error) {
            console.error('Error saving carousel item:', error)
            alert('Error saving item. Please try again.')
        }
    }

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                const { error } = await supabase
                    .from('carousel_items')
                    .delete()
                    .eq('id', id)

                if (error) throw error
                await loadItems()
            } catch (error) {
                console.error('Error deleting carousel item:', error)
            }
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
            const { error: uploadError } = await supabase.storage
                .from('carousel')  // Your bucket name
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('carousel')
                .getPublicUrl(filePath)

            // Update form state with the URL
            setCurrentItem({
                ...currentItem,
                image_url: publicUrl
            })

        } catch (error) {
            console.error('Error uploading image:', error)
            alert('Error uploading image!')
        } finally {
            setUploading(false)
        }
    }

    return (
        <RoleGuard allowedRoles={['admin']}>
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Carousel Management</h1>
                    <button
                        onClick={() => {
                            setIsEditing(false)
                            setCurrentItem({
                                title: { en: '', ar: '', ckb: '' },
                                is_external: false,
                                active: true,
                                display_order: items.length
                            })
                        }}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Add New Item
                    </button>
                </div>

                {/* Form for adding/editing items */}
                {(isEditing || Object.keys(currentItem).length > 1) && (
                    <div className="mb-8 bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            {isEditing ? 'Edit Carousel Item' : 'Add New Carousel Item'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Title Fields */}
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Title (English)</label>
                                        <input
                                            type="text"
                                            value={currentItem.title?.en || ''}
                                            onChange={(e) => setCurrentItem({
                                                ...currentItem,
                                                title: { 
                                                    en: e.target.value,
                                                    ar: currentItem.title?.ar || '',
                                                    ckb: currentItem.title?.ckb || ''
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Title (Arabic)</label>
                                        <input
                                            type="text"
                                            value={currentItem.title?.ar || ''}
                                            onChange={(e) => setCurrentItem({
                                                ...currentItem,
                                                title: { 
                                                    en: currentItem.title?.en || '',
                                                    ar: e.target.value,
                                                    ckb: currentItem.title?.ckb || ''
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Title (Kurdish)</label>
                                        <input
                                            type="text"
                                            value={currentItem.title?.ckb || ''}
                                            onChange={(e) => setCurrentItem({
                                                ...currentItem,
                                                title: { 
                                                    en: currentItem.title?.en || '',
                                                    ar: currentItem.title?.ar || '',
                                                    ckb: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Image</label>
                                    <div className="mt-1 flex items-center space-x-4">
                                        {currentItem.image_url && (
                                            <img
                                                src={currentItem.image_url}
                                                alt="Preview"
                                                className="h-20 w-32 object-cover rounded"
                                            />
                                        )}
                                        <div className="flex-1">
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
                                            {uploading && (
                                                <div className="mt-1 text-sm text-gray-500">
                                                    Uploading...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        type="hidden"
                                        value={currentItem.image_url || ''}
                                        onChange={(e) => setCurrentItem({...currentItem, image_url: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Link</label>
                                    <input
                                        type="text"
                                        value={currentItem.link || ''}
                                        onChange={(e) => setCurrentItem({...currentItem, link: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Display Order</label>
                                    <input
                                        type="number"
                                        value={currentItem.display_order || 0}
                                        onChange={(e) => setCurrentItem({...currentItem, display_order: parseInt(e.target.value)})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={currentItem.is_external}
                                            onChange={(e) => setCurrentItem({...currentItem, is_external: e.target.checked})}
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        />
                                        <span className="ml-2">External Link</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={currentItem.active}
                                            onChange={(e) => setCurrentItem({...currentItem, active: e.target.checked})}
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        />
                                        <span className="ml-2">Active</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false)
                                        setCurrentItem({
                                            title: { en: '', ar: '', ckb: '' },
                                            is_external: false,
                                            active: true,
                                            display_order: 0
                                        })
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

                {/* Items List */}
                {loading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Image
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                EN: {item.title.en}<br />
                                                AR: {item.title.ar}<br />
                                                ckb: {item.title.ckb}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <img 
                                                src={item.image_url} 
                                                alt={item.title.en}
                                                className="h-20 w-32 object-cover rounded"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.display_order}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                item.active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {item.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
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