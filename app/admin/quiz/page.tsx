'use client'
import { useState, useEffect } from 'react'
import RoleGuard from '@/components/RoleGuard'
import { supabase } from '@/lib/supabase'

type QuizQuestion = {
    id: string
    question: {
        en: string
        ar: string
        ckb: string
    }
    options: {
        en: string[]
        ar: string[]
        ckb: string[]
    }
    correct_option: number
    points: number
    difficulty: 'easy' | 'medium' | 'hard'
    created_at: string
    image_url?: string
}

export default function QuizManagement() {
    const [questions, setQuestions] = useState<QuizQuestion[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [currentQuestion, setCurrentQuestion] = useState<Partial<QuizQuestion>>({
        question: { en: '', ar: '', ckb: '' },
        options: { 
            en: ['', '', '', ''], 
            ar: ['', '', '', ''], 
            ckb: ['', '', '', ''] 
        },
        correct_option: 0,
        points: 1,
        difficulty: 'medium',
        image_url: ''
    })
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        loadQuestions()
    }, [])

    const loadQuestions = async () => {
        try {
            const { data, error } = await supabase
                .from('quiz_questions')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setQuestions(data || [])
        } catch (error) {
            console.error('Error loading questions:', error)
            alert('Error loading questions. Please try again.')
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
            if (!file.type.startsWith('image/')) {
                throw new Error('Please upload an image file')
            }

            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}.${fileExt}`
            const filePath = `quiz-images/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('course-content')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('course-content')
                .getPublicUrl(filePath)

            setCurrentQuestion({
                ...currentQuestion,
                image_url: publicUrl
            })

        } catch (error) {
            console.error('Error uploading image:', error)
            alert(error instanceof Error ? error.message : 'Error uploading image')
        } finally {
            setUploading(false)
        }
    }

    const handleOptionChange = (language: 'en' | 'ar' | 'ckb', index: number, value: string) => {
        const newOptions = {
            en: [...(currentQuestion.options?.en || ['', '', '', ''])],
            ar: [...(currentQuestion.options?.ar || ['', '', '', ''])],
            ckb: [...(currentQuestion.options?.ckb || ['', '', '', ''])]
        }
        newOptions[language][index] = value
        setCurrentQuestion({
            ...currentQuestion,
            options: newOptions
        })
    }

    const handleQuestionChange = (language: 'en' | 'ar' | 'ckb', value: string) => {
        setCurrentQuestion({
            ...currentQuestion,
            question: {
                en: currentQuestion.question?.en || '',
                ar: currentQuestion.question?.ar || '',
                ckb: currentQuestion.question?.ckb || '',
                [language]: value
            }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (isEditing && currentQuestion.id) {
                const { error } = await supabase
                    .from('quiz_questions')
                    .update({
                        question: currentQuestion.question,
                        options: currentQuestion.options,
                        correct_option: currentQuestion.correct_option,
                        points: currentQuestion.points,
                        difficulty: currentQuestion.difficulty,
                        image_url: currentQuestion.image_url
                    })
                    .eq('id', currentQuestion.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('quiz_questions')
                    .insert([{
                        question: currentQuestion.question,
                        options: currentQuestion.options,
                        correct_option: currentQuestion.correct_option,
                        points: currentQuestion.points,
                        difficulty: currentQuestion.difficulty,
                        image_url: currentQuestion.image_url,
                        created_at: new Date().toISOString()
                    }])

                if (error) throw error
            }

            await loadQuestions()
            resetForm()
            alert(isEditing ? 'Question updated successfully!' : 'Question created successfully!')
        } catch (error) {
            console.error('Error saving question:', error)
            alert('Error saving question. Please try again.')
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return

        try {
            const { error } = await supabase
                .from('quiz_questions')
                .delete()
                .eq('id', id)

            if (error) throw error

            await loadQuestions()
        } catch (error) {
            console.error('Error deleting question:', error)
            alert('Error deleting question. Please try again.')
        }
    }

    const resetForm = () => {
        setCurrentQuestion({
            question: { en: '', ar: '', ckb: '' },
            options: { 
                en: ['', '', '', ''], 
                ar: ['', '', '', ''], 
                ckb: ['', '', '', ''] 
            },
            correct_option: 0,
            points: 1,
            difficulty: 'medium',
            image_url: ''
        })
        setIsEditing(false)
        setShowForm(false)
    }

    return (
        <RoleGuard allowedRoles={['admin']}>
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Quiz Questions Management</h1>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Add Question
                    </button>
                </div>

                {showForm && (
                    <div className="mb-8 bg-white shadow rounded-lg p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Question fields */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Question (English)</label>
                                    <input
                                        type="text"
                                        value={currentQuestion.question?.en || ''}
                                        onChange={(e) => handleQuestionChange('en', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Question (Arabic)</label>
                                    <input
                                        type="text"
                                        value={currentQuestion.question?.ar || ''}
                                        onChange={(e) => handleQuestionChange('ar', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                        dir="rtl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Question (Kurdish)</label>
                                    <input
                                        type="text"
                                        value={currentQuestion.question?.ckb || ''}
                                        onChange={(e) => handleQuestionChange('ckb', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                        dir="rtl"
                                    />
                                </div>
                            </div>

                            {/* Options fields */}
                            {[0, 1, 2, 3].map((index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Option {index + 1} (English)
                                            {currentQuestion.correct_option === index && ' (Correct)'}
                                        </label>
                                        <input
                                            type="text"
                                            value={currentQuestion.options?.en[index] || ''}
                                            onChange={(e) => handleOptionChange('en', index, e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Option {index + 1} (Arabic)
                                        </label>
                                        <input
                                            type="text"
                                            value={currentQuestion.options?.ar[index] || ''}
                                            onChange={(e) => handleOptionChange('ar', index, e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                            dir="rtl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Option {index + 1} (Kurdish)
                                        </label>
                                        <input
                                            type="text"
                                            value={currentQuestion.options?.ckb[index] || ''}
                                            onChange={(e) => handleOptionChange('ckb', index, e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                            dir="rtl"
                                        />
                                    </div>
                                </div>
                            ))}

                            {/* Other fields */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Correct Option</label>
                                    <select
                                        value={currentQuestion.correct_option}
                                        onChange={(e) => setCurrentQuestion({
                                            ...currentQuestion,
                                            correct_option: parseInt(e.target.value)
                                        })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        {[0, 1, 2, 3].map((index) => (
                                            <option key={index} value={index}>
                                                Option {index + 1}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Points</label>
                                    <input
                                        type="number"
                                        value={currentQuestion.points || 1}
                                        onChange={(e) => setCurrentQuestion({
                                            ...currentQuestion,
                                            points: parseInt(e.target.value)
                                        })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        min="1"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                                    <select
                                        value={currentQuestion.difficulty}
                                        onChange={(e) => setCurrentQuestion({
                                            ...currentQuestion,
                                            difficulty: e.target.value as 'easy' | 'medium' | 'hard'
                                        })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            {/* Image upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Question Image</label>
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
                                {currentQuestion.image_url && (
                                    <img
                                        src={currentQuestion.image_url}
                                        alt="Question"
                                        className="mt-2 max-h-40 rounded"
                                    />
                                )}
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    disabled={uploading}
                                >
                                    {isEditing ? 'Update' : 'Create'} Question
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Questions List */}
                {loading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : questions.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                        No questions found. Click "Add Question" to get started.
                    </div>
                ) : (
                    <div className="bg-white shadow rounded-lg divide-y">
                        {questions.map((question) => (
                            <div key={question.id} className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-grow">
                                        <h3 className="font-medium">{question.question?.en}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{question.question?.ar}</p>
                                        <p className="text-sm text-gray-500">{question.question?.ckb}</p>
                                        
                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                            {question.options?.en?.map((option, index) => (
                                                <div
                                                    key={index}
                                                    className={`text-sm p-2 rounded ${
                                                        index === question.correct_option
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100'
                                                    }`}
                                                >
                                                    {option}
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {question.image_url && (
                                            <img 
                                                src={question.image_url} 
                                                alt="Question" 
                                                className="mt-2 max-h-40 rounded"
                                            />
                                        )}
                                        
                                        <div className="mt-2 flex space-x-4 text-sm text-gray-500">
                                            <span>Points: {question.points}</span>
                                            <span>Difficulty: {question.difficulty}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                setCurrentQuestion(question)
                                                setIsEditing(true)
                                                setShowForm(true)
                                            }}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(question.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-sm text-gray-500">Don&apos;t forget to add &quot;correct&quot; answers for each question</p>
            </div>
        </RoleGuard>
    )
} 