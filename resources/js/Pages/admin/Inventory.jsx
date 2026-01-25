import React, { useState, useEffect } from 'react';
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

// Dummy Data
const INITIAL_ITEMS = [
    { id: 1, name: 'Fresh Milk', category: 'Dairy', location: 'Main Branch', stock: 50, minStock: 20, unit: 'liters', costPerUnit: 45, status: 'In Stock' },
    { id: 2, name: 'Ice Cubes', category: 'Other', location: 'Main Branch', stock: 100, minStock: 50, unit: 'kg', costPerUnit: 15, status: 'In Stock' },
    { id: 3, name: 'Strawberry Syrup', category: 'Syrups', location: 'Main Branch', stock: 8, minStock: 10, unit: 'bottles', costPerUnit: 120, status: 'Low Stock' },
    { id: 4, name: 'Chocolate Syrup', category: 'Syrups', location: 'Main Branch', stock: 15, minStock: 10, unit: 'bottles', costPerUnit: 110, status: 'In Stock' },
    { id: 5, name: 'Plastic Cups (S)', category: 'Cups', location: 'Main Branch', stock: 200, minStock: 100, unit: 'pcs', costPerUnit: 3, status: 'In Stock' },
    { id: 6, name: 'Plastic Cups (L)', category: 'Cups', location: 'Main Branch', stock: 50, minStock: 100, unit: 'pcs', costPerUnit: 5, status: 'Low Stock' },
    { id: 7, name: 'Marshmallows', category: 'Toppings', location: 'Main Branch', stock: 0, minStock: 20, unit: 'packs', costPerUnit: 35, status: 'Out of Stock' },
    { id: 8, name: 'Sprinkles', category: 'Toppings', location: 'Main Branch', stock: 25, minStock: 15, unit: 'packs', costPerUnit: 25, status: 'In Stock' },
    { id: 9, name: 'Graham Crackers', category: 'Toppings', location: 'Main Branch', stock: 12, minStock: 10, unit: 'packs', costPerUnit: 40, status: 'In Stock' },
    { id: 10, name: 'Oreo Cookies', category: 'Toppings', location: 'Main Branch', stock: 5, minStock: 15, unit: 'packs', costPerUnit: 65, status: 'Low Stock' },
    { id: 11, name: 'Vanilla Extract', category: 'Syrups', location: 'Downtown Kiosk', stock: 2, minStock: 5, unit: 'bottles', costPerUnit: 150, status: 'Low Stock' },
    { id: 12, name: 'Napkins', category: 'Other', location: 'Downtown Kiosk', stock: 500, minStock: 200, unit: 'pcs', costPerUnit: 1, status: 'In Stock' },
    { id: 13, name: 'Coffee Beans', category: 'Coffee', location: 'Main Branch', stock: 40, minStock: 20, unit: 'kg', costPerUnit: 350, status: 'In Stock' },
    { id: 14, name: 'Sugar', category: 'Other', location: 'Main Branch', stock: 10, minStock: 15, unit: 'kg', costPerUnit: 55, status: 'Low Stock' },
    { id: 15, name: 'Paper Straws', category: 'Other', location: 'Downtown Kiosk', stock: 0, minStock: 100, unit: 'pcs', costPerUnit: 2, status: 'Out of Stock' },
];

const INITIAL_LOGS = [
    { id: 1, date: '2023-10-26', time: '10:30 AM', item: 'Fresh Milk', location: 'Main Branch', type: 'IN', quantity: 20 },
    { id: 2, date: '2023-10-26', time: '11:15 AM', item: 'Ice Cubes', location: 'Main Branch', type: 'OUT', quantity: 50 },
    { id: 3, date: '2023-10-25', time: '09:00 AM', item: 'Strawberry Syrup', location: 'Main Branch', type: 'IN', quantity: 10 },
    { id: 4, date: '2023-10-25', time: '02:45 PM', item: 'Plastic Cups (S)', location: 'Main Branch', type: 'OUT', quantity: 100 },
    { id: 5, date: '2023-10-24', time: '08:20 AM', item: 'Marshmallows', location: 'Main Branch', type: 'OUT', quantity: 5 },
];

const LOCATIONS = ['Main Branch', 'Downtown Kiosk', 'Mall Pop-up'];

const AdminInventory = () => {
    const [items, setItems] = useState(INITIAL_ITEMS);
    const [logs, setLogs] = useState(INITIAL_LOGS);

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

    // Derived State
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

    // Helper to calculate status
    const calculateStatus = (stock, minStock) => {
        if (stock === 0) return 'Out of Stock';
        if (stock <= minStock) return 'Low Stock';
        return 'In Stock';
    };

    // Handlers
    const handleAddItem = (newItem) => {
        setItems([newItem, ...items]);
        // Also add a log
        const newLog = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            item: newItem.name,
            location: newItem.location,
            type: 'IN',
            quantity: newItem.stock
        };
        setLogs([newLog, ...logs]);
    };

    const handleDeleteItem = (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const handleEditItem = (item) => {
        setSelectedItem(item);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = (updatedItem) => {
        setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
    };

    const handleViewItem = (item) => {
        setSelectedItem(item);
        setIsViewModalOpen(true);
    };

    const handleOpenAdjustStock = (item) => {
        setSelectedItem(item);
        setIsAdjustStockModalOpen(true);
    };

    const handleAdjustStock = (itemId, type, quantity) => {
        setItems(items.map(item => {
            if (item.id === itemId) {
                const newStock = type === 'in'
                    ? item.stock + quantity
                    : Math.max(0, item.stock - quantity);
                return {
                    ...item,
                    stock: newStock,
                    status: calculateStatus(newStock, item.minStock)
                };
            }
            return item;
        }));

        // Add log
        const item = items.find(i => i.id === itemId);
        if (item) {
            const newLog = {
                id: Date.now(),
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                item: item.name,
                location: item.location,
                type: type === 'in' ? 'IN' : 'OUT',
                quantity: quantity
            };
            setLogs([newLog, ...logs]);
        }
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
                    locations={LOCATIONS}
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
                locations={LOCATIONS}
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
                locations={LOCATIONS}
            />
        </div>
    );
};

AdminInventory.layout = page => <AdminLayout>{page}</AdminLayout>;

export default AdminInventory;

