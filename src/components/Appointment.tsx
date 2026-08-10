import { useEffect, useState } from 'react'
import type { Appointment, Client } from '../types'
import { getSupabase } from '../lib/supabase'
import { Edit, Loader2, Phone, RotateCw, X } from 'lucide-react'
import { formatDate } from '../utils/helpers'

export const AppointmentsTab = () => {
    const [loading, setLoading] = useState(true)
    const [appointments, setAppointments] = useState<
        (Appointment & { client: Client })[]
    >([])
    const [editAppt, setEditAppt] = useState<
        (Appointment & { client: Client }) | null
    >(null)
    const [saving, setSaving] = useState(false)

    const fetchAppointments = async () => {
        setLoading(true)
        try {
            const supabase = await getSupabase()
            const { data: appts, error: apptError } = await supabase
                .from('appointment')
                .select('*')
                .order('scheduling_time', { ascending: false })
                .limit(50)

            if (apptError) throw apptError

            const { data: clients, error: clientError } = await supabase
                .from('client')
                .select('id, name, phone_number')

            if (clientError) throw clientError

            const clientMap: Record<string, Client> = {}
            clients?.forEach(
                (c: Client) => (clientMap[c.id.toString()] = c as Client),
            )

            const combined = (appts || []).map(
                (a: { client_id: { toString: () => string | number } }) => ({
                    ...a,
                    client: clientMap[a.client_id.toString()] || {
                        id: a.client_id,
                        name: 'Unknown',
                        phone_number: 'N/A',
                    },
                }),
            )

            setAppointments(combined as (Appointment & { client: Client })[])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAppointments()
    }, [])

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!editAppt) return
        setSaving(true)

        const formData = new FormData(e.currentTarget)
        const newName = formData.get('name') as string
        const newPhone = formData.get('phone') as string
        const newStatus = formData.get('status') as string
        const newDatetime = formData.get('datetime') as string
        const newIsoDate = new Date(newDatetime).toISOString()

        try {
            const supabase = await getSupabase()
            await supabase
                .from('client')
                .update({ name: newName, phone_number: newPhone })
                .eq('id', editAppt.client.id)
            await supabase
                .from('appointment')
                .update({ status: newStatus, scheduling_time: newIsoDate })
                .eq('id', editAppt.id)

            setEditAppt(null)
            fetchAppointments()
        } catch (err) {
            console.error('Save failed', err)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-800">
                    Recent Appointments
                </h2>
                <button
                    onClick={fetchAppointments}
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
                                Date & Time
                            </th>
                            <th className="px-6 py-3 font-medium">Client</th>
                            <th className="px-6 py-3 font-medium">Contact</th>
                            <th className="px-6 py-3 font-medium">Status</th>
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
                                    <p>Loading appointments...</p>
                                </td>
                            </tr>
                        ) : appointments.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-6 py-8 text-center text-gray-500"
                                >
                                    No appointments found.
                                </td>
                            </tr>
                        ) : (
                            appointments.map(appt => {
                                const { date, time } = formatDate(
                                    appt.scheduling_time,
                                )
                                let statusClasses = 'bg-gray-100 text-gray-800'
                                const statusText = appt.status || 'pending'

                                if (statusText === 'confirmed')
                                    statusClasses =
                                        'bg-green-100 text-green-800'
                                else if (
                                    statusText === 'scheduled' ||
                                    statusText === 're-scheduled'
                                )
                                    statusClasses = 'bg-blue-100 text-blue-800'
                                else if (statusText === 'cancelled')
                                    statusClasses = 'bg-red-100 text-red-800'
                                else if (
                                    statusText === 'finished' ||
                                    statusText === 'done'
                                )
                                    statusClasses = 'bg-gray-200 text-gray-600'

                                return (
                                    <tr
                                        key={appt.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {date}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {time}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold mr-3">
                                                    {appt.client.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {appt.client.name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600 flex items-center">
                                                <Phone className="w-4 h-4 text-green-500 mr-2" />
                                                {appt.client.phone_number}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses}`}
                                            >
                                                {statusText
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    statusText.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() =>
                                                    setEditAppt(appt)
                                                }
                                                className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 w-8 h-8 rounded transition-colors flex items-center justify-center ml-auto"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editAppt && (
                <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800">
                                Edit Appointment
                            </h3>
                            <button
                                onClick={() => setEditAppt(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Client Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    defaultValue={editAppt.client.name}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    defaultValue={editAppt.client.phone_number}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                            </div>
                            <div className="border-t border-gray-100 my-4"></div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    name="datetime"
                                    defaultValue={
                                        formatDate(editAppt.scheduling_time)
                                            .inputFormat
                                    }
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    defaultValue={editAppt.status}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                                >
                                    <option value="scheduled">Scheduled</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="re-scheduled">
                                        Re-scheduled
                                    </option>
                                    <option value="finished">
                                        Finished (Done)
                                    </option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setEditAppt(null)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-75"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
