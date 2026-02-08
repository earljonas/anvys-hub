import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { DollarSign, TrendingUp, Clock, Calendar, Users, Download } from 'lucide-react';
import StatCard from '../../../Components/reports/StatCard';
import Button from '../../../Components/common/Button';

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
    recentPayrolls = []
}) => {

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

    // calculate max cost for chart scaling
    const maxCost = monthlyPayrollCost && monthlyPayrollCost.length > 0
        ? Math.max(...monthlyPayrollCost.map(m => m.cost), 1)
        : 1;

    const exportToCSV = () => {
        const today = new Date().toISOString().split('T')[0];

        // Define sanitizer function within exportToCSV
        const sanitizeCsvCell = (cell) => {
            let stringValue = (cell === null || cell === undefined) ? '' : String(cell);

            // Neutralize potential formulas
            if (/^[=+\-@]/.test(stringValue)) {
                stringValue = "'" + stringValue;
            }

            // Escape double quotes by doubling them
            if (stringValue.includes('"')) {
                stringValue = stringValue.replace(/"/g, '""');
            }

            // Wrap in double quotes
            return `"${stringValue}"`;
        };

        // Summary section
        let csvContent = 'PAYROLL SUMMARY REPORT\n';
        csvContent += `Generated on,${today}\n\n`;

        // Stats
        csvContent += 'KEY METRICS\n';
        csvContent += `Total Payroll (YTD),${stats.totalPayrollYTD}\n`;
        csvContent += `Average Net Pay,${stats.averageNetPay}\n`;
        csvContent += `Pending Payrolls,${stats.pendingPayrolls}\n`;
        csvContent += `Employees on Payroll,${stats.totalEmployeesOnPayroll}\n\n`;

        // Monthly breakdown
        csvContent += 'MONTHLY PAYROLL COST\n';
        csvContent += 'Month,Amount\n';
        monthlyPayrollCost.forEach(m => {
            csvContent += `${sanitizeCsvCell(m.month)},${m.cost}\n`;
        });
        csvContent += '\n';

        // Recent payrolls
        csvContent += 'RECENT PAYROLLS\n';
        csvContent += 'Reference,Period,Employees,Amount,Status,Date\n';
        recentPayrolls.forEach(p => {
            // Apply sanitizer to string fields
            csvContent += `${sanitizeCsvCell(p.reference)},${sanitizeCsvCell(p.period)},${p.employees},${p.amount},${sanitizeCsvCell(p.status)},${p.date}\n`;
        });

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payroll-report-${today}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-5 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Payroll Reports</h1>
                <Button variant="primary" className="flex items-center gap-2 shadow-lg shadow-pink-500/20" onClick={exportToCSV}>
                    <Download size={18} /> Export CSV
                </Button>
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

                    <div className="h-64 flex items-end gap-2 md:gap-4">
                        {monthlyPayrollCost && monthlyPayrollCost.length > 0 ? (
                            monthlyPayrollCost.map((data, index) => {
                                const heightPercentage = (data.cost / maxCost) * 100;
                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="relative w-full flex items-end justify-center h-full">
                                            <div
                                                className="w-full bg-pink-100 dark:bg-pink-900/30 rounded-t-lg transition-all duration-500 hover:bg-pink-200 dark:hover:bg-pink-800/40 relative group-hover:shadow-lg"
                                                style={{ height: `${heightPercentage}%`, minHeight: '4px' }}
                                            >
                                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs font-bold px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border">
                                                    {formatCurrency(data.cost)}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground">{data.month}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                No payroll data available.
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Payrolls List */}
                <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[hsl(var(--foreground))]">
                        <Calendar size={20} /> Recent Payrolls
                    </h3>

                    <div className="space-y-3 max-h-72 overflow-y-auto">
                        {recentPayrolls && recentPayrolls.length > 0 ? (
                            recentPayrolls.map((payroll) => (
                                <div key={payroll.id} className="flex items-center justify-between p-3 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)] transition-colors">
                                    <div>
                                        <div className="font-medium text-[hsl(var(--foreground))]">{payroll.period}</div>
                                        <div className="text-xs text-[hsl(var(--muted-foreground))]">
                                            {payroll.reference} • {payroll.employees} Employee{payroll.employees !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-[hsl(var(--foreground))]">{formatCurrency(payroll.amount)}</div>
                                        <div className={`text-xs font-medium capitalize ${payroll.status === 'paid' ? 'text-emerald-600' :
                                            (payroll.status === 'Pending' || payroll.status === 'draft') ? 'text-amber-600' : 'text-[hsl(var(--muted-foreground))]'
                                            }`}>
                                            {payroll.status}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                                No payrolls found.
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
