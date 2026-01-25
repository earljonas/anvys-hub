import React, { useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Plus, Archive, LayoutGrid } from 'lucide-react';
import Button from '../../Components/common/Button';
import LocationCard from '../../Components/locations/LocationCard';
import AddLocationCard from '../../Components/locations/AddLocationCard';
import LocationModal from '../../Components/locations/LocationModal';

// Mock Data (Replace with Inertia props later)
const MOCK_LOCATIONS = [
    { id: 1, name: 'SM Mall Branch', address: '123 SM Mall, Makati City', status: 'Active', staffCount: 3 },
    { id: 2, name: 'Robinsons Branch', address: '456 Robinsons Place, Quezon City', status: 'Active', staffCount: 3 },
    { id: 3, name: 'Ayala Center', address: '789 Ayala Ave, Makati City', status: 'Active', staffCount: 3 },
];

const Locations = () => {
    // State
    const [locations, setLocations] = useState(MOCK_LOCATIONS);
    const [activeTab, setActiveTab] = useState('active');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('view'); // 'view', 'add', 'edit'
    const [selectedLocation, setSelectedLocation] = useState(null);

    // Filter Logic
    const activeLocations = locations.filter(l => l.status === 'Active');
    const archivedLocations = locations.filter(l => l.status !== 'Active');
    const displayedLocations = activeTab === 'active' ? activeLocations : archivedLocations;

    // Handlers
    const handleView = (location) => {
        setSelectedLocation(location);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedLocation(null);
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleEdit = (location) => {
        setSelectedLocation(location);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleDelete = (location) => {
        // Implement delete/archive logic here
        if (confirm(`Are you sure you want to archive ${location.name}?`)) {
            console.log('Archiving', location.id);
        }
    };

    const handleSave = (data) => {
        console.log('Saving data', data);
        setIsModalOpen(false);
        // Here you would typically make an Inertia router.post/put call
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-5 space-y-6">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Locations</h1>
                </div>
                <Button variant="primary" onClick={handleAdd} className="flex items-center gap-2">
                    <Plus size={18} />
                    Add Location
                </Button>
            </div>

            {/* Tabs / Filters */}
            <div className="flex items-center gap-2 bg-[hsl(var(--muted))] p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'active'
                        ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm'
                        : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                        }`}
                >
                    <LayoutGrid size={16} />
                    Active ({activeLocations.length})
                </button>
                <button
                    onClick={() => setActiveTab('archived')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'archived'
                        ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm'
                        : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                        }`}
                >
                    <Archive size={16} />
                    Archived ({archivedLocations.length})
                </button>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedLocations.map((location) => (
                    <LocationCard
                        key={location.id}
                        location={location}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}

                {/* Always show Add Card at the end if we are in Active tab */}
                {activeTab === 'active' && (
                    <AddLocationCard onClick={handleAdd} />
                )}
            </div>

            {/* Unified Modal */}
            <LocationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                location={selectedLocation}
                onSave={handleSave}
            />
        </div>
    );
};

Locations.layout = page => <AdminLayout>{page}</AdminLayout>;

export default Locations;