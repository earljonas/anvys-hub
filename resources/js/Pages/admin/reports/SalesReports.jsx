import React from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Download, TrendingUp, ShoppingBag, Clock, ReceiptText, Filter } from 'lucide-react';
import Button from '@/Components/common/Button';
import StatCard from '@/Components/reports/StatCard';
import Pagination from '@/Components/common/Pagination';

const SalesReports = ({ stats, weeklyRevenue, bestSelling, recentOrders, locations = [], filters = {} }) => {
    const maxWeeklyRevenue = Math.max(...weeklyRevenue.map(w => w.value), 1);
    const maxBestSelling = Math.max(...bestSelling.map(b => b.value), 1);

    const currentMonth = filters.month || new Date().toISOString().slice(0, 7);
    const currentLocation = filters.location || '';

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        // Remove empty values
        Object.keys(newFilters).forEach(k => {
            if (!newFilters[k]) delete newFilters[k];
        });
        router.get('/admin/reports/sales', newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const exportToCSV = () => {
        const params = new URLSearchParams();
        if (currentMonth) params.set('month', currentMonth);
        if (currentLocation) params.set('location', currentLocation);
        window.open(`/admin/reports/sales/export?${params.toString()}`, '_blank');
    };

    // Get readable month label (safely without UTC shift)
    const [year, monthIndex] = currentMonth.split('-').map(Number);
    const monthLabel = new Date(year, monthIndex - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const orders = recentOrders?.data || recentOrders || [];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-5 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Reports & Analytics</h1>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{monthLabel}</p>
                </div>
                <Button variant="primary" className="flex items-center gap-2 shadow-lg shadow-pink-500/20 cursor-pointer" onClick={exportToCSV}>
                    <Download size={18} /> Export CSV
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                        <Filter size={16} /> Filters
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <input
                            type="month"
                            value={currentMonth}
                            onChange={(e) => handleFilterChange('month', e.target.value)}
                            className="px-3 py-2 text-sm rounded-lg border border-[hsl(var(--border))] bg-white focus:ring-2 focus:ring-[hsl(var(--primary))]/20 focus:border-[hsl(var(--primary))] outline-none transition-all cursor-pointer"
                        />
                        <select
                            value={currentLocation}
                            onChange={(e) => handleFilterChange('location', e.target.value)}
                            className="px-3 py-2 text-sm rounded-lg border border-[hsl(var(--border))] bg-white focus:ring-2 focus:ring-[hsl(var(--primary))]/20 focus:border-[hsl(var(--primary))] outline-none transition-all cursor-pointer"
                        >
                            <option value="">All Locations</option>
                            {locations.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>
                    {(currentLocation || filters.month) && (
                        <button
                            onClick={() => {
                                router.get('/admin/reports/sales', {}, {
                                    preserveState: true,
                                    preserveScroll: true,
                                });
                            }}
                            className="text-xs text-[hsl(var(--primary))] hover:underline cursor-pointer"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Monthly Revenue"
                    value={formatCurrency(stats.monthlyRevenue)}
                    subtitle={`${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange}% from last month`}
                    icon={TrendingUp}
                    variant={stats.revenueChange >= 0 ? 'primary' : 'warning'}
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders.toLocaleString()}
                    subtitle={`${stats.ordersChange >= 0 ? '+' : ''}${stats.ordersChange}% from last month`}
                    icon={ShoppingBag}
                    variant={stats.ordersChange >= 0 ? 'success' : 'warning'}
                />
                <StatCard
                    title="Peak Hour"
                    value={stats.peakHour}
                    subtitle={`Avg. ${stats.peakHourOrders} orders`}
                    icon={Clock}
                    variant="warning"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Best Selling Products */}
                <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-6">Best Selling Products</h3>
                    <div className="space-y-4">
                        {bestSelling.map((item, index) => (
                            <div key={item.name} className="space-y-1">
                                <div className="flex justify-between text-sm font-medium text-[hsl(var(--muted-foreground))]">
                                    <span className="flex items-center gap-2">
                                        <span className="text-xs bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] px-2 py-0.5 rounded-full font-bold">
                                            #{index + 1}
                                        </span>
                                        {item.name}
                                    </span>
                                    <span className="font-bold text-[hsl(var(--foreground))]">{item.value} sold</span>
                                </div>
                                <div className="h-8 bg-[hsl(var(--muted))] rounded-lg overflow-hidden relative">
                                    <div
                                        className="h-full bg-linear-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.7)] rounded-r-lg transition-all duration-1000 ease-out"
                                        style={{ width: `${(item.value / maxBestSelling) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weekly Revenue (This Month) */}
                <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-6">Weekly Revenue ({monthLabel})</h3>
                    <div className="h-[300px] w-full relative">
                        {/* Y-Axis Labels */}
                        <div className="absolute left-0 top-0 bottom-6 w-12 flex flex-col justify-between text-xs text-[hsl(var(--muted-foreground))]">
                            <span>{formatCurrency(maxWeeklyRevenue)}</span>
                            <span>{formatCurrency(maxWeeklyRevenue * 0.75)}</span>
                            <span>{formatCurrency(maxWeeklyRevenue * 0.5)}</span>
                            <span>{formatCurrency(maxWeeklyRevenue * 0.25)}</span>
                            <span>₱0</span>
                        </div>

                        {/* Bars */}
                        <div className="absolute left-14 right-0 top-0 bottom-6 flex items-end justify-around">
                            {[0, 25, 50, 75].map((pos) => (
                                <div key={pos} className="absolute w-full border-t border-dashed border-[hsl(var(--border))]" style={{ top: `${pos}%` }}></div>
                            ))}

                            {weeklyRevenue.map((item, idx) => (
                                <div key={idx} className="w-16 sm:w-20 md:w-24 h-full flex items-end relative group">
                                    <div
                                        className="w-full bg-linear-to-t from-[#4a3b32] to-[#6d5a4a] rounded-t-lg hover:opacity-90 transition-all duration-500"
                                        style={{ height: maxWeeklyRevenue > 0 ? `${(item.value / maxWeeklyRevenue) * 100}%` : '0%' }}
                                    >
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                            {formatCurrency(item.value)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* X-Axis Labels */}
                        <div className="absolute left-14 right-0 bottom-0 flex justify-around text-xs font-medium text-[hsl(var(--muted-foreground))]">
                            {weeklyRevenue.map((item, idx) => (
                                <span key={idx}>{item.label}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                    <ReceiptText size={20} /> Orders — {monthLabel}
                </h3>
                {orders.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[hsl(var(--border))]">
                                        <th className="text-left py-3 px-2 font-semibold text-[hsl(var(--muted-foreground))]">Order #</th>
                                        <th className="text-left py-3 px-2 font-semibold text-[hsl(var(--muted-foreground))]">Date</th>
                                        <th className="text-center py-3 px-2 font-semibold text-[hsl(var(--muted-foreground))]">Items</th>
                                        <th className="text-right py-3 px-2 font-semibold text-[hsl(var(--muted-foreground))]">Total</th>
                                        <th className="text-center py-3 px-2 font-semibold text-[hsl(var(--muted-foreground))]">Payment</th>
                                        <th className="text-left py-3 px-2 font-semibold text-[hsl(var(--muted-foreground))]">Location</th>
                                        <th className="text-left py-3 px-2 font-semibold text-[hsl(var(--muted-foreground))]">Employee</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, idx) => (
                                        <tr key={idx} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
                                            <td className="py-3 px-2 font-mono font-medium">{order.order_number}</td>
                                            <td className="py-3 px-2 text-[hsl(var(--muted-foreground))]">{order.date}</td>
                                            <td className="py-3 px-2 text-center">{order.items_count}</td>
                                            <td className="py-3 px-2 text-right font-semibold">₱{order.total.toFixed(2)}</td>
                                            <td className="py-3 px-2 text-center">
                                                <span className={`
                                                    px-2 py-1 rounded-full text-xs font-medium capitalize
                                                    ${order.payment_method === 'cash' ? 'bg-green-100 text-green-700' :
                                                        order.payment_method === 'card' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-purple-100 text-purple-700'}
                                                `}>
                                                    {order.payment_method}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-[hsl(var(--muted-foreground))] text-xs">{order.location}</td>
                                            <td className="py-3 px-2 text-[hsl(var(--muted-foreground))] text-xs">{order.employee}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination links={recentOrders.links} />
                    </>
                ) : (
                    <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                        <ReceiptText size={48} className="mx-auto mb-2 opacity-30" />
                        <p>No orders found for {monthLabel}.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

SalesReports.layout = page => <AdminLayout>{page}</AdminLayout>;

export default SalesReports;
