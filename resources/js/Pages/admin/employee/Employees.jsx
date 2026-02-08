import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Users, Search, Plus, MapPin, Phone, Mail, Edit2, Wallet, Briefcase, FileText, Eye, Archive, Trash2 } from 'lucide-react';
import Button from '@/Components/employees/Button';
import Input from '@/Components/employees/Input';
import { Card } from '@/Components/employees/Card';
import Badge from '@/Components/employees/Badge';
import Modal from '@/Components/employees/Modal';
import Pagination from '@/Components/employees/Pagination';
import Select from '@/Components/employees/Select';

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
        <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} maxWidth="max-w-md">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Personal Information */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">First Name</label>
                        <Input
                            value={data.first_name}
                            onChange={e => setData('first_name', e.target.value)}
                            disabled={isView}
                            error={errors.first_name}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Last Name</label>
                        <Input
                            value={data.last_name}
                            onChange={e => setData('last_name', e.target.value)}
                            disabled={isView}
                            error={errors.last_name}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Contact Number</label>
                    <Input
                        value={data.contact_number}
                        onChange={e => setData('contact_number', e.target.value)}
                        disabled={isView}
                        error={errors.contact_number}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Address</label>
                    <Input
                        value={data.address}
                        onChange={e => setData('address', e.target.value)}
                        disabled={isView}
                        error={errors.address}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Job Title</label>
                        <Input
                            value={data.job_title}
                            onChange={e => setData('job_title', e.target.value)}
                            disabled={isView}
                            error={errors.job_title}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Department</label>
                        <Input
                            value={data.department}
                            onChange={e => setData('department', e.target.value)}
                            disabled={isView}
                            error={errors.department}
                        />
                    </div>
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
                    {errors.location_id && <p className="text-sm text-red-500">{errors.location_id}</p>}
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
                        <option value="part_time">Part Time</option>
                        <option value="contract">Contract</option>
                    </select>
                </div>

                {/* Compensation */}
                {!isView && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Hourly Rate (PHP)</label>
                            <Input
                                type="number"
                                value={data.hourly_rate}
                                onChange={e => setData('hourly_rate', e.target.value)}
                                disabled={isView}
                                error={errors.hourly_rate}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Basic Salary (Monthly)</label>
                            <Input
                                type="number"
                                value={data.basic_salary}
                                onChange={e => setData('basic_salary', e.target.value)}
                                disabled={isView}
                                error={errors.basic_salary}
                            />
                        </div>
                    </div>
                )}

                {/* Clock PIN */}
                {!isView && (
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
                            error={errors.clock_pin}
                        />
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Required for clocking in at the kiosk</p>
                    </div>
                )}

                {/* Actions */}
                {!isView && (
                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={processing}>
                            {isEdit ? 'Save Changes' : 'Add Employee'}
                        </Button>
                    </div>
                )}
            </form>
        </Modal>
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
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={18} />
                        <Input
                            placeholder="Search employees..."
                            className="pl-10"
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
                                    <tr key={employee.id} className="hover:bg-[hsl(var(--muted))]/20 transition-colors">
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
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon-sm" onClick={() => handleView(employee)}>
                                                    <Eye size={16} />
                                                </Button>
                                                {!employee.deleted_at && (
                                                    <>
                                                        <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(employee)}>
                                                            <Edit2 size={16} />
                                                        </Button>
                                                        <Button variant="ghost-destructive" size="icon-sm" onClick={() => handleDelete(employee)}>
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </>
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
