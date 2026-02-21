import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import StaffLayout from '../../Layouts/StaffLayout';
import StaffInventoryTable from '../../Components/inventory/StaffInventoryTable';
import AdjustStockModal from '../../Components/inventory/AdjustStockModal';
import InventoryStats from '../../Components/inventory/InventoryStats';
import StaffInventoryFilters from '../../Components/inventory/StaffInventoryFilters';

const StaffInventory = ({ items: initialItems = [], staffLocationId }) => {
    const { employee } = usePage().props;
    const [items, setItems] = useState(initialItems);

    // Update local state when props change
    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal state
    const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Filtered items based on search and status
    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Stats calculation
    const stats = {
        totalItems: items.length,
        inStock: items.filter(i => i.status === 'In Stock').length,
        lowStock: items.filter(i => i.status === 'Low Stock').length,
        outOfStock: items.filter(i => i.status === 'Out of Stock').length,
    };

    // Pagination
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
    const currentItems = filteredItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Handlers
    const handleOpenAdjustStock = (item) => {
        setSelectedItem(item);
        setIsAdjustStockModalOpen(true);
    };

    const handleAdjustStock = (itemId, type, quantity, notes) => {
        router.post(`/staff/inventory/${itemId}/adjust`, {
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

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <Head title="Inventory" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                        Inventory
                    </h1>
                </div>
            </div>

            {/* Stats Cards */}
            <InventoryStats stats={stats} />

            {/* Search and Table Container */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-[hsl(var(--border))]/50 p-6 shadow-sm">

                <StaffInventoryFilters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />

                {/* Inventory Table */}
                <StaffInventoryTable
                    items={currentItems}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    onAdjustStock={handleOpenAdjustStock}
                />
            </div>

            {/* Adjust Stock Modal */}
            <AdjustStockModal
                isOpen={isAdjustStockModalOpen}
                onClose={() => setIsAdjustStockModalOpen(false)}
                item={selectedItem}
                onAdjust={handleAdjustStock}
            />
        </div>
    );
};


StaffInventory.layout = (page) => <StaffLayout>{page}</StaffLayout>;

export default StaffInventory;
