import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Printer, CheckCircle, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import PayslipTemplate from '@/Components/employees/payroll/PayslipTemplate';

const PayrollDetails = ({ payroll }) => {
    const { post, processing } = useForm();

    const handleMarkAsPaid = () => {
        if (confirm('Are you sure you want to mark this payroll as PAID? This action cannot be undone.')) {
            post(route('admin.payroll.pay', payroll.id));
        }
    };

    return (
        <>
            <div className="print:hidden space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Head title={`Payroll Details #${payroll.id}`} />

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('admin.payroll')}
                            className="p-2 hover:bg-[hsl(var(--accent))] rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Payroll Run #{payroll.id}</h1>
                            <p className="text-[hsl(var(--muted-foreground))]">
                                {format(new Date(payroll.start_date), 'MMM dd')} - {format(new Date(payroll.end_date), 'MMM dd, yyyy')}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
                            onClick={() => window.print()}
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            Print Payslips
                        </button>
                        {payroll.status !== 'paid' && (
                            <button
                                onClick={handleMarkAsPaid}
                                disabled={processing}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
                            >
                                <CreditCard className="w-4 h-4 mr-2" />
                                Mark as Paid
                            </button>
                        )}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[hsl(var(--card))] p-6 rounded-xl border border-[hsl(var(--border))] shadow-sm">
                        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Total Payout</p>
                        <h3 className="text-3xl font-bold mt-2 text-[hsl(var(--foreground))]">₱{Number(payroll.total_amount).toLocaleString()}</h3>
                    </div>
                    <div className="bg-[hsl(var(--card))] p-6 rounded-xl border border-[hsl(var(--border))] shadow-sm">
                        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Employees Paid</p>
                        <h3 className="text-3xl font-bold mt-2 text-[hsl(var(--foreground))]">{payroll.payslips.length}</h3>
                    </div>
                    <div className="bg-[hsl(var(--card))] p-6 rounded-xl border border-[hsl(var(--border))] shadow-sm">
                        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Status</p>
                        <div className="mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium border ${payroll.status === 'paid'
                                ? 'bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))] border-transparent'
                                : 'bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--warning))] border-transparent'
                                }`}>
                                {payroll.status === 'paid' ? <CheckCircle className="w-4 h-4 mr-1" /> : null}
                                {payroll.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Detailed Table */}
                <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[hsl(var(--border))]">
                        <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">Employee Payslips</h2>
                    </div>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors">
                                    <th className="h-12 px-4 align-middle font-medium text-[hsl(var(--muted-foreground))]">Employee</th>
                                    <th className="h-12 px-4 align-middle font-medium text-[hsl(var(--muted-foreground))] text-right">Hours</th>
                                    <th className="h-12 px-4 align-middle font-medium text-[hsl(var(--muted-foreground))] text-right">Rate</th>
                                    <th className="h-12 px-4 align-middle font-medium text-[hsl(var(--muted-foreground))] text-right">Gross Pay</th>
                                    <th className="h-12 px-4 align-middle font-medium text-[hsl(var(--muted-foreground))] text-right">Deductions</th>
                                    <th className="h-12 px-4 align-middle font-medium text-[hsl(var(--muted-foreground))] text-right">Net Pay</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {payroll.payslips.map(payslip => (
                                    <tr key={payslip.id} className="border-b transition-colors hover:bg-[hsl(var(--muted)/0.5)]">
                                        <td className="p-4 align-middle font-medium">
                                            <div>
                                                <div className="font-bold">{payslip.user.name}</div>
                                                <div className="text-xs text-[hsl(var(--muted-foreground))]">{payslip.user.email}</div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle text-right">{Number(payslip.hours_worked).toFixed(2)}</td>
                                        <td className="p-4 align-middle text-right">₱{Number(payslip.user.employee_profile?.hourly_rate || 0).toLocaleString()}</td>
                                        <td className="p-4 align-middle text-right font-medium">₱{Number(payslip.gross_pay).toLocaleString()}</td>
                                        <td className="p-4 align-middle text-right text-red-500">
                                            <div className="group relative inline-block cursor-help">
                                                -₱{(Number(payslip.gross_pay) - Number(payslip.net_pay)).toLocaleString()}
                                                {/* Tooltip for Deduction Breakdown */}
                                                <div className="invisible group-hover:visible absolute right-0 z-50 w-48 p-2 mt-1 text-xs text-[hsl(var(--popover-foreground))] bg-[hsl(var(--popover))] rounded-md shadow-lg border border-[hsl(var(--border))]">
                                                    <div className="font-bold mb-1 border-b border-[hsl(var(--border))] pb-1">Deductions</div>
                                                    {Object.entries(payslip.deductions || {}).map(([key, value]) => (
                                                        <div key={key} className="flex justify-between">
                                                            <span className="uppercase">{key}:</span>
                                                            <span>₱{value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle text-right font-bold text-[hsl(var(--success))]">
                                            ₱{Number(payslip.net_pay).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Print View */}
            <PayslipTemplate payroll={payroll} payslips={payroll.payslips} />
        </>
    );
};

PayrollDetails.layout = page => <AdminLayout>{page}</AdminLayout>;

export default PayrollDetails;
