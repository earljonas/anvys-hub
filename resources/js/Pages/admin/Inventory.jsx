import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Plus, History } from 'lucide-react';
import Button from '../../Components/common/Button';
import InventoryStats from '../../Components/inventory/InventoryStats';
import InventoryFilters from '../../Components/inventory/InventoryFilters';
import InventoryTable from '../../Components/inventory/InventoryTable';
import AddItem from '../../Components/inventory/AddItem';
import StockLogs from '../../Components/inventory/StockLogs';
import ViewItemModal from '../../Components/inventory/ViewItemModal';
import AdjustStockModal from '../../Components/inventory/AdjustStockModal';
import EditItemModal from '../../Components/inventory/EditItemModal';
import AdminLayout from '../../Layouts/AdminLayout';

const AdminInventory = ({ items: initialItems = [], locations = [], logs: initialLogs = [] }) => {
    const [items, setItems] = useState(initialItems);
    const [logs, setLogs] = useState(initialLogs);

    // Update local state when props change (after server updates)
    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    useEffect(() => {
        setLogs(initialLogs);
    }, [initialLogs]);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [locationFilter, setLocationFilter] = useState('All Locations');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Get location names for filters
    const locationNames = locations.map(loc => loc.name);

    // Derived State
    // When "All Locations" filter is selected, show all items from all branches
    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;
        const matchesLocation = locationFilter === 'All Locations' || item.location === locationFilter;
        return matchesSearch && matchesStatus && matchesLocation;
    });

    // Stats Calculation
    const statsLocationFiltered = items.filter(item =>
        locationFilter === 'All Locations' || item.location === locationFilter
    );

    const stats = {
        totalItems: statsLocationFiltered.length,
        inStock: statsLocationFiltered.filter(i => i.status === 'In Stock').length,
        lowStock: statsLocationFiltered.filter(i => i.status === 'Low Stock').length,
        outOfStock: statsLocationFiltered.filter(i => i.status === 'Out of Stock').length,
    };

    // Pagination
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const currentItems = filteredItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Handlers
    const handleAddItem = (formData) => {
        router.post('/admin/inventory', formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddModalOpen(false);
            },
        });
    };

    const handleDeleteItem = (id) => {
        if (window.confirm('Are you sure you want to archive this item?')) {
            router.delete(`/admin/inventory/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const handleEditItem = (item) => {
        setSelectedItem(item);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = (updatedItem) => {
        router.put(`/admin/inventory/${updatedItem.id}`, {
            name: updatedItem.name,
            locationId: updatedItem.locationId,
            minStock: updatedItem.minStock,
            unit: updatedItem.unit,
            costPerUnit: updatedItem.costPerUnit,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
            },
        });
    };

    const handleViewItem = (item) => {
        setSelectedItem(item);
        setIsViewModalOpen(true);
    };

    const handleOpenAdjustStock = (item) => {
        setSelectedItem(item);
        setIsAdjustStockModalOpen(true);
    };

    const handleAdjustStock = (itemId, type, quantity, notes) => {
        router.post(`/admin/inventory/${itemId}/adjust`, {
            type: type,
            quantity: quantity,
            notes: notes,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAdjustStockModalOpen(false);
            },
        });
    };

    useEffect(() => {
        setCurrentPage(1); // Reset page when filters change
    }, [searchQuery, statusFilter, locationFilter]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-5 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">Inventory Management</h1>
                </div>
                <div className="flex gap-3">
                    <Button
                        className="cursor-pointer"
                        variant="outline"
                        icon={History}
                        onClick={() => setIsLogsModalOpen(true)}
                    >
                        Stock Logs
                    </Button>
                    <Button
                        className="cursor-pointer"
                        variant="primary"
                        icon={Plus}
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        Add Item
                    </Button>
                </div>
            </div>

            <InventoryStats stats={stats} />

            <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-[hsl(var(--border))]/50 p-6 shadow-sm">
                <InventoryFilters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    locationFilter={locationFilter}
                    setLocationFilter={setLocationFilter}
                    locations={locationNames}
                />

                <InventoryTable
                    items={currentItems}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    onDelete={handleDeleteItem}
                    onEdit={handleEditItem}
                    onView={handleViewItem}
                    onAdjustStock={handleOpenAdjustStock}
                />
            </div>

            <AddItem
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddItem}
                locations={locations}
            />

            <StockLogs
                isOpen={isLogsModalOpen}
                onClose={() => setIsLogsModalOpen(false)}
                logs={logs}
            />

            <ViewItemModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                item={selectedItem}
                onEdit={handleEditItem}
                onAdjustStock={handleOpenAdjustStock}
            />

            <AdjustStockModal
                isOpen={isAdjustStockModalOpen}
                onClose={() => setIsAdjustStockModalOpen(false)}
                item={selectedItem}
                onAdjust={handleAdjustStock}
            />

            <EditItemModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                item={selectedItem}
                onSave={handleSaveEdit}
                locations={locations}
            />
        </div>
    );
};

AdminInventory.layout = page => <AdminLayout>{page}</AdminLayout>;

export default AdminInventory;
