import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
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
} from 'lucide-react';
import logo from '../../assets/logo.png';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { url } = usePage();

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'Inventory', icon: Package, path: '/admin/inventory' },
        { name: 'Locations', icon: MapPin, path: '/admin/locations' },
        { name: 'Employees', icon: Users, path: '/admin/employees' },
        { name: 'Events', icon: Calendar, path: '/admin/events' },
        { name: 'Reports', icon: FileText, path: '/admin/reports' },
    ];

    const isActive = (path) => url.startsWith(path);

    return (
        <div
            className={`flex flex-col h-screen sidebar-gradient text-[hsl(var(--sidebar-foreground))] border-r border-[hsl(var(--sidebar-border))] shrink-0 sticky top-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
                }`}
        >
            {/* Logo */}
            <div
                className={`flex items-center h-16 px-4 mt-3 mb-3 border-b border-[hsl(var(--sidebar-border))] ${isCollapsed ? 'justify-center' : 'justify-between'
                    }`}
            >
                {!isCollapsed && (
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Anvy's Hub" className="w-8 h-8 object-contain" />
                        <span className="text-xl font-bold tracking-tight whitespace-nowrap">
                            Anvy's Hub
                        </span>
                    </div>
                )}

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="rounded-lg p-2 transition-all text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))]"
                >
                    <PanelLeft size={20} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-2 overflow-y-auto mt-2">
                {navItems.map((item) => {
                    const active = isActive(item.path);

                    return (
                        <Link
                            key={item.name}
                            href={item.path}
                            title={isCollapsed ? item.name : ''}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${active
                                ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] shadow-lg'
                                : 'text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))]'
                                } ${isCollapsed ? 'justify-center' : ''}`}
                        >
                            <item.icon className="w-5 h-5 shrink-0" />
                            {!isCollapsed && <span className="font-medium">{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-3 border-t border-[hsl(var(--sidebar-border))] space-y-2">
                <Link
                    href="/admin/settings"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${isActive('/admin/settings')
                        ? 'bg-[hsl(var(--sidebar-accent))]'
                        : 'hover:bg-[hsl(var(--sidebar-accent))]'
                        } ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <Settings className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span className="font-medium">Settings</span>}
                </Link>

                <button
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 ${isCollapsed ? 'justify-center' : ''
                        }`}
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span className="font-medium">Logout</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
