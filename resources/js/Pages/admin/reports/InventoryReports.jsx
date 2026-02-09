import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Package, TrendingDown, AlertTriangle, DollarSign, History, Download } from 'lucide-react';
import StatCard from '../../../Components/reports/StatCard';
import Button from '../../../Components/common/Button';
import Pagination from '../../../Components/common/Pagination';

const InventoryReports = ({ stats, stockLogs, lowStockItems }) => {

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(value);
    };

    const exportStockLogsToCSV = () => {
        // Handle paginated data for export - getting current page data for now
        // Ideally should fetch all for export, but for now exporting visible
        const dataToExport = stockLogs.data || stockLogs;

        const headers = ['Date', 'Time', 'Item', 'Location', 'Action', 'Quantity', 'Notes', 'Adjusted By'];
        const rows = dataToExport.map(log => [
            log.date,
            log.time || '',
            log.item,
            log.location,
            log.type,
            log.quantity,
            log.notes ? `"${log.notes.replace(/"/g, '""')}"` : '',
            log.user || log.adjustedBy || '',
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-5 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Inventory Reports</h1>
                </div>
                <Button
                    variant="primary"
                    className="flex items-center gap-2 shadow-lg shadow-pink-500/20"
                    onClick={exportStockLogsToCSV}
                >
                    <Download size={18} /> Export CSV
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Items"
                    value={stats.totalItems}
                    subtitle="Across all locations"
                    icon={Package}
                    variant="primary"
                />
                <StatCard
                    title="Low Stock Items"
                    value={stats.lowStockCount}
                    subtitle="Need restocking"
                    icon={TrendingDown}
                    variant="warning"
                />
                <StatCard
                    title="Out of Stock"
                    value={stats.outOfStockCount}
                    subtitle="Requires immediate attention"
                    icon={AlertTriangle}
                    variant="destructive"
                />
                <StatCard
                    title="Total Value"
                    value={formatCurrency(stats.totalValue)}
                    subtitle="Inventory cost"
                    icon={DollarSign}
                    variant="success"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Alert Table */}
                <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm flex flex-col h-full">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-600">
                        <AlertTriangle size={20} /> Low Stock Alerts
                    </h3>
                    {(lowStockItems.data || lowStockItems) && (lowStockItems.data || lowStockItems).length > 0 ? (
                        <>
                            <div className="overflow-x-auto flex-grow">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[hsl(var(--border))]">
                                            <th className="text-left py-3 px-2 font-semibold text-[hsl(var(--muted-foreground))]">Item</th>
                                            <th className="text-left py-3 px-2 font-semibold text-[hsl(var(--muted-foreground))]">Location</th>
                                            <th className="text-center py-3 px-2 font-semibold text-[hsl(var(--muted-foreground))]">Stock</th>
                                            <th className="text-center py-3 px-2 font-semibold text-[hsl(var(--muted-foreground))]">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(lowStockItems.data || lowStockItems).map((item) => (
                                            <tr key={item.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
                                                <td className="py-3 px-2 font-medium text-[hsl(var(--foreground))]">{item.name}</td>
                                                <td className="py-3 px-2 text-[hsl(var(--muted-foreground))]">{item.location}</td>
                                                <td className="py-3 px-2 text-center font-bold">
                                                    <span className={item.stock === 0 ? 'text-red-600' : 'text-amber-600'}>
                                                        {item.stock} / {item.min_stock}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-2 text-center">
                                                    <span className={`
                                                        px-2 py-1 rounded-full text-xs font-medium capitalize
                                                        ${item.status === 'Out of Stock' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}
                                                    `}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination links={lowStockItems.links} />
                        </>
                    ) : (
                        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
                            <Package size={48} className="mx-auto mb-2 opacity-30 text-green-500" />
                            <p className="text-green-600 font-medium">All items are well stocked!</p>
                        </div>
                    )}
                </div>

                {/* Recent Logs Table */}
                <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm flex flex-col h-full">
                    <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                        <History size={20} /> Recent Stock Activity
                    </h3>
                    {(stockLogs.data || stockLogs) && (stockLogs.data || stockLogs).length > 0 ? (
                        <>
                            <div className="overflow-x-auto flex-grow">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[hsl(var(--border))]">
                                            <th className="text-left py-3 px-2 font-semibold text-[hsl(var(--muted-foreground))]">Activity</th>
                                            <th className="text-left py-3 px-2 font-semibold text-[hsl(var(--muted-foreground))]">Location</th>
                                            <th className="text-left py-3 px-2 font-semibold text-[hsl(var(--muted-foreground))]">Date</th>
                                            <th className="text-left py-3 px-2 font-semibold text-[hsl(var(--muted-foreground))]">User</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(stockLogs.data || stockLogs).map((log) => (
                                            <tr key={log.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
                                                <td className="py-3 px-2">
                                                    <div className="font-medium text-[hsl(var(--foreground))]">
                                                        {log.type === 'restock' ? 'Restocked' : log.type === 'usage' ? 'Used' : log.type} {log.quantity} {log.item}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2 text-xs text-[hsl(var(--muted-foreground))]">{log.location}</td>
                                                <td className="py-3 px-2 text-xs text-[hsl(var(--muted-foreground))]">{log.date}</td>
                                                <td className="py-3 px-2 text-xs text-[hsl(var(--muted-foreground))]">{log.user}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination links={stockLogs.links} />
                        </>
                    ) : (
                        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
                            <History size={48} className="mx-auto mb-2 opacity-30" />
                            <p>No recent stock activity recorded.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

InventoryReports.layout = page => <AdminLayout>{page}</AdminLayout>;

export default InventoryReports;
