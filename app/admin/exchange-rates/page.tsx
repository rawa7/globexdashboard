'use client'
import { useState, useEffect } from 'react'
import RoleGuard from '@/components/RoleGuard'
import { supabase } from '@/lib/supabase'

// Add this constant for city options
const IRAQI_CITIES = [
    'Erbil',
    'Sulaymaniyah',
    'Mosul',
    'Basra',
    'Baghdad',
    'Duhok'
] as const

type IraqiCity = typeof IRAQI_CITIES[number]

// Update the type to restrict city_name to only valid cities
type CityExchangeRate = {
    id: string
    city_name: IraqiCity
    usd_to_iqd_rate: number
    timestamp: string
    created_at: string
}

export default function ExchangeRatesManagement() {
    const [rates, setRates] = useState<CityExchangeRate[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [currentRate, setCurrentRate] = useState<Partial<CityExchangeRate>>({})
    const [isEditing, setIsEditing] = useState(false)
    const [selectedCity, setSelectedCity] = useState<IraqiCity | 'all'>('all')

    useEffect(() => {
        loadRates()
    }, [])

    const loadRates = async () => {
        try {
            const { data, error } = await supabase
                .from('city_exchange_rates')
                .select('*')
                .order('timestamp', { ascending: false })

            if (error) throw error
            setRates(data || [])
        } catch (error) {
            console.error('Error loading rates:', error)
            alert('Error loading exchange rates. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (!currentRate.city_name || !currentRate.usd_to_iqd_rate) {
                throw new Error('Please fill in all required fields')
            }

            const now = new Date().toISOString()
            
            if (isEditing && currentRate.id) {
                const { error } = await supabase
                    .from('city_exchange_rates')
                    .update({
                        city_name: currentRate.city_name,
                        usd_to_iqd_rate: currentRate.usd_to_iqd_rate,
                        timestamp: now
                    })
                    .eq('id', currentRate.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('city_exchange_rates')
                    .insert([{
                        city_name: currentRate.city_name,
                        usd_to_iqd_rate: currentRate.usd_to_iqd_rate,
                        timestamp: now,
                        created_at: now
                    }])

                if (error) throw error
            }

            await loadRates()
            resetForm()
            alert(isEditing ? 'Rate updated successfully!' : 'New rate added successfully!')
        } catch (error) {
            console.error('Error saving rate:', error)
            alert(error instanceof Error ? error.message : 'Error saving rate. Please try again.')
        }
    }

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this exchange rate?')) {
            try {
                const { error } = await supabase
                    .from('city_exchange_rates')
                    .delete()
                    .eq('id', id)

                if (error) throw error
                
                setRates(rates.filter(rate => rate.id !== id))
                alert('Exchange rate deleted successfully!')
            } catch (error) {
                console.error('Error deleting rate:', error)
                alert('Error deleting rate. Please try again.')
            }
        }
    }

    const resetForm = () => {
        setCurrentRate({})
        setIsEditing(false)
        setShowForm(false)
    }

    const handleEdit = (rate: CityExchangeRate) => {
        setCurrentRate(rate)
        setIsEditing(true)
        setShowForm(true)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString()
    }

    const filteredRates = selectedCity === 'all' 
        ? rates 
        : rates.filter(rate => rate.city_name === selectedCity)

    return (
        <RoleGuard allowedRoles={['admin']}>
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">City Exchange Rates Management</h1>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Add New Rate
                    </button>
                </div>

                {/* City Filter Buttons */}
                <div className="mb-6">
                    <div className="text-sm font-medium text-gray-700 mb-2">Filter by City:</div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCity('all')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                                ${selectedCity === 'all' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            All Cities
                        </button>
                        {IRAQI_CITIES.map((city) => (
                            <button
                                key={city}
                                onClick={() => setSelectedCity(city)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                                    ${selectedCity === city 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="mb-8 bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                {isEditing ? 'Edit Exchange Rate' : 'Add New Exchange Rate'}
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
                                    <label className="block text-sm font-medium text-gray-700">City Name</label>
                                    <select
                                        value={currentRate.city_name || ''}
                                        onChange={(e) => setCurrentRate({...currentRate, city_name: e.target.value as IraqiCity})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select a city</option>
                                        {IRAQI_CITIES.map((city) => (
                                            <option key={city} value={city}>
                                                {city}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">USD to IQD Rate</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={currentRate.usd_to_iqd_rate || ''}
                                        onChange={(e) => setCurrentRate({...currentRate, usd_to_iqd_rate: parseFloat(e.target.value)})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
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

                {/* Rates List */}
                {loading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : filteredRates.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                        {selectedCity === 'all' 
                            ? 'No exchange rates found. Click Add New Rate to get started.'
                            : `No exchange rates found for ${selectedCity}.`}
                    </div>
                ) : (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        City
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        USD to IQD Rate
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Updated
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created At
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRates.map((rate) => (
                                    <tr key={rate.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {rate.city_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {rate.usd_to_iqd_rate.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {formatDate(rate.timestamp)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {formatDate(rate.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(rate)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(rate.id)}
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