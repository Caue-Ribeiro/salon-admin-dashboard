import { useEffect, useState } from 'react'
import type { Client } from '../types'
import { getSupabase } from '../lib/supabase'
import { Loader2, Phone, RotateCw } from 'lucide-react'

export const ClientsTab = () => {
    const [loading, setLoading] = useState(true)
    const [clients, setClients] = useState<Client[]>([])

    const fetchClients = async () => {
        setLoading(true)
        try {
            const supabase = await getSupabase()
            const { data, error } = await supabase
                .from('client')
                .select('*')
                .order('name', { ascending: true })
                .limit(100)
            if (error) throw error
            setClients((data as Client[]) || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchClients()
    }, [])

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-800">
                    Client Directory
                </h2>
                <button
                    onClick={fetchClients}
                    className="text-sm bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-1.5 px-3 rounded-md transition-colors shadow-sm flex items-center"
                >
                    <RotateCw className="w-4 h-4 mr-2" /> Refresh
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                            <th className="px-6 py-3 font-medium">Name</th>
                            <th className="px-6 py-3 font-medium">
                                Phone Number
                            </th>
                            <th className="px-6 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 font-medium">
                                Service Interest
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-6 py-8 text-center text-gray-500"
                                >
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
                                    <p>Loading clients...</p>
                                </td>
                            </tr>
                        ) : clients.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-6 py-8 text-center text-gray-500"
                                >
                                    No clients found.
                                </td>
                            </tr>
                        ) : (
                            clients.map(client => {
                                let statusClasses = 'bg-gray-100 text-gray-800'
                                const statusText =
                                    client.followup_status || 'unknown'

                                if (statusText === 'active')
                                    statusClasses =
                                        'bg-green-100 text-green-800'
                                else if (statusText === 'human_support')
                                    statusClasses =
                                        'bg-yellow-100 text-yellow-800'

                                const formattedStatus = statusText
                                    .replace('_', ' ')
                                    .replace(/\b\w/g, l => l.toUpperCase())

                                return (
                                    <tr
                                        key={client.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold mr-3">
                                                    {(client.name || 'U')
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {client.name || 'Unknown'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600 flex items-center">
                                                <Phone className="w-4 h-4 text-green-500 mr-2" />
                                                {client.phone_number || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses}`}
                                            >
                                                {formattedStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {client.service_interest
                                                ? client.service_interest
                                                : '-'}
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
