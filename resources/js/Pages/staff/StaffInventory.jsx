import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { Search, Package, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import StaffLayout from '../../Layouts/StaffLayout';
import StaffInventoryTable from '../../Components/inventory/StaffInventoryTable';
import AdjustStockModal from '../../Components/inventory/AdjustStockModal';

const StaffInventory = ({ items: initialItems = [], staffLocationId }) => {
    const { employee } = usePage().props;
    const [items, setItems] = useState(initialItems);

    // Update local state when props change
    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    // Search
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal state
    const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Filtered items based on search
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    return (
        <div className='space-y-6'>
            <Head title="Inventory" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className='text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]'>
                        Inventory
                    </h1>
                    <p className="text-[hsl(var(--muted-foreground))] mt-1">
                        {employee?.locationName || 'Your Location'}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-[hsl(var(--border))] p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Total Items</p>
                            <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{stats.totalItems}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-[hsl(var(--border))] p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">In Stock</p>
                            <p className="text-2xl font-bold text-emerald-600">{stats.inStock}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-[hsl(var(--border))] p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Low Stock</p>
                            <p className="text-2xl font-bold text-amber-600">{stats.lowStock}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-[hsl(var(--border))] p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <XCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Out of Stock</p>
                            <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Table Container */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-[hsl(var(--border))]/50 p-6 shadow-sm space-y-4">
                {/* Search Bar */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-[hsl(var(--border))] rounded-xl bg-white focus:ring-2 focus:ring-[hsl(var(--primary))]/20 focus:border-[hsl(var(--primary))] outline-none transition-all"
                    />
                </div>

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
