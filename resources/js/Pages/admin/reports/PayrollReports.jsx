import React from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { DollarSign, TrendingUp, Clock, Calendar, Users, Download, Filter } from 'lucide-react';
import StatCard from '../../../Components/reports/StatCard';
import Button from '../../../Components/common/Button';
import BarChart from '../../../Components/reports/BarChart';
import Pagination from '../../../Components/common/Pagination';

const PayrollReports = ({
    stats = {
        totalPayrollYTD: 0,
        averageNetPay: 0,
        totalDeductionsYTD: 0,
        pendingPayrolls: 0,
        totalEmployeesOnPayroll: 0,
        totalHoursWorked: 0
    },
    monthlyPayrollCost = [],
    recentPayrolls = { data: [], links: [] },
    filters = {}
}) => {

    const currentMonth = filters.month || new Date().toISOString().slice(0, 7);
    const currentStatus = filters.status || '';

    const [year, monthIndex] = currentMonth.split('-').map(Number);
    const monthLabel = new Date(year, monthIndex - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const formatCurrency = (value) => {
        const numValue = Number(value) || 0;
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(numValue);
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('en-PH').format(Number(value) || 0);
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        Object.keys(newFilters).forEach(k => {
            if (!newFilters[k]) delete newFilters[k];
        });
        router.get('/admin/reports/payroll', newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const exportToCSV = () => {
        const params = new URLSearchParams();
        if (currentMonth) params.set('month', currentMonth);
        if (currentStatus) params.set('status', currentStatus);
        window.open(`/admin/reports/payroll/export?${params.toString()}`, '_blank');
    };

    const payrolls = recentPayrolls?.data || recentPayrolls || [];
    const hasActiveFilters = currentStatus;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-5 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Payroll Reports</h1>
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
                            value={currentStatus}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="px-3 py-2 text-sm rounded-lg border border-[hsl(var(--border))] bg-white focus:ring-2 focus:ring-[hsl(var(--primary))]/20 focus:border-[hsl(var(--primary))] outline-none transition-all cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                    {(currentStatus || filters.month) && (
                        <button
                            onClick={() => {
                                router.get('/admin/reports/payroll', {}, {
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Payroll (YTD)"
                    value={formatCurrency(stats.totalPayrollYTD)}
                    subtitle="Year to Date"
                    icon={DollarSign}
                    variant="primary"
                />
                <StatCard
                    title="Avg Net Pay"
                    value={formatCurrency(stats.averageNetPay)}
                    subtitle="Per Employee"
                    icon={TrendingUp}
                    variant="success"
                />
                <StatCard
                    title="Pending Payrolls"
                    value={stats.pendingPayrolls}
                    subtitle="Needs Action"
                    icon={Clock}
                    variant={stats.pendingPayrolls > 0 ? "destructive" : "muted"}
                />
                <StatCard
                    title="Employees"
                    value={formatNumber(stats.totalEmployeesOnPayroll)}
                    subtitle="On Payroll (YTD)"
                    icon={Users}
                    variant="primary"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Cost Chart */}
                <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm lg:col-span-2">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-[hsl(var(--foreground))]">
                        <DollarSign size={20} /> Monthly Payroll Cost
                    </h3>

                    <div className="h-64 mt-4">
                        <BarChart
                            data={monthlyPayrollCost}
                            height={250}
                            labelKey="month"
                            valueKey="cost"
                            formatValue={formatCurrency}
                            barColorGradientStart="hsl(var(--primary))"
                            barColorGradientEnd="hsl(var(--primary)/0.6)"
                        />
                    </div>
                </div>

                {/* Recent Payrolls List */}
                <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[hsl(var(--foreground))]">
                        <Calendar size={20} /> Payrolls — {monthLabel}
                    </h3>

                    <div className="space-y-3">
                        {payrolls && payrolls.length > 0 ? (
                            <>
                                {payrolls.map((payroll) => (
                                    <div key={payroll.id} className="flex items-center justify-between p-3 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)] transition-colors">
                                        <div>
                                            <div className="font-medium text-[hsl(var(--foreground))]">{payroll.period}</div>
                                            <div className="text-xs text-[hsl(var(--muted-foreground))]">
                                                {payroll.reference} • {payroll.employees} Employee{payroll.employees !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-[hsl(var(--foreground))]">{formatCurrency(payroll.amount)}</div>
                                            <div className={`text-xs font-medium capitalize ${payroll.status?.toLowerCase() === 'paid' ? 'text-emerald-600' :
                                                (payroll.status?.toLowerCase() === 'pending' || payroll.status?.toLowerCase() === 'draft') ? 'text-amber-600' : 'text-[hsl(var(--muted-foreground))]'
                                                }`}>
                                                {payroll.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Pagination links={recentPayrolls?.links} />
                            </>
                        ) : (
                            <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                                No payrolls found for {monthLabel}.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

PayrollReports.layout = page => <AdminLayout>{page}</AdminLayout>;

export default PayrollReports;
