import React from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import Input from '../common/Input';

const StaffInventoryFilters = ({
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter
}) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-100%">
                <Input
                    icon={Search}
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex gap-4">
                <div className="relative min-w-[200px]">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--muted-foreground))] h-4 w-4 pointer-events-none" />
                    <select
                        className="w-full pl-10 pr-10 py-2 bg-white border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm text-[hsl(var(--foreground))] appearance-none cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All Status">All Status</option>
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--muted-foreground))] h-4 w-4 pointer-events-none" />
                </div>
            </div>
        </div>
    );
};

export default StaffInventoryFilters;
