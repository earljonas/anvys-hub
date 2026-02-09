import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Clock, Search, X, Eye, Edit2, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Button from '@/Components/employees/Button';
import Input from '@/Components/employees/Input';
import { Card } from '@/Components/employees/Card';
import Badge from '@/Components/employees/Badge';
import Modal from '@/Components/employees/Modal';
import Pagination from '@/Components/employees/Pagination';


const StatusBadge = ({ status, isOngoing }) => {
    let variant = 'default';
    let label = status;
    let className = "uppercase text-[10px] px-2";

    if (status === 'approved') variant = 'success';
    if (status === 'rejected') variant = 'destructive';
    if (status === 'pending') {
        if (isOngoing) {
            variant = 'success';
            label = 'WORKING';
            className += " animate-pulse";
        } else {
            variant = 'warning';
        }
    }

    return (
        <Badge variant={variant} className={className}>
            {label}
        </Badge>
    );
};

const AttendanceModal = ({ isOpen, onClose, record, mode = 'view' }) => {
    // if (!isOpen || !record) return null; // Removed check, handled by parent

    const isView = mode === 'view';
    const title = isView ? 'Attendance Details' : 'Edit Attendance Time';

    // Helper to split DB timestamp into Date and Time components
    // Helper to split DB timestamp into Date and Time components
    const splitDateTime = (dateString) => {
        if (!dateString) return { date: '', time: '' };

        try {
            // Use parseISO to align with Table rendering logic
            const dateObj = parseISO(dateString);
            if (!isNaN(dateObj)) {
                return {
                    date: format(dateObj, 'yyyy-MM-dd'),
                    time: format(dateObj, 'HH:mm')
                };
            }
        } catch (e) {
            console.error(e);
        }

        // Fallback for partial strings or failures
        const dateMatch = dateString.match(/\d{4}-\d{2}-\d{2}/);
        const timeMatch = dateString.match(/\d{2}:\d{2}/);
        return {
            date: dateMatch ? dateMatch[0] : '',
            time: timeMatch ? timeMatch[0] : ''
        };
    };

    const initialIn = splitDateTime(record.clock_in);
    const initialOut = splitDateTime(record.clock_out);

    const { data, setData, put, processing, errors, transform } = useForm({
        clock_in_date: initialIn.date,
        clock_in_time: initialIn.time,
        clock_out_date: initialOut.date,
        clock_out_time: initialOut.time,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isView) return;

        transform((data) => {
            // Helper to convert Local Input -> UTC ISO String
            const toISO = (dateStr, timeStr) => {
                if (!dateStr || !timeStr) return null;
                const localDate = new Date(`${dateStr}T${timeStr}`);
                return !isNaN(localDate) ? localDate.toISOString() : null;
            };

            return {
                ...data,
                // These will be sent as "2026-01-05T00:00:00.000Z" (if input was 8am Local)
                clock_in: toISO(data.clock_in_date, data.clock_in_time),
                clock_out: toISO(data.clock_out_date, data.clock_out_time),
            };
        });

        put(route('admin.attendance.update', record.id), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Time In</label>
                        <div className="flex gap-2">
                            <Input
                                type="date"
                                className="w-[140px]"
                                value={data.clock_in_date}
                                onChange={e => setData('clock_in_date', e.target.value)}
                                disabled={isView}
                                required
                            />
                            <Input
                                type="time"
                                className="flex-1"
                                value={data.clock_in_time}
                                onChange={e => setData('clock_in_time', e.target.value)}
                                disabled={isView}
                                required
                            />
                        </div>
                        {errors.clock_in && <div className="text-[hsl(var(--destructive))] text-xs mt-1">{errors.clock_in}</div>}
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Time Out</label>
                        <div className="flex gap-2">
                            <Input
                                type="date"
                                className="w-[140px]"
                                value={data.clock_out_date}
                                onChange={e => setData('clock_out_date', e.target.value)}
                                disabled={isView}
                            />
                            <Input
                                type="time"
                                className="flex-1"
                                value={data.clock_out_time}
                                onChange={e => setData('clock_out_time', e.target.value)}
                                disabled={isView}
                            />
                        </div>
                        {errors.clock_out && <div className="text-[hsl(var(--destructive))] text-xs mt-1">{errors.clock_out}</div>}
                    </div>
                </div>

                <div className="flex gap-3 pt-4 justify-end border-t border-[hsl(var(--border))] mt-6">
                    <Button variant="outline" type="button" onClick={onClose}>
                        Close
                    </Button>
                    {!isView && (
                        <Button
                            type="submit"
                            disabled={processing}
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    )}
                </div>
            </form>
        </Modal>
    );
};

const Attendance = ({ records, filters }) => {
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [modalMode, setModalMode] = useState('view'); // 'view', 'edit'
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Initialize state from server filters
    const [dateFilter, setDateFilter] = useState(filters?.date || '');
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');

    const openViewModal = (record) => {
        setSelectedRecord(record);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const openEditModal = (record) => {
        setSelectedRecord(record);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleApprove = (record) => {
        if (confirm(`Approve attendance for ${record.user.name}?`)) {
            router.post(route('admin.attendance.approve', record.id));
        }
    };

    const handleReject = (record) => {
        if (confirm(`Reject attendance for ${record.user.name}?`)) {
            router.post(route('admin.attendance.reject', record.id));
        }
    };

    // Server-side filtering helpers
    const handleFilterChange = (key, value) => {
        router.get(
            route('admin.attendance'),
            { ...filters, [key]: value },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
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
        router.get(route('admin.attendance'), {}, { preserveState: true, preserveScroll: true });
    };

    // Use server data directly
    const filteredRecords = records.data;

    // Robust Date/Time formatter that prefers the string value if available
    const formatTime = (dateString) => {
        if (!dateString) return '-';
        try {
            // If it's a standard SQL timestamp (YYYY-MM-DD HH:mm:ss) from our backend conversion
            if (dateString.includes(' ') && !dateString.includes('T')) {
                // Parse manually to avoid timezone shifting
                // "2026-01-29 08:00:00" -> Time is 08:00
                const [datePart, timePart] = dateString.split(' ');
                const [hours, minutes] = timePart.split(':');
                const dateObj = new Date();
                dateObj.setHours(parseInt(hours), parseInt(minutes));
                return format(dateObj, 'h:mm a');
            }
            // Fallback for ISO strings or other formats
            return format(parseISO(dateString), 'h:mm a');
        } catch (e) {
            return dateString;
        }
    };

    // Robust Date formatter
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            if (dateString.includes(' ') && !dateString.includes('T')) {
                return dateString.substring(0, 10);
            }
            return format(parseISO(dateString), 'yyyy-MM-dd');
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-5 space-y-6">
            <Head title="Attendance" />

            {/* Header Card */}
            <div className="bg-white rounded-xl border border-[hsl(var(--border))] shadow-sm p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-[hsl(var(--foreground))]" />
                        <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">Attendance</h1>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={16} />
                            <Input
                                placeholder="Search by employee name..."
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

                {/* Table */}
                <div className="relative w-full overflow-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[hsl(var(--muted-foreground))] border-b-2 border-[hsl(var(--border))] font-bold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="py-4 pr-4 pl-0 align-middle">Employee</th>
                                <th className="py-4 px-4 align-middle">Date</th>
                                <th className="py-4 px-4 align-middle">Time In</th>
                                <th className="py-4 px-4 align-middle">Time Out</th>
                                <th className="py-4 px-4 align-middle">Hours Worked</th>
                                <th className="py-4 px-4 align-middle">Status</th>
                                <th className="py-4 px-4 align-middle text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[hsl(var(--border))]">
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-8 text-center text-[hsl(var(--muted-foreground))]">
                                        No attendance records found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-[hsl(var(--muted))/0.3] transition-colors group">
                                        <td className="py-4 pr-4 pl-0 align-middle font-bold text-[hsl(var(--foreground))] whitespace-nowrap">
                                            {record.user.name}
                                        </td>
                                        <td className="py-4 px-4 align-middle text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                                            {formatDate(record.clock_in)}
                                        </td>
                                        <td className="py-4 px-4 align-middle whitespace-nowrap">
                                            {formatTime(record.clock_in)}
                                        </td>
                                        <td className="py-4 px-4 align-middle whitespace-nowrap">
                                            {formatTime(record.clock_out)}
                                        </td>
                                        <td className="py-4 px-4 align-middle font-medium whitespace-nowrap">
                                            {record.total_hours ? Number(record.total_hours).toFixed(1) : '0'}
                                        </td>
                                        <td className="py-4 px-4 align-middle">
                                            <StatusBadge status={record.status} isOngoing={!record.clock_out} />
                                        </td>
                                        <td className="py-4 px-4 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                                {record.status === 'pending' && record.clock_out && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            title="Approve"
                                                            onClick={() => handleApprove(record)}
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        >
                                                            <Check size={16} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            title="Reject"
                                                            onClick={() => handleReject(record)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <X size={16} />
                                                        </Button>
                                                    </>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    title="View Details"
                                                    onClick={() => openViewModal(record)}
                                                >
                                                    <Eye size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    title="Edit Record"
                                                    onClick={() => openEditModal(record)}
                                                >
                                                    <Edit2 size={16} />
                                                </Button>
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
                    <Pagination links={records.links} />
                </div>
            </div>

            {isModalOpen && selectedRecord && (
                <AttendanceModal
                    key={selectedRecord.id}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    record={selectedRecord}
                    mode={modalMode}
                />
            )}
        </div>
    );
};

Attendance.layout = page => <AdminLayout>{page}</AdminLayout>;

export default Attendance;