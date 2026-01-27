import React, { useState, useEffect } from 'react'
import { Link, usePage, router } from '@inertiajs/react'
import {
    LayoutDashboard,
    Package,
    MapPin,
    Users,
    Calendar,
    FileText,
    Settings,
    LogOut,
    PanelLeft,
    ChevronRight,
} from 'lucide-react'

const Sidebar = () => {
    const { url } = usePage()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [employeesOpen, setEmployeesOpen] = useState(false)

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'Inventory', icon: Package, path: '/admin/inventory' },
        { name: 'Locations', icon: MapPin, path: '/admin/locations' },
        { name: 'Events', icon: Calendar, path: '/admin/events' },
        { name: 'Reports', icon: FileText, path: '/admin/reports' },
    ]

    const employeePaths = ['/admin/roster', '/admin/attendance', '/admin/payroll']
    const isEmployeesActive = employeePaths.some(path => url.startsWith(path))
    const isActive = (path) => url.startsWith(path)

    useEffect(() => {
        setEmployeesOpen(isEmployeesActive)
    }, [url])

    const handleLogout = () => {
        router.post('/logout')
    }

    return (
        <div
            className={`flex flex-col h-screen sidebar-gradient
            text-[hsl(var(--sidebar-foreground))]
            border-r border-[hsl(var(--sidebar-border))]
            sticky top-0 shrink-0
            transition-[width] duration-300 ease-in-out
            ${isCollapsed ? 'w-20' : 'w-64'}`}
        >
            {/* header */}
            <div
                className={`flex items-center h-16 px-4 mt-3 mb-3
                border-b border-[hsl(var(--sidebar-border))]
                ${isCollapsed ? 'justify-center' : 'justify-between'}`}
            >
                {!isCollapsed && (
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Anvy's Hub" className="w-8 h-8 object-contain" />
                        <span className="text-xl font-bold tracking-tight">Anvy's Hub</span>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="rounded-lg p-2 transition-all duration-200 hover:bg-[hsl(var(--sidebar-accent))] active:scale-95"
                >
                    <PanelLeft
                        size={20}
                        className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                    />
                </button>
            </div>

            {/* navigation */}
            <nav className="flex-1 px-3 space-y-2 overflow-y-auto mt-2">
                {navItems.slice(0, 3).map(item => {
                    const active = isActive(item.path)
                    return (
                        <Link
                            key={item.name}
                            href={item.path}
                            className={`flex items-center
                                ${isCollapsed ? 'justify-center gap-0' : 'gap-3'}
                                px-3 py-2.5 rounded-lg
                                transition-all duration-200 ease-out
                                hover:translate-x-0.5 active:scale-[0.98]
                                ${active
                                    ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]'
                                    : 'text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))]'
                                }
                            `}
                        >
                            <item.icon className="w-5 h-5 shrink-0" />
                            <span
                                className={`font-medium transition-all duration-200
                                ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}
                            >
                                {item.name}
                            </span>
                        </Link>
                    )
                })}

                {/* employees */}
                <div>
                    <button
                        onClick={() => setEmployeesOpen(!employeesOpen)}
                        className={`flex items-center
                            w-full
                            ${isCollapsed ? 'justify-center gap-0' : 'justify-between gap-3'}
                            px-3 py-2.5 rounded-lg
                            transition-all duration-200 ease-out
                            hover:translate-x-0.5 active:scale-[0.98]
                            ${isEmployeesActive
                                ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]'
                                : 'text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))]'
                            }
                        `}
                    >
                        {isCollapsed ? (
                            <Users className="w-5 h-5 shrink-0" />
                        ) : (
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 shrink-0" />
                                <span className="font-medium transition-all duration-200">Employees</span>
                            </div>
                        )}
                        {!isCollapsed && (
                            <ChevronRight
                                size={16}
                                className={`transition-transform duration-300 ${employeesOpen ? 'rotate-90' : ''}`}
                            />
                        )}
                    </button>

                    <div
                        className={`ml-9 mt-1 space-y-1 overflow-hidden
                        transition-all duration-300 ease-in-out
                        ${employeesOpen && !isCollapsed
                                ? 'max-h-40 opacity-100'
                                : 'max-h-0 opacity-0'
                            }`}
                    >
                        {[
                            { name: 'Roster', path: '/admin/roster' },
                            { name: 'Attendance', path: '/admin/attendance' },
                            { name: 'Payroll', path: '/admin/payroll' },
                        ].map(sub => (
                            <Link
                                key={sub.name}
                                href={sub.path}
                                className={`block px-3 py-2 rounded-md text-sm
                                    transition-all duration-200
                                    ${url.startsWith(sub.path)
                                        ? 'text-[hsl(var(--sidebar-primary))] font-medium bg-[hsl(var(--sidebar-primary))]/10'
                                        : 'text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))]'
                                    }
                                `}
                            >
                                {sub.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {navItems.slice(3).map(item => {
                    const active = isActive(item.path)
                    return (
                        <Link
                            key={item.name}
                            href={item.path}
                            className={`flex items-center
                                ${isCollapsed ? 'justify-center gap-0' : 'gap-3'}
                                px-3 py-2.5 rounded-lg
                                transition-all duration-200 ease-out
                                hover:translate-x-0.5 active:scale-[0.98]
                                ${active
                                    ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]'
                                    : 'text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))]'
                                }
                            `}
                        >
                            <item.icon className="w-5 h-5 shrink-0" />
                            <span
                                className={`font-medium transition-all duration-200
                                ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}
                            >
                                {item.name}
                            </span>
                        </Link>
                    )
                })}
            </nav>

            {/* bottom */}
            <div className="p-3 border-t border-[hsl(var(--sidebar-border))] space-y-2">
                <Link
                    href="/admin/settings"
                    className={`flex items-center
                        ${isCollapsed ? 'justify-center gap-0' : 'gap-3'}
                        px-3 py-2.5 rounded-lg
                        transition-all duration-200 ease-out
                        hover:translate-x-0.5 active:scale-[0.98]
                        ${isActive('/admin/settings')
                            ? 'bg-[hsl(var(--sidebar-accent))]'
                            : 'hover:bg-[hsl(var(--sidebar-accent))]'
                        }
                    `}
                >
                    <Settings className="w-5 h-5 shrink-0" />
                    <span className={`font-medium transition-all duration-200
                        ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}
                    >
                        Settings
                    </span>
                </Link>

                <button
                    onClick={handleLogout}
                    className={`flex items-center cursor-pointer
                        ${isCollapsed ? 'justify-center gap-0' : 'gap-3'}
                        w-full px-3 py-2.5 rounded-lg
                        transition-all duration-200 ease-out
                        text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 active:scale-[0.98]
                    `}
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    <span className={`font-medium transition-all duration-200
                        ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}
                    >
                        Logout
                    </span>
                </button>
            </div>
        </div>
    )
}

export default Sidebar