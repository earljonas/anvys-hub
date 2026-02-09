import React, { useState, useEffect, useRef } from 'react'
import { Link, usePage, router } from '@inertiajs/react'
import {
    LayoutDashboard,
    Package,
    MapPin,
    Users,
    Calendar,
    FileText,
    LogOut,
    PanelLeft,
    ChevronRight,
} from 'lucide-react'

const Sidebar = () => {
    const { url } = usePage()
    const [isCollapsed, setIsCollapsed] = useState(false)

    // Shared constant for dropdown height to prevent clipping
    const dropdownMaxHeight = "max-h-60"

    // Accordion states
    const [employeesOpen, setEmployeesOpen] = useState(false)
    const [reportsOpen, setReportsOpen] = useState(false)

    // Hover Menu states
    const [hoveredMenu, setHoveredMenu] = useState(null)
    const [menuTop, setMenuTop] = useState(0)

    const closeTimeoutRef = useRef(null)

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'Inventory', icon: Package, path: '/admin/inventory' },
        { name: 'Locations', icon: MapPin, path: '/admin/locations' },
        { name: 'Events', icon: Calendar, path: '/admin/events' },
    ]

    const employeeSubItems = [
        { name: 'Directory', path: '/admin/employees' },
        { name: 'Schedule', path: '/admin/schedule' },
        { name: 'Attendance', path: '/admin/attendance' },
        { name: 'Payroll', path: '/admin/payroll' },
    ]

    const reportSubItems = [
        { name: 'Sales', path: '/admin/reports/sales' },
        { name: 'Inventory', path: '/admin/reports/inventory' },
        { name: 'Events', path: '/admin/reports/events' },
        { name: 'Payroll', path: '/admin/reports/payroll' },
    ]

    const employeePaths = employeeSubItems.map(item => item.path)
    const reportPaths = reportSubItems.map(item => item.path)

    const isEmployeesActive = employeePaths.some(path => url.startsWith(path))
    const isReportsActive = reportPaths.some(path => url.startsWith(path))
    const isActive = (path) => url.startsWith(path)

    useEffect(() => {
        setEmployeesOpen(isEmployeesActive)
    }, [url])

    useEffect(() => {
        setReportsOpen(isReportsActive)
    }, [url])

    const handleLogout = () => {
        router.post('/logout')
    }

    // --- HOVER LOGIC ---
    const handleMouseEnter = (e, menuName) => {
        if (!isCollapsed) return;

        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        setMenuTop(rect.top);
        setHoveredMenu(menuName);
    }

    const handleMouseLeave = () => {
        if (!isCollapsed) return;

        closeTimeoutRef.current = setTimeout(() => {
            setHoveredMenu(null);
        }, 50);
    }

    const handleMenuEnter = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
    }

    return (
        <div
            className={`flex flex-col h-screen sidebar-gradient
            text-[hsl(var(--sidebar-foreground))]
            border-r border-[hsl(var(--sidebar-border))]
            sticky top-0 shrink-0 z-50
            transition-[width] duration-300 ease-in-out
            ${isCollapsed ? 'w-20' : 'w-64'}`}
        >
            {/* Header */}
            <div
                className={`flex items-center h-16 px-4 mt-3 mb-3
                border-b border-[hsl(var(--sidebar-border))]
                ${isCollapsed ? 'justify-center' : 'justify-between'}`}
            >
                {!isCollapsed && (
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Anvy's Hub" className="w-8 h-8 object-contain" />
                        <span className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">Anvy's Hub</span>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="rounded-lg p-2 cursor-pointer transition-all duration-200 hover:bg-[hsl(var(--sidebar-accent))] active:scale-95"
                >
                    <PanelLeft
                        size={20}
                        className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                    />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-2 overflow-y-auto mt-2 custom-scrollbar">
                {navItems.map(item => {
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
                                    : 'text-[hsl(var(--sidebar-accent-foreground))] hover:bg-pink-50 hover:text-pink-600'
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

                {/* Employees Group */}
                <div
                    className="relative"
                    onMouseEnter={(e) => handleMouseEnter(e, 'employees')}
                    onMouseLeave={handleMouseLeave}
                >
                    <button
                        onClick={() => !isCollapsed && setEmployeesOpen(!employeesOpen)}
                        className={`flex items-center cursor-pointer w-full
                            ${isCollapsed ? 'justify-center gap-0' : 'justify-between gap-3'}
                            px-3 py-2.5 rounded-lg
                            transition-all duration-200 ease-out
                            hover:translate-x-0.5 active:scale-[0.98]
                            ${isEmployeesActive
                                ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]'
                                : 'text-[hsl(var(--sidebar-accent-foreground))] hover:bg-pink-50 hover:text-pink-600'
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

                    {/* Unified Employees Dropdown */}
                    <div className={`ml-9 mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out
                        ${employeesOpen && !isCollapsed ? `${dropdownMaxHeight} opacity-100` : 'max-h-0 opacity-0'}`}>
                        {employeeSubItems.map(sub => (
                            <Link key={sub.name} href={sub.path} className={`block px-3 py-2 rounded-md text-sm cursor-pointer transition-all duration-200
                                ${url.startsWith(sub.path) ? 'text-[hsl(var(--sidebar-primary))] font-medium bg-[hsl(var(--sidebar-primary))]/10' : 'text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))]'}`}>
                                {sub.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Reports Group */}
                <div
                    className="relative"
                    onMouseEnter={(e) => handleMouseEnter(e, 'reports')}
                    onMouseLeave={handleMouseLeave}
                >
                    <button
                        onClick={() => !isCollapsed && setReportsOpen(!reportsOpen)}
                        className={`flex items-center cursor-pointer w-full
                            ${isCollapsed ? 'justify-center gap-0' : 'justify-between gap-3'}
                            px-3 py-2.5 rounded-lg
                            transition-all duration-200 ease-out
                            hover:translate-x-0.5 active:scale-[0.98]
                            ${isReportsActive
                                ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]'
                                : 'text-[hsl(var(--sidebar-accent-foreground))] hover:bg-pink-50 hover:text-pink-600'
                            }
                        `}
                    >
                        {isCollapsed ? (
                            <FileText className="w-5 h-5 shrink-0" />
                        ) : (
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 shrink-0" />
                                <span className="font-medium transition-all duration-200">Reports</span>
                            </div>
                        )}
                        {!isCollapsed && (
                            <ChevronRight
                                size={16}
                                className={`transition-transform duration-300 ${reportsOpen ? 'rotate-90' : ''}`}
                            />
                        )}
                    </button>

                    {/* Unified Reports Dropdown */}
                    <div className={`ml-9 mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out
                        ${reportsOpen && !isCollapsed ? `${dropdownMaxHeight} opacity-100` : 'max-h-0 opacity-0'}`}>
                        {reportSubItems.map(sub => (
                            <Link key={sub.name} href={sub.path} className={`block px-3 py-2 rounded-md text-sm transition-all duration-200
                                ${url.startsWith(sub.path) ? 'text-[hsl(var(--sidebar-primary))] font-medium bg-[hsl(var(--sidebar-primary))]/10' : 'text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))]'}`}>
                                {sub.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Bottom */}
            <div className="p-3 border-t border-[hsl(var(--sidebar-border))] space-y-2">
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

            {/* GLOBAL HOVER MENU */}
            {isCollapsed && hoveredMenu && (
                <div
                    className="fixed left-20 z-[9999]"
                    style={{ top: menuTop - 10 }}
                    onMouseEnter={handleMenuEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="bg-white border border-[hsl(var(--border))] rounded-lg shadow-xl p-2 min-w-[180px] relative animate-in fade-in-0 zoom-in-95 duration-200">
                        {/* Arrow */}
                        <div className="absolute left-[-6px] top-5 w-3 h-3 bg-white border-l border-b border-[hsl(var(--border))] rotate-45 transform"></div>

                        {/* Content */}
                        <div className="space-y-1 relative z-10 bg-white">
                            {(hoveredMenu === 'employees' ? employeeSubItems : reportSubItems).map(sub => (
                                <Link
                                    key={sub.name}
                                    href={sub.path}
                                    className={`block px-3 py-2 text-sm rounded-md transition-colors duration-150
                                        ${url.startsWith(sub.path)
                                            ? 'text-pink-600 font-medium bg-pink-50'
                                            : 'text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]'
                                        }
                                    `}
                                >
                                    {sub.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Sidebar