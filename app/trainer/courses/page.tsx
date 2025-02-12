'use client'
import { useState, useEffect } from 'react'
import RoleGuard from '@/components/RoleGuard'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import Link from 'next/link'

// Add CourseType type
type CourseType = 'free' | 'premium' | 'regular';

// Add at the top with other type definitions
type MultilingualField = {
    en: string;
    ar: string;
    ckb: string;
}

// Update Course type
type Course = {
    id: string
    trainer_id: string
    title: MultilingualField
    description: MultilingualField
    trailer_url?: string
    thumbnail_url?: string // Add this missing field
    course_type: CourseType
    order_index?: number
    price_iqd?: number
    original_price_iqd?: number
    learning_points?: {
        en: string[]
        ar: string[]
        ckb: string[]
    }
    total_sections?: number
    created_at: string
}

// Add course type options for the form
const courseTypeOptions: CourseType[] = ['free', 'premium', 'regular'];

export default function CourseManagement() {
    const { user } = useAuth()
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [currentCourse, setCurrentCourse] = useState<Partial<Course>>({
        title: { en: '', ar: '', ckb: '' } as MultilingualField,
        description: { en: '', ar: '', ckb: '' } as MultilingualField,
        learning_points: { en: [], ar: [], ckb: [] },
        price_iqd: 0,
        original_price_iqd: 0,
        order_index: 0,
        course_type: 'regular' as CourseType
    })
    const [isEditing, setIsEditing] = useState(false)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        if (user) {
            loadCourses()
        }
    }, [user])

    const loadCourses = async () => {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('trainer_id', user?.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setCourses(data || [])
        } catch (error) {
            console.error('Error loading courses:', error)
            alert('Error loading courses. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (isEditing && currentCourse.id) {
                const { error } = await supabase
                    .from('courses')
                    .update({
                        title: currentCourse.title,
                        description: currentCourse.description,
                        trailer_url: currentCourse.trailer_url || null,
                        course_type: currentCourse.course_type || 'regular',
                        order_index: currentCourse.order_index || 0,
                        price_iqd: currentCourse.price_iqd || 0,
                        original_price_iqd: currentCourse.original_price_iqd || 0,
                        learning_points: currentCourse.learning_points || { en: [], ar: [], ckb: [] }
                    })
                    .eq('id', currentCourse.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('courses')
                    .insert([{
                        trainer_id: user?.id,
                        title: currentCourse.title,
                        description: currentCourse.description,
                        trailer_url: currentCourse.trailer_url || null,
                        course_type: currentCourse.course_type || 'regular',
                        order_index: currentCourse.order_index || 0,
                        price_iqd: currentCourse.price_iqd || 0,
                        original_price_iqd: currentCourse.original_price_iqd || 0,
                        learning_points: currentCourse.learning_points || { en: [], ar: [], ckb: [] },
                        total_sections: 0,
                        created_at: new Date().toISOString()
                    }])

                if (error) throw error
            }

            await loadCourses()
            resetForm()
            alert(isEditing ? 'Course updated successfully!' : 'Course created successfully!')
        } catch (error) {
            console.error('Error saving course:', error)
            alert('Error saving course. Please try again.')
        }
    }

    const resetForm = () => {
        setCurrentCourse({
            title: { en: '', ar: '', ckb: '' } as MultilingualField,
            description: { en: '', ar: '', ckb: '' } as MultilingualField,
            learning_points: { en: [], ar: [], ckb: [] },
            price_iqd: 0,
            original_price_iqd: 0,
            order_index: 0,
            course_type: 'regular' as CourseType
        })
        setIsEditing(false)
        setShowForm(false)
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'trailer' | 'thumbnail') => {
        try {
            setUploading(true)
            
            if (!e.target.files || e.target.files.length === 0) {
                throw new Error('You must select a file to upload.')
            }

            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}.${fileExt}`
            const filePath = `${user?.id}/${type}/${fileName}`

            if (type === 'trailer' && !file.type.startsWith('video/')) {
                throw new Error('Please upload a video file for the trailer')
            }
            if (type === 'thumbnail' && !file.type.startsWith('image/')) {
                throw new Error('Please upload an image file for the thumbnail')
            }

            const { error: uploadError } = await supabase.storage
                .from('course-content')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('course-content')
                .getPublicUrl(filePath)

            setCurrentCourse({
                ...currentCourse,
                [type === 'trailer' ? 'trailer_url' : 'thumbnail_url']: publicUrl
            })

        } catch (error) {
            console.error('Error uploading file:', error)
            alert(error instanceof Error ? error.message : 'Error uploading file')
        } finally {
            setUploading(false)
        }
    }

    return (
        <RoleGuard allowedRoles={['trainer']}>
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Course Management</h1>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Add New Course
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="mb-8 bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                {isEditing ? 'Edit Course' : 'Add New Course'}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title (English)</label>
                                    <input
                                        type="text"
                                        value={currentCourse.title?.en || ''}
                                        onChange={(e) => setCurrentCourse({
                                            ...currentCourse,
                                            title: { ...currentCourse.title, en: e.target.value }
                                        })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title (Arabic)</label>
                                    <input
                                        type="text"
                                        value={currentCourse.title?.ar || ''}
                                        onChange={(e) => setCurrentCourse({
                                            ...currentCourse,
                                            title: { ...currentCourse.title, ar: e.target.value }
                                        })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                        dir="rtl"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title (Kurdish)</label>
                                    <input
                                        type="text"
                                        value={currentCourse.title?.ckb || ''}
                                        onChange={(e) => setCurrentCourse({
                                            ...currentCourse,
                                            title: { ...currentCourse.title, ckb: e.target.value }
                                        })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                        dir="rtl"
                                    />
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Description (English)</label>
                                    <textarea
                                        value={currentCourse.description?.en || ''}
                                        onChange={(e) => setCurrentCourse({
                                            ...currentCourse,
                                            description: { ...currentCourse.description, en: e.target.value }
                                        })}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Description (Arabic)</label>
                                    <textarea
                                        value={currentCourse.description?.ar || ''}
                                        onChange={(e) => setCurrentCourse({
                                            ...currentCourse,
                                            description: { ...currentCourse.description, ar: e.target.value }
                                        })}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                        dir="rtl"
                                    />
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Description (Kurdish)</label>
                                    <textarea
                                        value={currentCourse.description?.ckb || ''}
                                        onChange={(e) => setCurrentCourse({
                                            ...currentCourse,
                                            description: { ...currentCourse.description, ckb: e.target.value }
                                        })}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                        dir="rtl"
                                    />
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Trailer Video</label>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => handleFileUpload(e, 'trailer')}
                                        className="mt-1 block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-md file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-blue-50 file:text-blue-700
                                            hover:file:bg-blue-100"
                                        disabled={uploading}
                                    />
                                    {currentCourse.trailer_url && (
                                        <video 
                                            src={currentCourse.trailer_url} 
                                            className="mt-2 max-h-40 rounded"
                                            controls
                                        />
                                    )}
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Course Thumbnail</label>
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
                                    {currentCourse.thumbnail_url && (
                                        <img 
                                            src={currentCourse.thumbnail_url} 
                                            alt="Course thumbnail" 
                                            className="mt-2 max-h-40 rounded"
                                        />
                                    )}
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Course Type</label>
                                    <select
                                        value={currentCourse.course_type || 'regular'}
                                        onChange={(e) => setCurrentCourse({
                                            ...currentCourse,
                                            course_type: e.target.value as CourseType
                                        })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        {courseTypeOptions.map(type => (
                                            <option key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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

                {/* Courses List */}
                {loading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                        No courses found. Click &quot;Add New Course&quot; to get started.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div key={course.id} className="bg-white shadow rounded-lg overflow-hidden">
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold">{course.title.en}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{course.description.en}</p>
                                    <div className="mt-4 flex justify-between items-center">
                                        <Link
                                            href={`/trainer/courses/${course.id}`}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Manage Sections
                                        </Link>
                                        <div className="space-x-2">
                                            <button
                                                onClick={() => {
                                                    setCurrentCourse(course)
                                                    setIsEditing(true)
                                                    setShowForm(true)
                                                }}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Edit
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