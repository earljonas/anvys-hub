import React, { useState, useRef } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react'; // Added router
import AdminLayout from '@/Layouts/AdminLayout';
import { Calendar, DollarSign, CheckCircle, Clock, ChevronRight, FileText, Calculator, Search, X, Settings } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import axios from 'axios';
import Input from '@/Components/employees/Input';
import Button from '@/Components/employees/Button';
import Pagination from '@/Components/employees/Pagination';
import ContributionSettingsModal from '@/Components/employees/payroll/ContributionSettingsModal';
import PayrollDetailsModal from '@/Components/employees/payroll/PayrollDetailsModal';

const Payroll = ({ payrolls, employees, filters }) => { // Added filters prop
    const startDateRef = useRef(null);
    const endDateRef = useRef(null);
    const { data, setData, post, processing, errors } = useForm({
        start_date: '',
        end_date: '',
        user_id: '',
    });

    const [calculation, setCalculation] = useState(null);
    const [calculating, setCalculating] = useState(false);
    const [calcError, setCalcError] = useState(null);

    // Initialize state from server filters
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [dateFilter, setDateFilter] = useState(filters.date || '');
    const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState(null);

    const openDetailsModal = (payroll) => {
        setSelectedPayroll(payroll);
        setIsDetailsModalOpen(true);
    };

    // Server-side filtering
    const handleFilterChange = (key, value) => {
        router.get(
            route('admin.payroll'),
            { ...filters, [key]: value },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    // Debounce search (simplified)
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchQuery(value); // Update local state immediately for UI

        // Clear existing timeout if any (simple implementation, ideally use lodash or a hook)
        // For now, let's just trigger on blur or Enter, or use a simple timeout
        if (window.searchTimeout) clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => {
            handleFilterChange('search', value);
        }, 500);
    };

    const handleDateFilter = (e) => {
        const value = e.target.value;
        setDateFilter(value);
        handleFilterChange('date', value);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setDateFilter('');
        router.get(route('admin.payroll'), {}, { preserveState: true, preserveScroll: true });
    };

    // Use server data directly
    const filteredPayrolls = payrolls.data;



    const handleCalculate = async () => {
        setCalculating(true);
        setCalcError(null);
        try {
            const response = await axios.post(route('admin.payroll.calculate'), {
                user_id: data.user_id,
                start_date: data.start_date,
                end_date: data.end_date,
            });
            setCalculation(response.data);
        } catch (error) {
            setCalculation(null);
            setCalcError(error.response?.data?.error || 'Failed to calculate payroll.');
        } finally {
            setCalculating(false);
        }
    };

    const handleGenerate = (e) => {
        e.preventDefault();
        setCalcError(null); // Clear any previous errors
        post(route('admin.payroll.generate'), {
            onSuccess: () => {
                setCalculation(null); // Hide preview to prevent duplicate generation
            },
            onError: (errors) => {
                // Display the error message from the backend
                const errorMsg = errors.error || Object.values(errors)[0] || 'Failed to generate payroll.';
                setCalcError(errorMsg);
            }
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Head title="Payroll Management" />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Payroll Management</h1>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setIsContributionModalOpen(true)}
                    className="flex items-center gap-2"
                >
                    <Settings size={16} />
                    Contribution Settings
                </Button>
            </div>

            {/* Calculation Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-50 rounded-lg">
                        <DollarSign className="text-green-600 w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Payroll Calculation</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
                            <select
                                value={data.user_id}
                                onChange={e => {
                                    setData('user_id', e.target.value);
                                    setCalculation(null);
                                    setCalcError(null);
                                }}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                            >
                                <option value="">Select an employee...</option>
                                <option value="all">ALL EMPLOYEES (Bulk Generate)</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name} - ₱{Number(emp.rate_per_day).toLocaleString()}/day
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Period Start *</label>
                            <div
                                className="relative cursor-pointer"
                                onClick={() => startDateRef.current?.showPicker()}
                            >
                                <input
                                    type="text"
                                    readOnly
                                    placeholder="MM/DD/YYYY"
                                    value={data.start_date ? format(parseISO(data.start_date), 'MM/dd/yyyy') : ''}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-white cursor-pointer pointer-events-none"
                                />
                                <input
                                    ref={startDateRef}
                                    type="date"
                                    value={data.start_date}
                                    onChange={e => setData('start_date', e.target.value)}
                                    className="absolute inset-0 opacity-0 w-full h-full pointer-events-none -z-10"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Calendar size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Period End *</label>
                            <div
                                className="relative cursor-pointer"
                                onClick={() => endDateRef.current?.showPicker()}
                            >
                                <input
                                    type="text"
                                    readOnly
                                    placeholder="MM/DD/YYYY"
                                    value={data.end_date ? format(parseISO(data.end_date), 'MM/dd/yyyy') : ''}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-white cursor-pointer pointer-events-none"
                                />
                                <input
                                    ref={endDateRef}
                                    type="date"
                                    value={data.end_date}
                                    onChange={e => setData('end_date', e.target.value)}
                                    className="absolute inset-0 opacity-0 w-full h-full pointer-events-none -z-10"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Calendar size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {data.user_id === 'all' ? (
                            <button
                                onClick={handleGenerate}
                                disabled={processing}
                                className="w-full py-2.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-bold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 cursor-pointer"
                            >
                                {processing ? 'Generating...' : 'Generate Bulk Payroll'}
                            </button>
                        ) : (
                            <button
                                onClick={handleCalculate}
                                disabled={calculating || !data.user_id || !data.start_date || !data.end_date}
                                className="w-full py-2.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-bold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 cursor-pointer"
                            >
                                {calculating ? 'Calculating...' : 'Calculate'}
                            </button>
                        )}

                        {calcError && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                                <span className="font-bold">Error:</span> {calcError}
                            </div>
                        )}
                    </div>

                    {/* Preview Section */}
                    <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText size={18} className="text-blue-500" />
                            Calculation Preview
                        </h3>

                        {calculation ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Hours Breakdown</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Days Worked:</span>
                                            <div className="font-bold text-gray-900">{calculation.days_worked}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Total Hours:</span>
                                            <div className="font-bold text-gray-900">{calculation.total_hours} hrs</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Hourly Rate:</span>
                                        <span className="font-bold">₱{Number(calculation.hourly_rate).toFixed(2)}/hr</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b border-dashed border-gray-100">
                                        <span className="text-gray-600">Regular Pay ({calculation.regular_hours} hrs):</span>
                                        <span className="font-bold">₱{Number(calculation.regular_pay).toLocaleString()}</span>
                                    </div>
                                    {Number(calculation.overtime_pay) > 0 && (
                                        <div className="flex justify-between text-sm py-2 border-b border-dashed border-gray-300">
                                            <span className="text-gray-600 font-medium text-amber-600 flex items-center gap-1">
                                                <Clock size={12} /> Overtime Pay ({calculation.overtime_hours} hrs):
                                            </span>
                                            <span className="font-bold text-amber-600">₱{Number(calculation.overtime_pay).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-base font-bold text-gray-900 pt-1">
                                        <span>Gross Pay:</span>
                                        <span>₱{Number(calculation.gross_pay).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Deductions</h4>
                                    <div className="space-y-1 text-sm text-red-600">
                                        <div className="flex justify-between">
                                            <span>SSS:</span>
                                            <span>-₱{Number(calculation.deductions.sss).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>PhilHealth:</span>
                                            <span>-₱{Number(calculation.deductions.philhealth).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Pag-IBIG:</span>
                                            <span>-₱{Number(calculation.deductions.pagibig).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between font-bold pt-2 border-t border-red-100 mt-2">
                                            <span>Total Deductions:</span>
                                            <span>-₱{Number(calculation.total_deductions).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t-2 border-gray-200">
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-green-700 text-lg">Net Pay:</span>
                                            <span className="font-bold text-green-700 text-2xl">₱{Number(calculation.net_pay).toLocaleString()}</span>
                                        </div>

                                        <button
                                            onClick={handleGenerate}
                                            disabled={processing}
                                            className="px-6 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-bold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                                        >
                                            <CheckCircle size={18} />
                                            {processing ? 'Saving...' : 'Generate Payroll'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-[200px]">
                                <Calculator className="w-12 h-12 mb-2 opacity-20" />
                                <p className="text-sm">Select employee and dates to view calculation</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-xl border border-[hsl(var(--border))] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[hsl(var(--border))] flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">Payroll Records</h2>

                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={16} />
                            <Input
                                placeholder="Search employee..."
                                className="pl-9 w-full"
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Input
                                type="date"
                                className="w-full sm:w-auto"
                                value={dateFilter}
                                onChange={handleDateFilter}
                            />

                            {(searchQuery || dateFilter) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    title="Clear Filters"
                                    className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]"
                                >
                                    <X size={18} />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="relative w-full overflow-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] uppercase tracking-wider text-xs font-bold">
                            <tr>
                                <th className="py-4 px-6">Employee</th>
                                <th className="py-4 px-6">Period</th>
                                <th className="py-4 px-6">Total Hours</th>
                                <th className="py-4 px-6">Gross Pay</th>
                                <th className="py-4 px-6">Deductions</th>
                                <th className="py-4 px-6">Net Pay</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[hsl(var(--border))]">
                            {filteredPayrolls.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-[hsl(var(--muted-foreground))]">
                                        No payroll records found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredPayrolls.map((payroll) => (
                                    <tr key={payroll.id} className="hover:bg-[hsl(var(--muted))/0.3] transition-colors">
                                        <td className="py-4 px-6 font-bold text-[hsl(var(--foreground))]">
                                            {payroll.employee_name}
                                        </td>
                                        <td className="py-4 px-6 text-[hsl(var(--muted-foreground))]">
                                            {format(new Date(payroll.start_date), 'M/d/yyyy')} - {format(new Date(payroll.end_date), 'M/d/yyyy')}
                                        </td>
                                        <td className="py-4 px-6 text-[hsl(var(--muted-foreground))]">
                                            {Number(payroll.total_hours).toFixed(2)} hrs
                                        </td>
                                        <td className="py-4 px-6 text-[hsl(var(--foreground))]">
                                            ₱{Number(payroll.gross_pay).toFixed(2)}
                                        </td>
                                        <td className="py-4 px-6 text-red-500">
                                            ₱{Number(payroll.deductions).toFixed(2)}
                                        </td>
                                        <td className="py-4 px-6 text-green-600">
                                            ₱{Number(payroll.net_pay).toFixed(2)}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${payroll.status === 'paid'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                }`}>
                                                {payroll.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openDetailsModal(payroll)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded hover:bg-gray-200 transition-colors cursor-pointer"
                                                >
                                                    Details
                                                </button>
                                                {payroll.status === 'draft' && (
                                                    <Link
                                                        href={route('admin.payroll.pay', payroll.id)}
                                                        method="post"
                                                        as="button"
                                                        className="inline-flex items-center px-3 py-1.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xs font-bold rounded hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                                                    >
                                                        Mark Paid
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="px-6 pb-6">
                    <Pagination links={payrolls.links} />
                </div>
            </div>

            <ContributionSettingsModal
                isOpen={isContributionModalOpen}
                onClose={() => setIsContributionModalOpen(false)}
                employees={employees}
            />

            <PayrollDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                payroll={selectedPayroll}
            />
        </div>
    );
};

Payroll.layout = page => <AdminLayout>{page}</AdminLayout>;

export default Payroll;