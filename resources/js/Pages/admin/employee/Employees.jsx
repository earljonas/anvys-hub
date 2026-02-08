import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Users, Search, Plus, MapPin, Phone, Mail, Edit2, Wallet, Briefcase, FileText, Eye, Archive, MoreVertical, RotateCcw, X } from 'lucide-react';
import Button from '@/Components/common/Button';
import Input from '@/Components/common/Input';
import { Card } from '@/Components/employees/Card';
import Badge from '@/Components/employees/Badge';
import Pagination from '@/Components/employees/Pagination';
import Select from '@/Components/employees/Select';

// Action Menu Component (burger menu)
const ActionMenu = ({ employee, onView, onEdit, onArchive }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState('bottom');
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            // If less than 200px below, open upwards
            if (spaceBelow < 200) {
                setMenuPosition('top');
            } else {
                setMenuPosition('bottom');
            }
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                ref={buttonRef}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
                <MoreVertical size={16} />
            </button>

            {isOpen && (
                <div className={`absolute right-0 w-32 bg-white rounded-lg shadow-lg border border-[hsl(var(--border))] z-50 py-1 ${menuPosition === 'top' ? 'bottom-full mb-1' : 'mt-1'}`}>
                    {!employee.deleted_at && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(employee);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] flex items-center gap-2"
                            >
                                <Edit2 size={14} />
                                Edit
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onArchive(employee);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <Archive size={14} />
                                Archive
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

const EmployeeModal = ({ isOpen, onClose, employee = null, mode = 'create', locations = [] }) => {
    const isEdit = mode === 'edit';
    const isView = mode === 'view';

    const { data, setData, post, put, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        contact_number: '',
        address: '',
        location_id: '',
        job_title: '',
        department: '',
        employment_type: 'full_time',
        hourly_rate: 0,
        basic_salary: 0,
        clock_pin: '',
    });

    useEffect(() => {
        if (isOpen) {
            if (employee && (isEdit || isView)) {
                setData({
                    first_name: employee.first_name || '',
                    last_name: employee.last_name || '',
                    contact_number: employee.contact_number || '',
                    address: employee.address || '',
                    location_id: employee.employee?.location_id || '',
                    job_title: employee.employee?.job_title || '',
                    department: employee.employee?.department || '',
                    employment_type: employee.employee?.employment_type || 'full_time',
                    hourly_rate: employee.employee?.hourly_rate || 0,
                    basic_salary: employee.employee?.basic_salary || 0,
                    clock_pin: employee.clock_pin || '',
                });
            } else {
                reset();
            }
        }
    }, [employee, mode, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isView) return;

        if (isEdit) {
            put(route('admin.employees.update', employee.id), {
                onSuccess: () => { onClose(); reset(); }
            });
        } else {
            post(route('admin.employees.store'), {
                onSuccess: () => { onClose(); reset(); }
            });
        }
    };

    if (!isOpen) return null;

    const getTitle = () => {
        if (isView) return 'Employee Details';
        if (isEdit) return 'Edit Employee Details';
        return 'Add New Employee';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden border border-[hsl(var(--border))] max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-[hsl(var(--border))] shrink-0 bg-white">
                    <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">{getTitle()}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-[hsl(var(--muted))] rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                        type="button"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <form id="employee-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Section: Personal Information */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider border-b border-[hsl(var(--border))] pb-2">
                                Personal Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">First Name</label>
                                    <Input
                                        value={data.first_name}
                                        onChange={e => setData('first_name', e.target.value)}
                                        disabled={isView}
                                        placeholder="e.g. Juan"
                                    />
                                    {errors.first_name && <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Last Name</label>
                                    <Input
                                        value={data.last_name}
                                        onChange={e => setData('last_name', e.target.value)}
                                        disabled={isView}
                                        placeholder="e.g. Dela Cruz"
                                    />
                                    {errors.last_name && <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Contact Number</label>
                                    <Input
                                        value={data.contact_number}
                                        onChange={e => setData('contact_number', e.target.value)}
                                        disabled={isView}
                                        placeholder="e.g. 0912 345 6789"
                                    />
                                    {errors.contact_number && <p className="text-sm text-red-500 mt-1">{errors.contact_number}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Address</label>
                                    <Input
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        disabled={isView}
                                        placeholder="e.g. 123 Main St, Manila"
                                    />
                                    {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section: Employment Details */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider border-b border-[hsl(var(--border))] pb-2">
                                Employment Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Job Title</label>
                                    <Input
                                        value={data.job_title}
                                        onChange={e => setData('job_title', e.target.value)}
                                        disabled={isView}
                                        placeholder="e.g. Barista"
                                    />
                                    {errors.job_title && <p className="text-sm text-red-500 mt-1">{errors.job_title}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Department</label>
                                    <Input
                                        value={data.department}
                                        onChange={e => setData('department', e.target.value)}
                                        disabled={isView}
                                        placeholder="e.g. Operations"
                                    />
                                    {errors.department && <p className="text-sm text-red-500 mt-1">{errors.department}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Assigned Branch</label>
                                    <select
                                        className="w-full px-4 py-2 border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] bg-white text-[hsl(var(--foreground))]"
                                        value={data.location_id}
                                        onChange={e => setData('location_id', e.target.value)}
                                        disabled={isView}
                                    >
                                        <option value="">Select a location</option>
                                        {locations.map(loc => (
                                            <option key={loc.id} value={loc.id}>
                                                {loc.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.location_id && <p className="text-sm text-red-500 mt-1">{errors.location_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Employment Type</label>
                                    <select
                                        className="w-full px-4 py-2 border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] bg-white text-[hsl(var(--foreground))]"
                                        value={data.employment_type}
                                        onChange={e => setData('employment_type', e.target.value)}
                                        disabled={isView}
                                    >
                                        <option value="full_time">Full Time</option>
                                    </select>
                                </div>
                                {/* Clock PIN */}
                                {(!isView || isEdit) && (
                                    <div>
                                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Clock-In PIN (4 digits)</label>
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={4}
                                            pattern="[0-9]*"
                                            placeholder="Enter 4-digit PIN"
                                            value={data.clock_pin}
                                            onChange={e => setData('clock_pin', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                            disabled={isView}
                                        />
                                        {errors.clock_pin && <p className="text-sm text-red-500 mt-1">{errors.clock_pin}</p>}
                                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Required for clocking in</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section: Compensation */}
                        {!isView && (
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider border-b border-[hsl(var(--border))] pb-2">
                                    Compensation
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Hourly Rate (PHP)</label>
                                        <Input
                                            type="number"
                                            value={data.hourly_rate}
                                            onChange={e => setData('hourly_rate', e.target.value)}
                                            disabled={isView}
                                            placeholder="0.00"
                                        />
                                        {errors.hourly_rate && <p className="text-sm text-red-500 mt-1">{errors.hourly_rate}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Basic Salary (Monthly)</label>
                                        <Input
                                            type="number"
                                            value={data.basic_salary}
                                            onChange={e => setData('basic_salary', e.target.value)}
                                            disabled={isView}
                                            placeholder="0.00"
                                        />
                                        {errors.basic_salary && <p className="text-sm text-red-500 mt-1">{errors.basic_salary}</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer - Actions */}
                <div className="p-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/10 flex justify-end gap-3 shrink-0 rounded-b-xl">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="border border-[hsl(var(--muted))] bg-white hover:bg-[hsl(var(--muted))]"
                    >
                        {isView ? 'Close' : 'Cancel'}
                    </Button>
                    {!isView && (
                        <Button
                            type="submit"
                            form="employee-form"
                            disabled={processing}
                            variant="primary"
                            className="shadow-md"
                        >
                            {isEdit ? 'Save Changes' : 'Create Employee'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

const Employees = ({ employees = { data: [], links: [] }, locations = [], filters = {} }) => {
    // 1. SAFETY: Ensure filters handles nulls
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'Active');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        router.get(route('admin.employees'), { search: query, status: statusFilter }, { preserveState: true, replace: true });
    };

    const handleStatusFilter = (e) => {
        const status = e.target.value;
        setStatusFilter(status);
        router.get(route('admin.employees'), { search: searchQuery, status: status }, { preserveState: true, replace: true });
    };

    const handleCreate = () => {
        setSelectedEmployee(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleEdit = (employee) => {
        setSelectedEmployee(employee);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (employee) => {
        setSelectedEmployee(employee);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleDelete = (employee) => {
        if (confirm(`Are you sure you want to archive ${employee.name}?`)) {
            router.delete(route('admin.employees.archive', employee.id));
        }
    };

    const handleRestore = (employee) => {
        if (confirm(`Are you sure you want to restore ${employee.name}?`)) {
            router.post(route('admin.employees.restore', employee.id));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-[hsl(var(--border))] shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Employee Directory</h1>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Add Employee
                </Button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl border border-[hsl(var(--border))] shadow-sm overflow-hidden p-6">

                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Input
                            icon={Search}
                            placeholder="Search employees..."
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="w-full md:w-48">
                        {/* Swapped Native Select for your Custom Select Component if applicable, otherwise standard select */}
                        <select
                            className="w-full px-4 py-2 border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] bg-white text-[hsl(var(--foreground))]"
                            value={statusFilter}
                            onChange={handleStatusFilter}
                        >
                            <option value="Active">Active Employees</option>
                            <option value="Archived">Archived Employees</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-lg border border-[hsl(var(--border))]">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[hsl(var(--muted))]/40 border-b border-[hsl(var(--border))] uppercase tracking-wider text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Position</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[hsl(var(--border))] bg-white">
                            {/* 2. SAFETY: Check if employees.data exists before mapping */}
                            {employees?.data?.length > 0 ? (
                                employees.data.map((employee) => (
                                    <tr
                                        key={employee.id}
                                        className="hover:bg-[hsl(var(--muted))]/20 transition-colors cursor-pointer"
                                        onClick={() => handleView(employee)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center text-[hsl(var(--primary))] font-bold">
                                                    {/* 3. SAFETY: Handle potential null names */}
                                                    {(employee.first_name?.[0] || employee.name?.[0] || '?').toUpperCase()}
                                                    {(employee.last_name?.[0] || '').toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[hsl(var(--foreground))]">{employee.name || 'Unknown'}</div>
                                                    <div className="text-xs text-[hsl(var(--muted-foreground))]">{employee.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {/* 4. SAFETY: Optional chaining for nested relations */}
                                            <div className="font-medium">{employee.employee?.job_title || 'N/A'}</div>
                                            <div className="text-xs text-[hsl(var(--muted-foreground))] capitalize">{employee.employee?.department || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {employee.employee?.location ? (
                                                <div className="flex items-center gap-1 text-[hsl(var(--muted-foreground))]">
                                                    <MapPin size={14} />
                                                    <span className="truncate max-w-[150px]">{employee.employee.location.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[hsl(var(--muted-foreground))] italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge variant={employee.deleted_at ? "secondary" : "default"}>
                                                {employee.deleted_at ? "Archived" : "Active"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-end">
                                                {employee.deleted_at ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRestore(employee)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <RotateCcw size={14} />
                                                        Restore
                                                    </Button>
                                                ) : (
                                                    <ActionMenu
                                                        employee={employee}
                                                        onView={handleView}
                                                        onEdit={handleEdit}
                                                        onArchive={handleDelete}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-[hsl(var(--muted-foreground))]">
                                        No employees found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 5. SAFETY: Only render pagination if links exist */}
                {employees?.links && (
                    <div className="mt-6">
                        <Pagination links={employees.links} />
                    </div>
                )}
            </div>

            <EmployeeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                employee={selectedEmployee}
                mode={modalMode}
                locations={locations}
            />
        </div>
    );
};

Employees.layout = page => <AdminLayout>{page}</AdminLayout>;

export default Employees;
