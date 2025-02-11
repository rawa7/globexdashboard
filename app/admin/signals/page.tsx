'use client'
import { useState, useEffect } from 'react'
import RoleGuard from '@/components/RoleGuard'
import { supabase } from '@/lib/supabase'

type Signal = {
    id: string
    type: 'buy' | 'sell'
    pair: string
    entry_price: number
    stop_loss: number
    take_profit: number
    market_analysis: {
        en: string
        ar: string
        ckb: string
    }
    status: 'active' | 'closed' | 'cancelled'
    is_premium: boolean
    created_at: string
    updated_at: string
}

// Type definitions for select values
type SignalType = 'buy' | 'sell'
type SignalStatus = 'active' | 'closed' | 'cancelled'

export default function SignalManagement() {
    const [signals, setSignals] = useState<Signal[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [currentSignal, setCurrentSignal] = useState<Partial<Signal>>({
        market_analysis: { en: '', ar: '', ckb: '' },
        is_premium: false,
        status: 'active' as SignalStatus
    })

    useEffect(() => {
        loadSignals()
    }, [])

    const loadSignals = async () => {
        try {
            const { data, error } = await supabase
                .from('signals')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setSignals(data || [])
        } catch (error) {
            console.error('Error loading signals:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (isEditing && currentSignal.id) {
                const { error } = await supabase
                    .from('signals')
                    .update({
                        ...currentSignal,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', currentSignal.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('signals')
                    .insert([{
                        ...currentSignal,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }])

                if (error) throw error
            }

            await loadSignals()
            setIsEditing(false)
            setCurrentSignal({
                market_analysis: { en: '', ar: '', ckb: '' },
                is_premium: false,
                status: 'active' as SignalStatus
            })
            alert(isEditing ? 'Signal updated successfully!' : 'New signal added successfully!')
        } catch (error) {
            console.error('Error saving signal:', error)
            alert('Error saving signal. Please try again.')
        }
    }

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this signal?')) {
            try {
                const { error } = await supabase
                    .from('signals')
                    .delete()
                    .eq('id', id)

                if (error) throw error
                await loadSignals()
            } catch (error) {
                console.error('Error deleting signal:', error)
            }
        }
    }

    return (
        <RoleGuard allowedRoles={['admin']}>
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Signal Management</h1>
                    <button
                        onClick={() => {
                            setIsEditing(false)
                            setCurrentSignal({
                                market_analysis: { en: '', ar: '', ckb: '' },
                                is_premium: false,
                                status: 'active' as SignalStatus
                            })
                        }}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Add New Signal
                    </button>
                </div>

                {/* Form */}
                {(isEditing || Object.keys(currentSignal).length > 1) && (
                    <div className="mb-8 bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            {isEditing ? 'Edit Signal' : 'Add New Signal'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                    <select
                                        value={currentSignal.type || ''}
                                        onChange={(e) => setCurrentSignal({
                                            ...currentSignal,
                                            type: e.target.value as SignalType
                                        })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        <option value="buy">Buy</option>
                                        <option value="sell">Sell</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Pair</label>
                                    <input
                                        type="text"
                                        value={currentSignal.pair || ''}
                                        onChange={(e) => setCurrentSignal({...currentSignal, pair: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Entry Price</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={currentSignal.entry_price || ''}
                                        onChange={(e) => setCurrentSignal({...currentSignal, entry_price: parseFloat(e.target.value)})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Stop Loss</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={currentSignal.stop_loss || ''}
                                        onChange={(e) => setCurrentSignal({...currentSignal, stop_loss: parseFloat(e.target.value)})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Take Profit</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={currentSignal.take_profit || ''}
                                        onChange={(e) => setCurrentSignal({...currentSignal, take_profit: parseFloat(e.target.value)})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        value={currentSignal.status || 'active'}
                                        onChange={(e) => setCurrentSignal({
                                            ...currentSignal,
                                            status: e.target.value as SignalStatus
                                        })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="active">Active</option>
                                        <option value="closed">Closed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Market Analysis (English)</label>
                                    <textarea
                                        value={currentSignal.market_analysis?.en || ''}
                                        onChange={(e) => setCurrentSignal({
                                            ...currentSignal,
                                            market_analysis: {
                                                en: e.target.value,
                                                ar: currentSignal.market_analysis?.ar || '',
                                                ckb: currentSignal.market_analysis?.ckb || ''
                                            }
                                        })}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Market Analysis (Arabic)</label>
                                    <textarea
                                        value={currentSignal.market_analysis?.ar || ''}
                                        onChange={(e) => setCurrentSignal({
                                            ...currentSignal,
                                            market_analysis: {
                                                en: currentSignal.market_analysis?.en || '',
                                                ar: e.target.value,
                                                ckb: currentSignal.market_analysis?.ckb || ''
                                            }
                                        })}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Market Analysis (Kurdish)</label>
                                    <textarea
                                        value={currentSignal.market_analysis?.ckb || ''}
                                        onChange={(e) => setCurrentSignal({
                                            ...currentSignal,
                                            market_analysis: {
                                                en: currentSignal.market_analysis?.en || '',
                                                ar: currentSignal.market_analysis?.ar || '',
                                                ckb: e.target.value
                                            }
                                        })}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={currentSignal.is_premium}
                                            onChange={(e) => setCurrentSignal({...currentSignal, is_premium: e.target.checked})}
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        />
                                        <span className="ml-2">Premium Signal</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false)
                                        setCurrentSignal({
                                            market_analysis: { en: '', ar: '', ckb: '' },
                                            is_premium: false,
                                            status: 'active' as SignalStatus
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

                {/* Signals List */}
                {loading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Signal
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Prices
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {signals.map((signal) => (
                                    <tr key={signal.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{signal.pair}</div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(signal.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">Entry: {signal.entry_price}</div>
                                            <div className="text-sm text-gray-500">
                                                SL: {signal.stop_loss} | TP: {signal.take_profit}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                signal.status === 'active' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : signal.status === 'closed'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {signal.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                signal.type === 'buy'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {signal.type}
                                            </span>
                                            {signal.is_premium && (
                                                <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                    Premium
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setCurrentSignal(signal)
                                                    setIsEditing(true)
                                                }}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(signal.id)}
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