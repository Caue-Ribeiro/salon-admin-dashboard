import { useEffect, useState } from 'react'
import type { Appointment, Client, Service } from '../types'
import { getSupabase } from '../lib/supabase'
import {
    AlertTriangle,
    CalendarDays,
    DollarSign,
    Loader2,
    Phone,
    RotateCw,
    Trophy,
    Users,
} from 'lucide-react'
import { formatCurrency } from '../utils/helpers'

export const OverviewTab = () => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [kpis, setKpis] = useState({
        clients: 0,
        appointments: 0,
        revenue: 0,
        finished: 0,
    })
    const [topClients, setTopClients] = useState<
        (Client & { count: number })[]
    >([])

    const fetchOverview = async () => {
        setLoading(true)
        setError(null)
        try {
            const supabase = await getSupabase()
            const [clientsRes, apptsRes, servicesRes] = await Promise.all([
                supabase.from('client').select('id, name, phone_number'),
                supabase.from('appointment').select('client_id, status'), // Removed missing service_ids column
                supabase.from('service').select('id, price'),
            ])

            if (clientsRes.error) throw clientsRes.error
            if (apptsRes.error) throw apptsRes.error
            if (servicesRes.error) throw servicesRes.error

            const clients = (clientsRes.data as Client[]) || []
            const appointments = (apptsRes.data as Appointment[]) || []
            const services = (servicesRes.data as Service[]) || []

            // Calculate KPIs
            const servicePrices: Record<string, number> = {}
            services.forEach(
                s => (servicePrices[s.id.toString()] = s.price || 0),
            )

            let revenueCents = 0
            let finishedCount = 0
            const clientVisitCounts: Record<string, number> = {}

            appointments.forEach(appt => {
                // Revenue & Finished calc
                const status = (appt.status || '').toLowerCase()
                if (status === 'finished' || status === 'done') {
                    finishedCount++
                    if (appt.service_ids && Array.isArray(appt.service_ids)) {
                        appt.service_ids.forEach(serviceId => {
                            revenueCents +=
                                servicePrices[serviceId.toString()] || 0
                        })
                    }
                }

                // Visits calc
                if (appt.client_id) {
                    clientVisitCounts[appt.client_id.toString()] =
                        (clientVisitCounts[appt.client_id.toString()] || 0) + 1
                }
            })

            setKpis({
                clients: clients.length,
                appointments: appointments.length,
                revenue: revenueCents,
                finished: finishedCount,
            })

            // Top Clients
            const ranked = Object.entries(clientVisitCounts)
                .map(([clientId, count]) => {
                    const clientData = clients.find(
                        c => c.id.toString() === clientId,
                    ) || {
                        id: clientId,
                        name: 'Unknown Client',
                        phone_number: 'N/A',
                    }
                    return { ...clientData, count }
                })
                .sort((a, b) => b.count - a.count)
                .slice(0, 10)

            setTopClients(ranked)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchOverview()
    }, [])

    if (loading)
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-500 font-medium">
                    Loading dashboard insights...
                </p>
            </div>
        )

    if (error)
        return (
            <div className="text-center mt-10">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="text-red-500 w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Failed to load Overview
                </h2>
                <p className="text-gray-500">{error}</p>
            </div>
        )

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mr-4 shadow-inner">
                        <Users className="text-blue-500 w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                            Total Clients
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {kpis.clients}
                        </h3>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                    <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center mr-4 shadow-inner">
                        <CalendarDays className="text-purple-500 w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                            Total Appointments
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {kpis.appointments}
                        </h3>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                    <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mr-4 shadow-inner">
                        <DollarSign className="text-green-500 w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                            Revenue (Finished)
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {formatCurrency(kpis.revenue)}
                        </h3>
                        <p className="text-xs text-green-600 mt-1 font-medium">
                            {kpis.finished} completed
                        </p>
                    </div>
                </div>
            </div>

            {/* Top 10 Clients Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                        <Trophy className="text-yellow-500 w-5 h-5 mr-2" /> Top
                        10 Most Frequent Clients
                    </h2>
                    <button
                        onClick={fetchOverview}
                        className="text-sm bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-1.5 px-3 rounded-md transition-colors shadow-sm flex items-center"
                    >
                        <RotateCw className="w-4 h-4 mr-2" /> Refresh
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                                <th className="px-6 py-3 font-medium">
                                    Rank & Client Name
                                </th>
                                <th className="px-6 py-3 font-medium">
                                    Contact
                                </th>
                                <th className="px-6 py-3 font-medium text-right">
                                    Total Visits
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {topClients.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-6 py-8 text-center text-gray-500"
                                    >
                                        No appointments recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                topClients.map((c, index) => {
                                    let badgeColor = 'bg-gray-100 text-gray-600'
                                    if (index === 0)
                                        badgeColor =
                                            'bg-yellow-100 text-yellow-600 shadow-sm'
                                    else if (index === 1)
                                        badgeColor =
                                            'bg-gray-200 text-gray-700 shadow-sm'
                                    else if (index === 2)
                                        badgeColor =
                                            'bg-orange-100 text-orange-700 shadow-sm'

                                    return (
                                        <tr
                                            key={c.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div
                                                        className={`h-8 w-8 rounded-full ${badgeColor} flex items-center justify-center font-bold mr-3 text-sm`}
                                                    >
                                                        #{index + 1}
                                                    </div>
                                                    <div className="text-sm font-bold text-gray-900">
                                                        {c.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600 flex items-center">
                                                    <Phone className="w-4 h-4 text-green-500 mr-2" />
                                                    {c.phone_number}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-blue-100 text-blue-800">
                                                    {c.count}{' '}
                                                    {c.count === 1
                                                        ? 'visit'
                                                        : 'visits'}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
