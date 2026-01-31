import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Clock,
    ShoppingCart,
    Package,
    MapPin,
    Sun,
    LogOut
} from 'lucide-react';

const Navbar = () => {
    // Get the current URL to determine which tab is active
    const { url } = usePage();

    // Helper to determine styles for active vs inactive links
    const getLinkClasses = (path) => {
        // Check if the current URL starts with the link path
        const isActive = url.startsWith(path);

        return isActive
            ? "flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-full shadow-md shadow-[hsl(var(--primary))]/25 transition-all hover:opacity-90"
            : "flex items-center gap-2 px-5 py-2.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-full transition-all";
    };

    return (
        <nav className="h-20 border-b border-[hsl(var(--border))] bg-white/80 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-50">

            {/* LEFT: Logo & Brand */}
            <div className="flex items-center gap-3">
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
            </div>

            {/* CENTER: Navigation Links */}
            <div className="flex items-center gap-3">

                {/* 1. Attendance Link */}
                <Link
                    href="/staff/attendance"
                    className={getLinkClasses('/staff/attendance')}
                >
                    <Clock size={18} />
                    <span className="font-semibold text-sm">Attendance</span>
                </Link>

                {/* 2. POS Link */}
                <Link
                    href="/staff/pos"
                    className={getLinkClasses('/staff/pos')}
                >
                    <ShoppingCart size={18} />
                    <span className="font-medium text-sm">POS</span>
                </Link>

                {/* 3. Inventory Link */}
                <Link
                    href="/staff/inventory"
                    className={getLinkClasses('/staff/inventory')}
                >
                    <Package size={18} />
                    <span className="font-medium text-sm">Inventory</span>
                </Link>
            </div>

            {/* RIGHT: Status & Actions */}
            <div className="flex items-center gap-6">

                {/* Clock Status Badge */}
                <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-500 rounded-full border border-red-100">
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                    <span className="text-sm font-semibold">Clocked Out</span>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-[hsl(var(--border))]" />

                {/* Location */}
                <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                    <MapPin size={18} />
                    <span className="text-sm font-medium">SM Mall Branch</span>
                </div>

                {/* Theme Toggle */}
                <button className="p-2 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-full transition-colors">
                    <Sun size={20} />
                </button>

                {/* Logout Button (Functional) */}
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="p-2 text-[hsl(var(--muted-foreground))] hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                    <LogOut size={20} />
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;