import React from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

const StatusBadge = ({ status }) => {
    let colorClass = "";

    switch (status.toLowerCase()) {
        case 'in stock':
            colorClass = "bg-emerald-100 text-emerald-700";
            break;
        case 'low stock':
            colorClass = "bg-amber-100 text-amber-700";
            break;
        case 'out of stock':
            colorClass = "bg-red-100 text-red-700";
            break;
        default:
            colorClass = "bg-gray-100 text-gray-700";
    }

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {status}
        </span>
    );
};

const StaffInventoryTable = ({ items, currentPage, totalPages, onPageChange, onAdjustStock }) => {
    return (
        <div className="bg-white rounded-xl border border-[hsl(var(--border))] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
                            <th className="text-left py-4 px-6 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Item Name</th>
                            <th className="text-left py-4 px-10 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Current Stock</th>
                            <th className="text-left py-4 px-10 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Min Stock</th>
                            <th className="text-left py-4 px-10 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Status</th>
                            <th className="text-right py-4 px-8 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[hsl(var(--border))]">
                        {items.length > 0 ? (
                            items.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-[hsl(var(--sidebar-accent))] transition-colors"
                                >
                                    <td className="py-4 px-6 text-sm font-medium text-[hsl(var(--foreground))]">{item.name}</td>
                                    <td className="py-4 px-10 text-sm font-medium text-[hsl(var(--foreground))]">{item.stock} {item.unit}</td>
                                    <td className="py-4 px-10 text-sm text-[hsl(var(--muted-foreground))]">{item.minStock} {item.unit}</td>
                                    <td className="py-4 px-8">
                                        <StatusBadge status={item.status} />
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => onAdjustStock(item)}
                                                className="flex items-center gap-2 px-3 py-2 bg-[hsl(var(--primary))] text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium"
                                            >
                                                <ArrowUpDown size={16} />
                                                Adjust Stock
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-8 text-center text-[hsl(var(--muted-foreground))]">
                                    No items found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-[hsl(var(--border))]">
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">
                        Showing page <span className="font-medium text-[hsl(var(--foreground))]">{currentPage}</span> of <span className="font-medium text-[hsl(var(--foreground))]">{totalPages}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffInventoryTable;
