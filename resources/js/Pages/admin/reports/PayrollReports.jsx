import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { DollarSign, Users, Clock, TrendingUp } from 'lucide-react';

const PayrollReports = () => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-5 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Payroll Reports</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Track employee wages and payroll expenses</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Payroll"
                    value="--"
                    subtitle="This month"
                    icon={DollarSign}
                    variant="primary"
                />
                <StatCard
                    title="Active Employees"
                    value="--"
                    subtitle="On payroll"
                    icon={Users}
                    variant="success"
                />
                <StatCard
                    title="Total Hours"
                    value="--"
                    subtitle="Worked this month"
                    icon={Clock}
                    variant="warning"
                />
                <StatCard
                    title="Avg. Daily Rate"
                    value="--"
                    subtitle="Per employee"
                    icon={TrendingUp}
                    variant="primary"
                />
            </div>

            {/* Placeholder Content */}
            <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-12 shadow-sm text-center">
                <DollarSign size={64} className="mx-auto mb-4 text-[hsl(var(--muted-foreground))] opacity-30" />
                <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">Payroll Reports Coming Soon</h3>
                <p className="text-[hsl(var(--muted-foreground))] max-w-md mx-auto">
                    This section will display payroll analytics, employee compensation trends,
                    and expense breakdowns by location and department.
                </p>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, subtitle, icon: Icon, variant = 'primary' }) => {
    const variants = {
        primary: {
            iconBg: 'bg-[hsl(var(--primary)/0.1)]',
            iconColor: 'text-[hsl(var(--primary))]'
        },
        success: {
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600'
        },
        warning: {
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600'
        },
    };

    const { iconBg, iconColor } = variants[variant] || variants.primary;

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

PayrollReports.layout = page => <AdminLayout>{page}</AdminLayout>;

export default PayrollReports;
