'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Trainer {
  id: string
  name: string
  experience_years: number
  bio: string
  image_url: string
  rating: number
  position: string
  website_url: string
  twitter_url: string
  facebook_url: string
  linkedin_url: string
  youtube_url: string
}

export default function TrainerList() {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Trainer>>({
    name: '',
    experience_years: 0,
    bio: '',
    image_url: '',
    position: '',
    website_url: '',
    twitter_url: '',
    facebook_url: '',
    linkedin_url: '',
    youtube_url: ''
  })

  // Fetch trainers
  const fetchTrainers = async () => {
    try {
      const { data, error } = await supabase
        .from('trainers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTrainers(data || [])
    } catch (error) {
      console.error('Error fetching trainers:', error)
    } finally {
      setLoading(false)
    }
  }

  // Add trainer
  const addTrainer = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('trainers')
        .insert([formData])

      if (error) throw error

      fetchTrainers()
      setFormData({
        name: '',
        experience_years: 0,
        bio: '',
        image_url: '',
        position: '',
        website_url: '',
        twitter_url: '',
        facebook_url: '',
        linkedin_url: '',
        youtube_url: ''
      })
    } catch (error) {
      console.error('Error adding trainer:', error)
    }
  }

  // Update trainer
  const updateTrainer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return

    try {
      const { error } = await supabase
        .from('trainers')
        .update(formData)
        .eq('id', editingId)

      if (error) throw error

      fetchTrainers()
      setEditingId(null)
      setFormData({
        name: '',
        experience_years: 0,
        bio: '',
        image_url: '',
        position: '',
        website_url: '',
        twitter_url: '',
        facebook_url: '',
        linkedin_url: '',
        youtube_url: ''
      })
    } catch (error) {
      console.error('Error updating trainer:', error)
    }
  }

  // Delete trainer
  const deleteTrainer = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this trainer?')) return

    try {
      const { error } = await supabase
        .from('trainers')
        .delete()
        .eq('id', id)

      if (error) throw error

      fetchTrainers()
    } catch (error) {
      console.error('Error deleting trainer:', error)
    }
  }

  // Start editing a trainer
  const startEdit = (trainer: Trainer) => {
    setEditingId(trainer.id)
    setFormData({
      name: trainer.name,
      experience_years: trainer.experience_years,
      bio: trainer.bio,
      image_url: trainer.image_url,
      position: trainer.position,
      website_url: trainer.website_url,
      twitter_url: trainer.twitter_url,
      facebook_url: trainer.facebook_url,
      linkedin_url: trainer.linkedin_url,
      youtube_url: trainer.youtube_url
    })
  }

  useEffect(() => {
    fetchTrainers()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-8">Trainer Management</h2>

      {/* Add/Edit Form */}
      <form onSubmit={editingId ? updateTrainer : addTrainer} className="mb-8 space-y-4 bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">{editingId ? 'Edit Trainer' : 'Add New Trainer'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Position</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Experience (Years)</label>
            <input
              type="number"
              value={formData.experience_years}
              onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Website URL</label>
            <input
              type="url"
              value={formData.website_url}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Twitter URL</label>
            <input
              type="url"
              value={formData.twitter_url}
              onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
            <input
              type="url"
              value={formData.linkedin_url}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Facebook URL</label>
            <input
              type="url"
              value={formData.facebook_url}
              onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null)
                setFormData({
                  name: '',
                  experience_years: 0,
                  bio: '',
                  image_url: '',
                  position: '',
                  website_url: '',
                  twitter_url: '',
                  facebook_url: '',
                  linkedin_url: '',
                  youtube_url: ''
                })
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {editingId ? 'Update Trainer' : 'Add Trainer'}
          </button>
        </div>
      </form>

      {/* Trainers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.map((trainer) => (
          <div key={trainer.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{trainer.name}</h3>
                <p className="text-gray-600">{trainer.position}</p>
              </div>
              {trainer.image_url && (
                <img
                  src={trainer.image_url}
                  alt={`${trainer.name}`}
                  className="w-16 h-16 object-cover rounded-full"
                />
              )}
            </div>
            <div className="space-y-2 mb-4">
              <p className="text-gray-600">{trainer.bio}</p>
              <p className="text-gray-600">Experience: {trainer.experience_years} years</p>
              <div className="flex gap-2">
                {trainer.website_url && (
                  <a
                    href={trainer.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Website
                  </a>
                )}
                {trainer.linkedin_url && (
                  <a
                    href={trainer.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Rating: {trainer.rating?.toFixed(1)}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => startEdit(trainer)}
                  className="px-3 py-1 text-blue-500 hover:bg-blue-50 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTrainer(trainer.id)}
                  className="px-3 py-1 text-red-500 hover:bg-red-50 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 