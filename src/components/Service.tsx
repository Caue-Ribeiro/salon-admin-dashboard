import { useEffect, useState } from 'react'
import type { Service } from '../types'
import { getSupabase } from '../lib/supabase'
import { Clock, Edit, Loader2, Plus, RotateCw, Trash2, X } from 'lucide-react'
import { formatCurrency } from '../utils/helpers'

export const ServicesTab = () => {
    const [loading, setLoading] = useState(true)
    const [services, setServices] = useState<Service[]>([])
    const [editingService, setEditingService] = useState<
        Service | Partial<Service> | null
    >(null)
    const [deletingService, setDeletingService] = useState<Service | null>(null)
    const [saving, setSaving] = useState(false)

    const fetchServices = async () => {
        setLoading(true)
        try {
            const supabase = await getSupabase()
            const { data, error } = await supabase
                .from('service')
                .select('*')
                .order('id', { ascending: true })
            if (error) throw error
            setServices((data as Service[]) || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchServices()
    }, [])

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSaving(true)
        const formData = new FormData(e.currentTarget)
        const name = formData.get('name') as string
        const priceVal = parseFloat(formData.get('price') as string)
        const priceCents = Math.round(priceVal * 100)
        const duration = parseInt(formData.get('duration') as string)

        const payload = { name, price: priceCents, duration }

        try {
            const supabase = await getSupabase()
            if (editingService?.id) {
                await supabase
                    .from('service')
                    .update(payload)
                    .eq('id', editingService.id)
            } else {
                await supabase.from('service').insert([payload])
            }
            setEditingService(null)
            fetchServices()
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!deletingService) return
        setSaving(true)
        try {
            const supabase = await getSupabase()
            await supabase.from('service').delete().eq('id', deletingService.id)
            setDeletingService(null)
            fetchServices()
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-800">
                    Service Menu
                </h2>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setEditingService({})}
                        className="text-sm bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-3 rounded-md transition-colors shadow-sm flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Service
                    </button>
                    <button
                        onClick={fetchServices}
                        className="text-sm bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-1.5 px-3 rounded-md transition-colors shadow-sm flex items-center"
                    >
                        <RotateCw className="w-4 h-4 mr-2" /> Refresh
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                            <th className="px-6 py-3 font-medium">ID</th>
                            <th className="px-6 py-3 font-medium">
                                Service Name
                            </th>
                            <th className="px-6 py-3 font-medium">Price</th>
                            <th className="px-6 py-3 font-medium">Duration</th>
                            <th className="px-6 py-3 font-medium text-right">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-6 py-8 text-center text-gray-500"
                                >
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
                                    <p>Loading services...</p>
                                </td>
                            </tr>
                        ) : services.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-6 py-8 text-center text-gray-500"
                                >
                                    No services found.
                                </td>
                            </tr>
                        ) : (
                            services.map(service => (
                                <tr
                                    key={service.id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                        #{service.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {service.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                                            {formatCurrency(service.price)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                                        <Clock className="w-4 h-4 mr-1 text-gray-400" />{' '}
                                        {service.duration} min
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() =>
                                                    setEditingService(service)
                                                }
                                                className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 w-8 h-8 rounded transition-colors flex items-center justify-center"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setDeletingService(service)
                                                }
                                                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 w-8 h-8 rounded transition-colors flex items-center justify-center"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit/Add Modal */}
            {editingService && (
                <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingService.id
                                    ? 'Edit Service'
                                    : 'Add New Service'}
                            </h3>
                            <button
                                onClick={() => setEditingService(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Service Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    defaultValue={editingService.name || ''}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Price (R$)
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        step="0.01"
                                        min="0"
                                        defaultValue={
                                            editingService.price
                                                ? (
                                                      editingService.price / 100
                                                  ).toFixed(2)
                                                : ''
                                        }
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Duration (mins)
                                    </label>
                                    <input
                                        type="number"
                                        name="duration"
                                        step="1"
                                        min="1"
                                        defaultValue={
                                            editingService.duration || ''
                                        }
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingService(null)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-75"
                                >
                                    {saving ? 'Saving...' : 'Save Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deletingService && (
                <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="text-red-500 w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Delete Service
                            </h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Are you sure you want to delete{' '}
                                <span className="font-bold">
                                    {deletingService.name}
                                </span>
                                ? This action cannot be undone.
                            </p>
                            <div className="flex justify-center space-x-3">
                                <button
                                    onClick={() => setDeletingService(null)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={saving}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-75"
                                >
                                    {saving ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
