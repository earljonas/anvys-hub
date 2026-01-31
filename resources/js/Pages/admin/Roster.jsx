import React, { useState, useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Search, Filter, Plus, MapPin, ChevronDown } from 'lucide-react';
import RosterTable from '../../Components/roster/RosterTable';
import AddEmployeeModal from '../../Components/roster/AddEmployeeModal';
import EditEmployeeModal from '../../Components/roster/EditEmployeeModal';
import ViewEmployeeModal from '../../Components/roster/ViewEmployeeModal';
import Input from '../../Components/common/Input';
import Button from '../../Components/common/Button';

const Roster = () => {
    // Get employees and locations from Inertia props
    const { employees = [], locations: locationOptions } = usePage().props;

    // Local State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [locationFilter, setLocationFilter] = useState('All Locations');

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const locationNames = useMemo(() => {
        return locationOptions ? locationOptions.map(l => l.name) : [];
    }, [locationOptions]);

    // Filter
    const filteredEmployees = employees.filter(emp => {
        const matchesSearch =
            emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'All Status' || emp.status === statusFilter;
        const matchesLocation = locationFilter === 'All Locations' || emp.location === locationFilter;

        return matchesSearch && matchesStatus && matchesLocation;
    });

    // Handlers
    const handleAddEmployee = (newEmployeeData) => {
        router.post('/admin/employees', newEmployeeData, {
            preserveScroll: true,
            onSuccess: () => setIsAddModalOpen(false),
        });
    };

    const handleEdit = (employee) => {
        setSelectedEmployee(employee);
        setIsEditModalOpen(true);
        setIsViewModalOpen(false);
    };

    const handleView = (employee) => {
        setSelectedEmployee(employee);
        setIsViewModalOpen(true);
    };

    const handleArchive = (employee) => {
        if (confirm(`Are you sure you want to archive ${employee.name}?`)) {
            router.delete(`/admin/employees/${employee.id}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSaveEdit = (updatedEmployeeData) => {
        if (!selectedEmployee) return;

        router.put(`/admin/employees/${selectedEmployee.id}`, updatedEmployeeData, {
            preserveScroll: true,
            onSuccess: () => setIsEditModalOpen(false),
        });
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-5 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Roster</h1>
                <Button
                    variant="primary"
                    className="flex items-center gap-2"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <Plus size={18} /> Add Employee
                </Button>
            </div>

            {/* Search and Filter Section */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="w-full md:w-100%">
                    <Input
                        icon={Search}
                        placeholder="Search employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-4">
                    {/* Status Filter */}
                    <div className="relative min-w-[160px]">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--muted-foreground))] h-4 w-4 pointer-events-none" />
                        <select
                            className="w-full pl-10 pr-10 py-2 bg-white border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm text-[hsl(var(--foreground))] appearance-none cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All Status">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--muted-foreground))] h-4 w-4 pointer-events-none" />
                    </div>

                    {/* Location Filter */}
                    <div className="relative min-w-[200px]">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--muted-foreground))] h-4 w-4 pointer-events-none" />
                        <select
                            className="w-full pl-10 pr-10 py-2 bg-white border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm text-[hsl(var(--foreground))] appearance-none cursor-pointer"
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                        >
                            <option value="All Locations">All Locations</option>
                            {locationNames.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--muted-foreground))] h-4 w-4 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Roster Table */}
            <RosterTable
                employees={filteredEmployees}
                pagination={{ currentPage: 1, totalPages: 1 }}
                onPageChange={(page) => console.log('Page:', page)}
                onEdit={handleEdit}
                onView={handleView}
                onArchive={handleArchive}
            />

            {/* Modals */}
            <AddEmployeeModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddEmployee}
                locations={locationOptions}
            />

            <EditEmployeeModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                employee={selectedEmployee}
                onSave={handleSaveEdit}
                locations={locationOptions}
            />

            <ViewEmployeeModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                employee={selectedEmployee}
                onEdit={handleEdit}
            />
        </div>
    );
};

Roster.layout = page => <AdminLayout>{page}</AdminLayout>;

export default Roster;