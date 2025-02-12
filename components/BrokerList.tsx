'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Broker {
  id: string
  name: string
  address: string
  established_date: string
  description: string
  logo_url: string
  average_rating: number
  total_ratings: number
  username: string
  website: string
  email: string
  contact_phone: string
  latitude: number
  longitude: number
  profile_views: number
}

export default function BrokerList() {
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Broker>>({
    name: '',
    address: '',
    established_date: '',
    description: '',
    logo_url: '',
    website: '',
    email: '',
    contact_phone: '',
    username: ''
  })

  // Fetch brokers
  const fetchBrokers = async () => {
    try {
      const { data, error } = await supabase
        .from('brokers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBrokers(data || [])
    } catch (error) {
      console.error('Error fetching brokers:', error)
    } finally {
      setLoading(false)
    }
  }

  // Add broker
  const addBroker = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('brokers')
        .insert([formData])

      if (error) throw error

      fetchBrokers()
      setFormData({
        name: '',
        address: '',
        established_date: '',
        description: '',
        logo_url: '',
        website: '',
        email: '',
        contact_phone: '',
        username: ''
      })
    } catch (error) {
      console.error('Error adding broker:', error)
    }
  }

  // Update broker
  const updateBroker = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return

    try {
      const { error } = await supabase
        .from('brokers')
        .update(formData)
        .eq('id', editingId)

      if (error) throw error

      fetchBrokers()
      setEditingId(null)
      setFormData({
        name: '',
        address: '',
        established_date: '',
        description: '',
        logo_url: '',
        website: '',
        email: '',
        contact_phone: '',
        username: ''
      })
    } catch (error) {
      console.error('Error updating broker:', error)
    }
  }

  // Delete broker
  const deleteBroker = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this broker?')) return

    try {
      const { error } = await supabase
        .from('brokers')
        .delete()
        .eq('id', id)

      if (error) throw error

      fetchBrokers()
    } catch (error) {
      console.error('Error deleting broker:', error)
    }
  }

  // Start editing a broker
  const startEdit = (broker: Broker) => {
    setEditingId(broker.id)
    setFormData({
      name: broker.name,
      address: broker.address,
      established_date: broker.established_date,
      description: broker.description,
      logo_url: broker.logo_url,
      website: broker.website,
      email: broker.email,
      contact_phone: broker.contact_phone,
      username: broker.username
    })
  }

  useEffect(() => {
    fetchBrokers()
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
      <h2 className="text-3xl font-bold mb-8">Broker Management</h2>

      {/* Add/Edit Form */}
      <form onSubmit={editingId ? updateBroker : addBroker} className="mb-8 space-y-4 bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">{editingId ? 'Edit Broker' : 'Add New Broker'}</h3>
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
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Established Date</label>
            <input
              type="date"
              value={formData.established_date}
              onChange={(e) => setFormData({ ...formData, established_date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Logo URL</label>
            <input
              type="url"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
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
                  address: '',
                  established_date: '',
                  description: '',
                  logo_url: '',
                  website: '',
                  email: '',
                  contact_phone: '',
                  username: ''
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
            {editingId ? 'Update Broker' : 'Add Broker'}
          </button>
        </div>
      </form>

      {/* Brokers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brokers.map((broker) => (
          <div key={broker.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{broker.name}</h3>
                <p className="text-gray-600">@{broker.username}</p>
              </div>
              {broker.logo_url && (
                <img
                  src={broker.logo_url}
                  alt={`${broker.name} logo`}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
            </div>
            <div className="space-y-2 mb-4">
              <p className="text-gray-600">{broker.email}</p>
              <p className="text-gray-600">{broker.contact_phone}</p>
              <p className="text-gray-600">{broker.address}</p>
              {broker.website && (
                <a
                  href={broker.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Website
                </a>
              )}
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Rating: {broker.average_rating?.toFixed(1)} ({broker.total_ratings})
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => startEdit(broker)}
                  className="px-3 py-1 text-blue-500 hover:bg-blue-50 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteBroker(broker.id)}
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