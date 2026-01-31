import React from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Download, TrendingUp, ShoppingBag, Clock } from 'lucide-react';
import Button from '../../Components/common/Button';

const Reports = () => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-5 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Reports & Analytics</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Insights to grow your business</p>
                </div>
                <Button variant="primary" className="flex items-center gap-2 shadow-lg shadow-pink-500/20">
                    <Download size={18} /> Export CSV
                </Button>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Monthly Revenue"
                    value="₱206,000"
                    subtitle="+12% from last month"
                    icon={TrendingUp}
                    variant="primary"
                />
                <StatCard
                    title="Total Orders"
                    value="2,456"
                    subtitle="+8% from last month"
                    icon={ShoppingBag}
                    variant="success"
                />
                <StatCard
                    title="Peak Hour"
                    value="1:00 PM"
                    subtitle="Avg. 72 orders"
                    icon={Clock}
                    variant="warning"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-6">Best Selling Flavors</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Strawberry', value: 450, color: 'bg-pink-400' },
                            { name: 'Chocolate', value: 380, color: 'bg-pink-300' },
                            { name: 'Ube', value: 320, color: 'bg-pink-300' },
                            { name: 'Mango', value: 280, color: 'bg-pink-300' },
                            { name: 'Graham', value: 220, color: 'bg-pink-300' },
                        ].map((item) => (
                            <div key={item.name} className="space-y-1">
                                <div className="flex justify-between text-sm font-medium text-[hsl(var(--muted-foreground))]">
                                    <span>{item.name}</span>
                                </div>
                                <div className="h-8 bg-[hsl(var(--muted))] rounded-lg overflow-hidden relative">
                                    <div
                                        className={`h-full ${item.color} rounded-r-lg transition-all duration-1000 ease-out`}
                                        style={{ width: `${(item.value / 500) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weekly Revenue (This Month) - Swapped here */}
                <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-6">Weekly Revenue (This Month)</h3>
                    <div className="h-[300px] w-full relative">
                        {/* Y-Axis Labels */}
                        <div className="absolute left-0 top-0 bottom-6 w-10 flex flex-col justify-between text-xs text-[hsl(var(--muted-foreground))]">
                            <span>₱80k</span>
                            <span>₱60k</span>
                            <span>₱40k</span>
                            <span>₱20k</span>
                        </div>

                        {/* Bars */}
                        <div className="absolute left-10 right-0 top-0 bottom-6 flex items-end justify-around pl-4">
                            {[0, 25, 50, 75].map((pos) => (
                                <div key={pos} className="absolute w-full border-t border-dashed border-[hsl(var(--border))]" style={{ top: `${pos}%` }}></div>
                            ))}

                            {[
                                { label: 'Week 1', value: 45, color: 'bg-[#4a3b32]' },
                                { label: 'Week 2', value: 65, color: 'bg-[#4a3b32]' },
                                { label: 'Week 3', value: 55, color: 'bg-[#4a3b32]' },
                                { label: 'Week 4', value: 85, color: 'bg-[#4a3b32]' },
                            ].map((item, idx) => (
                                <div key={idx} className="w-12 sm:w-20 md:w-24 h-full flex items-end relative group">
                                    <div
                                        className={`w-full ${item.color} rounded-t-sm hover:opacity-90 transition-all duration-500`}
                                        style={{ height: `${item.value}%` }}
                                    >
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded">
                                            {item.value}k
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* X-Axis Labels */}
                        <div className="absolute left-10 right-0 bottom-0 flex justify-around pl-4 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                            <span>Week 1</span>
                            <span>Week 2</span>
                            <span>Week 3</span>
                            <span>Week 4</span>
                        </div>
                    </div>
                </div>
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

Reports.layout = page => <AdminLayout>{page}</AdminLayout>;

export default Reports;
