import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Search, Plus, MapPin, MoreVertical, Edit2, Archive, RotateCcw, Store } from 'lucide-react';
import Button from '@/Components/common/Button';
import Input from '@/Components/common/Input';
import LocationModal from '@/Components/locations/LocationModal';
import Badge from '@/Components/employees/Badge';

// Action Menu Component
const ActionMenu = ({ location, onView, onEdit, onArchive }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        const handleScroll = () => {
            if (isOpen && triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                setPosition({
                    top: rect.bottom + window.scrollY + 5,
                    left: rect.right - 128 + window.scrollX
                });
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, true);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [isOpen]);

    const toggleMenu = (e) => {
        e.stopPropagation();
        if (!isOpen) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY + 5,
                left: rect.right - 128 + window.scrollX
            });
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                onClick={toggleMenu}
                className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
                <MoreVertical size={16} />
            </button>

            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    style={{
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                        position: 'absolute'
                    }}
                    className="w-32 bg-[hsl(var(--card))] rounded-lg shadow-lg border border-[hsl(var(--border))] z-[9999] py-1"
                >
                    {location.status === 'Active' && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(location);
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
                                    onArchive(location);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <Archive size={14} />
                                Archive
                            </button>
                        </>
                    )}
                    {location.status !== 'Active' && (
                        <div className="px-3 py-2 text-xs text-[hsl(var(--muted-foreground))] italic">
                            Archived
                        </div>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
};

const Locations = () => {
    const { locations = [] } = usePage().props;

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Active');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('view');
    const [selectedLocation, setSelectedLocation] = useState(null);

    // Filter Logic
    const filteredLocations = locations.filter(location => {
        const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            location.address.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'Active' ? location.status === 'Active' : location.status !== 'Active';

        return matchesSearch && matchesStatus;
    });

    // Handlers
    const handleSearch = (e) => setSearchQuery(e.target.value);

    const handleStatusFilter = (e) => setStatusFilter(e.target.value);

    const handleCreate = () => {
        setSelectedLocation(null);
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleView = (location) => {
        setSelectedLocation(location);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleEdit = (location) => {
        setSelectedLocation(location);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleDelete = (location) => {
        if (confirm(`Are you sure you want to archive ${location.name}?`)) {
            // Using hardcoded path matching original implementation
            router.delete(`/admin/locations/${location.id}`, {
                preserveScroll: true,
            });
        }
    };

    const handleRestore = (location) => {
        if (confirm(`Are you sure you want to restore ${location.name}?`)) {
            router.post(`/admin/locations/${location.id}/restore`, {}, {
                preserveScroll: true,
            });
        }
    };

    const handleSave = (data) => {
        if (modalMode === 'add') {
            // Using hardcoded path matching original implementation
            router.post('/admin/locations', data, {
                preserveScroll: true,
                onSuccess: () => setIsModalOpen(false),
            });
        } else if (modalMode === 'edit' && selectedLocation) {
            // Using hardcoded path matching original implementation
            router.put(`/admin/locations/${selectedLocation.id}`, data, {
                preserveScroll: true,
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    // Metrics Calculation
    const totalLocations = locations.length;
    const activeLocationsCount = locations.filter(l => l.status === 'Active').length;
    const inactiveLocationsCount = totalLocations - activeLocationsCount;
    const totalStaffAssigned = locations.reduce((acc, curr) => acc + (curr.staffCount || 0), 0);

    return (
        <>
            <Head title="Locations" />

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-5 space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-[hsl(var(--border))] shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Locations</h1>
                    </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Locations */}
                    <div className="bg-white p-6 rounded-xl border border-[hsl(var(--border))] shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Total Locations</p>
                            <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{totalLocations}</p>
                        </div>
                    </div>

                    {/* Active Locations */}
                    <div className="bg-white p-6 rounded-xl border border-[hsl(var(--border))] shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                            <Store size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Active Locations</p>
                            <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{activeLocationsCount}</p>
                        </div>
                    </div>

                    {/* Inactive Locations */}
                    <div className="bg-white p-6 rounded-xl border border-[hsl(var(--border))] shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                            <Archive size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Inactive Locations</p>
                            <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{inactiveLocationsCount}</p>
                        </div>
                    </div>

                    {/* Staff Assigned */}
                    <div className="bg-white p-6 rounded-xl border border-[hsl(var(--border))] shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
                            <div className="flex -space-x-1">
                                <div className="w-6 h-6 rounded-full bg-purple-200 border-2 border-white"></div>
                                <div className="w-6 h-6 rounded-full bg-purple-300 border-2 border-white"></div>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Staff Assigned</p>
                            <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{totalStaffAssigned}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl border border-[hsl(var(--border))] shadow-sm overflow-hidden p-6">

                    {/* Search & Filter */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
                        <div className="relative flex-1 w-full">
                            <Input
                                icon={Search}
                                placeholder="Search locations..."
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <div className="w-full md:w-48">
                                <select
                                    className="w-full px-4 py-2 border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] bg-white text-[hsl(var(--foreground))]"
                                    value={statusFilter}
                                    onChange={handleStatusFilter}
                                >
                                    <option value="Active">Active Locations</option>
                                    <option value="Archived">Archived Locations</option>
                                </select>
                            </div>
                            <Button onClick={handleCreate} className="whitespace-nowrap">
                                <Plus className="mr-2 h-4 w-4" /> Add Location
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto rounded-lg border border-[hsl(var(--border))]">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[hsl(var(--muted))]/40 border-b border-[hsl(var(--border))] uppercase tracking-wider text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                                <tr>
                                    <th className="px-6 py-4">Location Name</th>
                                    <th className="px-6 py-4">Address</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Staff</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[hsl(var(--border))] bg-white">
                                {filteredLocations.length > 0 ? (
                                    filteredLocations.map((location) => (
                                        <tr
                                            key={location.id}
                                            className="hover:bg-[hsl(var(--muted))]/20 transition-colors cursor-pointer"
                                            onClick={() => handleView(location)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center text-[hsl(var(--primary))]">
                                                        <Store size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-[hsl(var(--foreground))]">{location.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                                                    <MapPin size={14} />
                                                    <span className="truncate max-w-[300px]">{location.address}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge variant={location.status !== 'Active' ? "secondary" : "default"}>
                                                    {location.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium text-[hsl(var(--foreground))]">
                                                {location.staffCount || 0}
                                            </td>
                                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-end">
                                                    {location.status !== 'Active' ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRestore(location);
                                                            }}
                                                            className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                                        >
                                                            <RotateCcw size={14} />
                                                            Restore
                                                        </Button>
                                                    ) : (
                                                        <ActionMenu
                                                            location={location}
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
                                        <td colSpan="5" className="px-6 py-12 text-center text-[hsl(var(--muted-foreground))]">
                                            No locations found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <LocationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    mode={modalMode}
                    location={selectedLocation}
                    onSave={handleSave}
                />
            </div>
        </>
    );
};

Locations.layout = page => <AdminLayout>{page}</AdminLayout>;

export default Locations;