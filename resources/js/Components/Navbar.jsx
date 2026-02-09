import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Clock,
    Calendar,
    ShoppingCart,
    Package,
    Sun,
    Moon,
    LogOut,
    MapPin,
    User,
    ChevronDown,
    Settings,
    HelpCircle
} from 'lucide-react';

const Navbar = () => {
    const { url, props } = usePage();
    const auth = props.auth || {};
    const user = auth.user || null;
    const employee = user?.employee || null;
    const location = employee?.location || null;

    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Theme initialization
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setProfileDropdownOpen(false);
            }
        };

        if (profileDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [profileDropdownOpen]);

    const toggleTheme = () => {
        const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
        window.dispatchEvent(new Event('storage'));
    };

    const getLinkClasses = (path) => {
        const isActive = url.startsWith(path);

        return isActive
            ? "flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-full shadow-md shadow-[hsl(var(--primary))]/25 transition-all hover:opacity-90"
            : "flex items-center gap-2 px-5 py-2.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-full transition-all";
    };

    return (
        <nav className="h-20 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-50">

            {/* Left Section - Logo */}
            <div className="flex items-center gap-3">
                <Link href="/staff/attendance" className="flex items-center gap-3 group">
                    <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
                        <img
                            src="/logo.png"
                            alt="Anvy's Logo"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">
                            Anvy's Hub
                        </h1>
                    </div>
                </Link>
            </div>

            {/* Center Section - Navigation Links */}
            <div className="flex items-center gap-2">
                <Link
                    href="/staff/attendance"
                    className={getLinkClasses('/staff/attendance')}
                >
                    <Clock size={18} />
                    <span className="font-semibold text-sm">Attendance</span>
                </Link>

                <Link
                    href="/staff/schedule"
                    className={getLinkClasses('/staff/schedule')}
                >
                    <Calendar size={18} />
                    <span className="font-semibold text-sm">Schedule</span>
                </Link>

                <Link
                    href="/staff/pos"
                    className={getLinkClasses('/staff/pos')}
                >
                    <ShoppingCart size={18} />
                    <span className="font-medium text-sm">POS</span>
                </Link>

                <Link
                    href="/staff/inventory"
                    className={getLinkClasses('/staff/inventory')}
                >
                    <Package size={18} />
                    <span className="font-medium text-sm">Inventory</span>
                </Link>
            </div>

            {/* Right Section - Theme Toggle, Location, Profile */}
            <div className="flex items-center gap-4">

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-full transition-all"
                    title="Toggle theme"
                >
                    <span className="dark:hidden"><Sun size={20} /></span>
                    <span className="hidden dark:inline"><Moon size={20} /></span>
                </button>

                {/* Location Badge */}
                {location && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[hsl(var(--muted))]/50 rounded-full border border-[hsl(var(--border))]">
                        <MapPin size={14} className="text-[hsl(var(--primary))]" />
                        <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                            {location.name}
                        </span>
                    </div>
                )}

                {/* Divider */}
                <div className="w-px h-8 bg-[hsl(var(--border))]" />

                {/* Profile Dropdown */}
                {user && (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-[hsl(var(--muted))] rounded-xl transition-all"
                        >
                            {/* Avatar */}
                            <div className="w-9 h-9 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-[hsl(var(--primary-foreground))] font-bold text-sm shadow-md shadow-[hsl(var(--primary))]/25">
                                {user.name?.charAt(0)?.toUpperCase() || <User size={16} />}
                            </div>

                            {/* Name & Role */}
                            <div className="hidden md:flex flex-col items-start">
                                <span className="text-sm font-semibold text-[hsl(var(--foreground))] leading-tight">
                                    {user.name || 'Staff Member'}
                                </span>
                                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                    Staff
                                </span>
                            </div>

                            {/* Chevron */}
                            <ChevronDown
                                size={16}
                                className={`text-[hsl(var(--muted-foreground))] transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {/* Dropdown Menu */}
                        {profileDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-[hsl(var(--background))] rounded-2xl shadow-xl border border-[hsl(var(--border))] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">

                                {/* User Info Header */}
                                <div className="p-4 bg-[hsl(var(--muted))]/30 border-b border-[hsl(var(--border))]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-[hsl(var(--primary-foreground))] font-bold text-lg shadow-md shadow-[hsl(var(--primary))]/25">
                                            {user.name?.charAt(0)?.toUpperCase() || <User size={18} />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[hsl(var(--foreground))]">
                                                {user.name || 'Staff Member'}
                                            </span>
                                            <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                                {user.email || 'staff@anvyshub.com'}
                                            </span>
                                        </div>
                                    </div>
                                    {location && (
                                        <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-[hsl(var(--background))] rounded-lg">
                                            <MapPin size={14} className="text-[hsl(var(--primary))]" />
                                            <span className="text-sm text-[hsl(var(--foreground))]">
                                                {location.name}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Menu Items */}
                                <div className="p-2">
                                    <button
                                        onClick={toggleTheme}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-xl transition-colors text-left"
                                    >
                                        <span className="dark:hidden"><Sun size={18} /></span>
                                        <span className="hidden dark:inline"><Moon size={18} /></span>
                                        <span className="text-sm font-medium">
                                            <span className="dark:hidden">Switch to Dark Mode</span>
                                            <span className="hidden dark:inline">Switch to Light Mode</span>
                                        </span>
                                    </button>

                                    <Link
                                        href="/staff/help"
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-xl transition-colors"
                                        onClick={() => setProfileDropdownOpen(false)}
                                    >
                                        <HelpCircle size={18} />
                                        <span className="text-sm font-medium">Help & Support</span>
                                    </Link>
                                </div>

                                {/* Logout Section */}
                                <div className="p-2 border-t border-[hsl(var(--border))]">
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors text-left"
                                        onClick={() => setProfileDropdownOpen(false)}
                                    >
                                        <LogOut size={18} />
                                        <span className="text-sm font-medium">Sign Out</span>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;