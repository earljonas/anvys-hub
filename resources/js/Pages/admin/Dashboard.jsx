import React from 'react';
import {
    TrendingUp,
    Package,
    Calendar,
    Users,
    AlertTriangle,
    Clock,
} from 'lucide-react';
import banner from '../../../assets/banner.jpg';
import AdminLayout from '../../Layouts/AdminLayout';

const Dashboard = () => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-5 space-y-6">
            {/* Banner Section */}
            <div className="relative overflow-hidden rounded-2xl shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.8)]" />
                <img
                    src={banner}
                    alt="Welcome Banner"
                    className="w-full h-48 object-cover object-center mix-blend-overlay opacity-40"
                />
                <div className="absolute inset-0 flex flex-col justify-center px-8 text-white">
                    <h1 className="text-4xl font-bold tracking-tight mb-2 drop-shadow-md">
                        Welcome Back, Admin!
                    </h1>
                    <p className="text-lg font-medium drop-shadow-sm">
                        Your sweet success starts here!
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Today's Sales"
                    value="₱15,420"
                    subtitle="+12% from yesterday"
                    icon={TrendingUp}
                    variant="success"
                />
                <StatCard
                    title="Low Stock Items"
                    value="10"
                    subtitle="Need attention"
                    icon={Package}
                    variant="warning"
                />
                <StatCard
                    title="Upcoming Events"
                    value="3"
                    subtitle="This month"
                    icon={Calendar}
                    variant="primary"
                />
                <StatCard
                    title="Pending Payroll"
                    value="₱47,300"
                    subtitle="8 employees"
                    icon={Users}
                    variant="muted"
                />
            </div>

            {/* Bottom Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Alerts */}
                <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-1">
                            <AlertTriangle className="text-[hsl(var(--warning))] w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">Low Stock Alerts</h2>
                    </div>
                    <div className="space-y-3">
                        <StockAlertItem name="Milk" remaining="5 liters" min="20" />
                        <StockAlertItem name="Marshmallows" remaining="10 packs" min="50" />
                        <StockAlertItem name="Large cups" remaining="25 pieces" min="100" />
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-[hsl(var(--primary)/0.1)] rounded-lg">
                            <Calendar className="text-[hsl(var(--primary))] w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">Upcoming Events</h2>
                    </div>
                    <div className="space-y-3">
                        <EventItem
                            name="Kent Serencio"
                            date="October 1, 2025 at 2:00 PM"
                            details="75 pax (₱5,250)"
                            status="paid"
                        />
                        <EventItem
                            name="Odyssey Ragas"
                            date="October 22, 2025 at 11:00 AM"
                            details="100 pax (₱6,800)"
                            status="pending"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Stat Card 
const StatCard = ({ title, value, subtitle, icon: Icon, variant = 'primary' }) => {
    const variants = {
        primary: {
            iconBg: 'bg-[hsl(var(--primary)/0.1)]',
            iconColor: 'text-[hsl(var(--primary))]'
        },
        success: {
            iconBg: 'bg-[hsl(var(--success)/0.1)]',
            iconColor: 'text-[hsl(var(--success))]'
        },
        warning: {
            iconBg: 'bg-[hsl(var(--warning)/0.1)]',
            iconColor: 'text-[hsl(var(--warning))]'
        },
        muted: {
            iconBg: 'bg-[hsl(var(--muted))]',
            iconColor: 'text-[hsl(var(--muted-foreground))]'
        }
    };

    const { iconBg, iconColor } = variants[variant];

    return (
        <div className="bg-[hsl(var(--card))] p-6 rounded-xl border border-[hsl(var(--border))] shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{title}</p>
                    <h3 className="text-3xl font-bold mt-2 text-[hsl(var(--foreground))]">{value}</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{subtitle}</p>
                </div>
                <div className={`p-3 rounded-lg ${iconBg}`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
            </div>
        </div>
    );
};


const StockAlertItem = ({ name, remaining, min }) => (
    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-[hsl(var(--sidebar-accent))] transition-colors">
        <div>
            <p className="font-semibold text-[hsl(var(--foreground))]">{name}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{remaining} remaining</p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[hsl(var(--warning)/0.2)] text-[hsl(var(--warning))]">
            Min: {min}
        </span>
    </div>
);

const EventItem = ({ name, date, details, status }) => (
    <div className="flex items-start justify-between p-4 rounded-lg border border-gray-200 hover:bg-[hsl(var(--sidebar-accent))] transition-colors">
        <div className="space-y-1.5 flex-1">
            <p className="font-semibold text-[hsl(var(--foreground))]">{name}</p>
            <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                <Clock className="w-4 h-4" />
                <span>{date}</span>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{details}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap ml-4 ${status === 'paid'
            ? 'bg-[hsl(var(--success)/0.2)] text-[hsl(var(--success))]'
            : 'bg-[hsl(var(--destructive)/0.2)] text-[hsl(var(--destructive))]'
            }`}>
            {status}
        </span>
    </div>
);

Dashboard.layout = page => <AdminLayout>{page}</AdminLayout>;

export default Dashboard;