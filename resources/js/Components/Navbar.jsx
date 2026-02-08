import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Clock,
    Calendar,
    ShoppingCart,
    Package,
    Sun,
    Moon,
    LogOut
} from 'lucide-react';

const Navbar = () => {
    const { url } = usePage();

    React.useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const getLinkClasses = (path) => {
        const isActive = url.startsWith(path);

        return isActive
            ? "flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-full shadow-md shadow-[hsl(var(--primary))]/25 transition-all hover:opacity-90"
            : "flex items-center gap-2 px-5 py-2.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-full transition-all";
    };

    return (
        <nav className="h-20 border-b border-[hsl(var(--border))] bg-white/80 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-50">

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

            <div className="flex items-center gap-3">

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

            <div className="flex items-center gap-6">

                <button
                    onClick={() => {
                        const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
                        if (newTheme === 'dark') {
                            document.documentElement.classList.add('dark');
                            localStorage.setItem('theme', 'dark');
                        } else {
                            document.documentElement.classList.remove('dark');
                            localStorage.setItem('theme', 'light');
                        }
                        window.dispatchEvent(new Event('storage'));
                    }}
                    className="p-2 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-full transition-colors"
                >
                    <span className="dark:hidden"><Sun size={20} /></span>
                    <span className="hidden dark:inline"><Moon size={20} /></span>
                </button>

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