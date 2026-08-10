import { useState } from 'react'
import { OverviewTab } from './components/Overview'
import {
    Bell,
    CalendarDays,
    List,
    PieChart,
    Scissors,
    Users,
} from 'lucide-react'
import { AppointmentsTab } from './components/Appointment'
import { ClientsTab } from './components/Client'
import { ServicesTab } from './components/Service'

export default function App() {
    const [activeTab, setActiveTab] = useState('overview')

    const navItems = [
        { id: 'overview', label: 'Overview', icon: PieChart },
        { id: 'appointments', label: 'Appointments', icon: CalendarDays },
        { id: 'clients', label: 'Clients', icon: Users },
        { id: 'services', label: 'Services', icon: List },
    ]

    return (
        <div className="bg-gray-50 text-gray-800 flex h-screen overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex-col justify-between hidden md:flex">
                <div>
                    <div className="h-16 flex items-center px-6 border-b border-gray-200">
                        <Scissors className="text-blue-500 w-6 h-6 mr-3" />
                        <span className="text-lg font-bold text-gray-900">
                            Salon Admin
                        </span>
                    </div>
                    <nav className="p-4 space-y-1">
                        {navItems.map(item => {
                            const Icon = item.icon
                            const isActive = activeTab === item.id
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                        isActive
                                            ? 'bg-gray-50 text-gray-900 border-r-4 border-blue-500 rounded-r-none'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <Icon
                                        className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-500' : 'text-gray-400'}`}
                                    />
                                    {item.label}
                                </button>
                            )
                        })}
                    </nav>
                </div>
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            A
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700">
                                Admin User
                            </p>
                            <p className="text-xs text-gray-500">Connected</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm shrink-0">
                    <h1 className="text-xl font-semibold text-gray-800 capitalize">
                        {activeTab}
                    </h1>
                    <div className="flex items-center space-x-4">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <Bell className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Scrollable Workspace */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {activeTab === 'overview' && <OverviewTab />}
                    {activeTab === 'appointments' && <AppointmentsTab />}
                    {activeTab === 'clients' && <ClientsTab />}
                    {activeTab === 'services' && <ServicesTab />}
                </main>
            </div>
        </div>
    )
}
