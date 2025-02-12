'use client'
import { useState, useEffect } from 'react'
import RoleGuard from '@/components/RoleGuard'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import { useParams } from 'next/navigation'

type CourseSection = {
    id: string
    course_id: string
    title: {
        en: string
        ar: string
        ckb: string
    }
    order_index: number
    created_at: string
}

type CourseVideo = {
    id: string
    section_id: string
    title: {
        en: string
        ar: string
        ckb: string
    }
    description: {
        en: string
        ar: string
        ckb: string
    }
    video_url?: string
    thumbnail_url?: string
    duration_seconds: number
    order_index: number
    created_at: string
}

export default function CourseSectionManagement() {
    const { user } = useAuth()
    const params = useParams()
    const courseId = params.courseId as string

    const [sections, setSections] = useState<CourseSection[]>([])
    const [videos, setVideos] = useState<CourseVideo[]>([])
    // @ts-ignore
    const [loading, setLoading] = useState(false)
    const [showSectionForm, setShowSectionForm] = useState(false)
    const [showVideoForm, setShowVideoForm] = useState(false)
    const [currentSection, setCurrentSection] = useState<Partial<CourseSection>>({
        title: { en: '', ar: '', ckb: '' },
        order_index: 0
    })
    const [currentVideo, setCurrentVideo] = useState<Partial<CourseVideo>>({
        title: { en: '', ar: '', ckb: '' },
        description: { en: '', ar: '', ckb: '' },
        order_index: 0,
        duration_seconds: 0,
        video_url: '',
        thumbnail_url: ''
    })
    const [isEditingSection, setIsEditingSection] = useState(false)
    const [isEditingVideo, setIsEditingVideo] = useState(false)
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        if (user && courseId) {
            loadSections()
        }
    }, [user, courseId])

    useEffect(() => {
        if (selectedSectionId) {
            loadVideos(selectedSectionId)
        }
    }, [selectedSectionId])

    const loadSections = async () => {
        try {
            const { data, error } = await supabase
                .from('course_sections')
                .select('*')
                .eq('course_id', courseId)
                .order('order_index', { ascending: true })

            if (error) throw error
            setSections(data || [])
            if (data && data.length > 0) {
                setSelectedSectionId(data[0].id)
            }
        } catch (error) {
            console.error('Error loading sections:', error)
            alert('Error loading sections. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const loadVideos = async (sectionId: string) => {
        try {
            const { data, error } = await supabase
                .from('course_videos')
                .select('*')
                .eq('section_id', sectionId)
                .order('order_index', { ascending: true })

            if (error) throw error
            setVideos(data || [])
        } catch (error) {
            console.error('Error loading videos:', error)
            alert('Error loading videos. Please try again.')
        }
    }

    const handleDeleteSection = async (sectionId: string) => {
        if (!window.confirm('Are you sure? This will delete all videos in this section.')) return

        try {
            // First delete all videos in this section
            const { error: videoError } = await supabase
                .from('course_videos')
                .delete()
                .eq('section_id', sectionId)

            if (videoError) throw videoError

            // Then delete the section
            const { error: sectionError } = await supabase
                .from('course_sections')
                .delete()
                .eq('id', sectionId)

            if (sectionError) throw sectionError

            await loadSections()
            if (selectedSectionId === sectionId) {
                setSelectedSectionId(null)
                setVideos([])
            }
        } catch (error) {
            console.error('Error deleting section:', error)
            alert('Error deleting section. Please try again.')
        }
    }

    const handleDeleteVideo = async (videoId: string) => {
        if (!window.confirm('Are you sure you want to delete this video?')) return

        try {
            const { error } = await supabase
                .from('course_videos')
                .delete()
                .eq('id', videoId)

            if (error) throw error

            if (selectedSectionId) {
                await loadVideos(selectedSectionId)
            }
        } catch (error) {
            console.error('Error deleting video:', error)
            alert('Error deleting video. Please try again.')
        }
    }

    const handleSectionSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (isEditingSection && currentSection.id) {
                // Update existing section
                const { error } = await supabase
                    .from('course_sections')
                    .update({
                        title: currentSection.title,
                        order_index: currentSection.order_index
                    })
                    .eq('id', currentSection.id)

                if (error) throw error
            } else {
                // Create new section
                const { error } = await supabase
                    .from('course_sections')
                    .insert([{
                        course_id: courseId,
                        title: currentSection.title,
                        order_index: currentSection.order_index || 0,
                        created_at: new Date().toISOString()
                    }])

                if (error) throw error
            }

            await loadSections()
            setShowSectionForm(false)
            setCurrentSection({
                title: { en: '', ar: '', ckb: '' },
                order_index: 0
            })
            setIsEditingSection(false)
        } catch (error) {
            console.error('Error saving section:', error)
            alert('Error saving section. Please try again.')
        }
    }

    const resetSectionForm = () => {
        setCurrentSection({
            title: { en: '', ar: '', ckb: '' },
            order_index: 0
        })
        setIsEditingSection(false)
        setShowSectionForm(false)
    }

    const resetVideoForm = () => {
        setCurrentVideo({
            title: { en: '', ar: '', ckb: '' },
            description: { en: '', ar: '', ckb: '' },
            order_index: videos.length,
            duration_seconds: 0,
            video_url: '',
            thumbnail_url: ''
        })
        setIsEditingVideo(false)
        setShowVideoForm(false)
    }

    const handleVideoSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (!selectedSectionId) {
                throw new Error('Please select a section first')
            }

            if (isEditingVideo && currentVideo.id) {
                // Update existing video
                const { error } = await supabase
                    .from('course_videos')
                    .update({
                        title: currentVideo.title,
                        description: currentVideo.description,
                        video_url: currentVideo.video_url,
                        thumbnail_url: currentVideo.thumbnail_url,
                        duration_seconds: currentVideo.duration_seconds,
                        order_index: currentVideo.order_index
                    })
                    .eq('id', currentVideo.id)

                if (error) throw error
            } else {
                // Create new video
                const { error } = await supabase
                    .from('course_videos')
                    .insert([{
                        section_id: selectedSectionId,
                        title: currentVideo.title,
                        description: currentVideo.description,
                        video_url: currentVideo.video_url,
                        thumbnail_url: currentVideo.thumbnail_url,
                        duration_seconds: currentVideo.duration_seconds || 0,
                        order_index: currentVideo.order_index || videos.length,
                        created_at: new Date().toISOString()
                    }])

                if (error) throw error
            }

            await loadVideos(selectedSectionId)
            resetVideoForm()
            alert(isEditingVideo ? 'Video updated successfully!' : 'Video created successfully!')
        } catch (error) {
            console.error('Error saving video:', error)
            alert('Error saving video. Please try again.')
        }
    }

    // Update the handleFileUpload function to handle video files
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'thumbnail') => {
        try {
            setUploading(true)
            
            if (!e.target.files || e.target.files.length === 0) {
                throw new Error('You must select a file to upload.')
            }

            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}.${fileExt}`
            const filePath = `${user?.id}/${type}/${fileName}`

            // Validate file type
            if (type === 'video' && !file.type.startsWith('video/')) {
                throw new Error('Please upload a video file')
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

            // Update form state based on file type
            if (type === 'video') {
                setCurrentVideo({
                    ...currentVideo,
                    video_url: publicUrl
                })
            } else {
                setCurrentVideo({
                    ...currentVideo,
                    thumbnail_url: publicUrl
                })
            }

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
                {/* Sections Management */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Course Sections</h2>
                        <button
                            onClick={() => setShowSectionForm(true)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Add Section
                        </button>
                    </div>

                    {/* Section Form */}
                    {showSectionForm && (
                        <div className="mb-6 bg-white shadow rounded-lg p-4">
                            <form onSubmit={handleSectionSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Title (English)</label>
                                        <input
                                            type="text"
                                            value={currentSection.title?.en || ''}
                                            onChange={(e) => setCurrentSection({
                                                ...currentSection,
                                                title: { ...currentSection.title, en: e.target.value }
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Title (Arabic)</label>
                                        <input
                                            type="text"
                                            value={currentSection.title?.ar || ''}
                                            onChange={(e) => setCurrentSection({
                                                ...currentSection,
                                                title: { ...currentSection.title, ar: e.target.value }
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
                                            value={currentSection.title?.ckb || ''}
                                            onChange={(e) => setCurrentSection({
                                                ...currentSection,
                                                title: { ...currentSection.title, ckb: e.target.value }
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                            dir="rtl"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={resetSectionForm}
                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    >
                                        {isEditingSection ? 'Update' : 'Create'} Section
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Sections List */}
                    <div className="bg-white shadow rounded-lg">
                        {sections.map((section) => (
                            <div 
                                key={section.id}
                                className={`p-4 border-b last:border-b-0 ${selectedSectionId === section.id ? 'bg-blue-50' : ''}`}
                            >
                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={() => setSelectedSectionId(section.id)}
                                        className="text-left flex-grow"
                                    >
                                        <h3 className="font-medium">{section.title.en}</h3>
                                        <p className="text-sm text-gray-500">{section.title.ar}</p>
                                    </button>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                setCurrentSection(section)
                                                setIsEditingSection(true)
                                                setShowSectionForm(true)
                                            }}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSection(section.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Videos Management */}
                {selectedSectionId && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Section Videos</h2>
                            <button
                                onClick={() => setShowVideoForm(true)}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                Add Video
                            </button>
                        </div>

                        {/* Video Form */}
                        {showVideoForm && (
                            <div className="mb-6 bg-white shadow rounded-lg p-4">
                                <form onSubmit={handleVideoSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Title (English)</label>
                                            <input
                                                type="text"
                                                value={currentVideo.title?.en || ''}
                                                onChange={(e) => setCurrentVideo({
                                                    ...currentVideo,
                                                    title: { ...currentVideo.title, en: e.target.value }
                                                })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Title (Arabic)</label>
                                            <input
                                                type="text"
                                                value={currentVideo.title?.ar || ''}
                                                onChange={(e) => setCurrentVideo({
                                                    ...currentVideo,
                                                    title: { ...currentVideo.title, ar: e.target.value }
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
                                                value={currentVideo.title?.ckb || ''}
                                                onChange={(e) => setCurrentVideo({
                                                    ...currentVideo,
                                                    title: { ...currentVideo.title, ckb: e.target.value }
                                                })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required
                                                dir="rtl"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Description (English)</label>
                                            <textarea
                                                value={currentVideo.description?.en || ''}
                                                onChange={(e) => setCurrentVideo({
                                                    ...currentVideo,
                                                    description: { ...currentVideo.description, en: e.target.value }
                                                })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                rows={3}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Description (Arabic)</label>
                                            <textarea
                                                value={currentVideo.description?.ar || ''}
                                                onChange={(e) => setCurrentVideo({
                                                    ...currentVideo,
                                                    description: { ...currentVideo.description, ar: e.target.value }
                                                })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                rows={3}
                                                required
                                                dir="rtl"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Description (Kurdish)</label>
                                            <textarea
                                                value={currentVideo.description?.ckb || ''}
                                                onChange={(e) => setCurrentVideo({
                                                    ...currentVideo,
                                                    description: { ...currentVideo.description, ckb: e.target.value }
                                                })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                rows={3}
                                                required
                                                dir="rtl"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Video File</label>
                                            <input
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => handleFileUpload(e, 'video')}
                                                className="mt-1 block w-full text-sm text-gray-500
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-md file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-blue-50 file:text-blue-700
                                                    hover:file:bg-blue-100"
                                                disabled={uploading}
                                            />
                                            {currentVideo.video_url && (
                                                <video 
                                                    src={currentVideo.video_url} 
                                                    className="mt-2 max-h-40 rounded"
                                                    controls
                                                />
                                            )}
                                        </div>

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
                                            {uploading && <p className="mt-2 text-sm text-gray-500">Uploading thumbnail...</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Duration (seconds)</label>
                                            <input
                                                type="number"
                                                value={currentVideo.duration_seconds || 0}
                                                onChange={(e) => setCurrentVideo({
                                                    ...currentVideo,
                                                    duration_seconds: parseInt(e.target.value)
                                                })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                min="0"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={resetVideoForm}
                                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                            disabled={uploading}
                                        >
                                            {isEditingVideo ? 'Update' : 'Create'} Video
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Videos List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {videos.map((video) => (
                                <div key={video.id} className="bg-white shadow rounded-lg overflow-hidden">
                                    <div className="aspect-w-16 aspect-h-9">
                                        {video.thumbnail_url ? (
                                            <img
                                                src={video.thumbnail_url}
                                                alt={video.title.en}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center bg-gray-100">
                                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-lg mb-1">{video.title.en}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{video.description.en}</p>
                                        <div className="flex justify-between items-center text-sm text-gray-500">
                                            <span>Duration: {video.duration_seconds}s</span>
                                            <div className="space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setCurrentVideo(video)
                                                        setIsEditingVideo(true)
                                                        setShowVideoForm(true)
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteVideo(video.id)}
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
                    </div>
                )}
            </div>
        </RoleGuard>
    )
} 