import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Archive, ChevronLeft, ChevronRight, ArrowUpDown, MoreVertical } from 'lucide-react';

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

const ActionMenu = ({ item, onAdjustStock, onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
                <MoreVertical size={16} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-[hsl(var(--border))] z-50 py-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAdjustStock(item);
                            setIsOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] flex items-center gap-2"
                    >
                        <ArrowUpDown size={14} />
                        Adjust
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(item);
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
                            onDelete(item.id);
                            setIsOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                        <Archive size={14} />
                        Archive
                    </button>
                </div>
            )}
        </div>
    );
};

const InventoryTable = ({ items, currentPage, totalPages, onPageChange, onDelete, onEdit, onView, onAdjustStock }) => {
    return (
        <div className="bg-white rounded-xl border border-[hsl(var(--border))] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
                            <th className="text-left py-4 px-6 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Item Name</th>
                            <th className="text-left py-4 px-10 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Location</th>
                            <th className="text-left py-4 px-10 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Current Stock</th>
                            <th className="text-left py-4 px-10 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Status</th>
                            <th className="text-right py-4 px-8 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[hsl(var(--border))]">
                        {items.length > 0 ? (
                            items.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-[hsl(var(--sidebar-accent))] transition-colors cursor-pointer"
                                    onClick={() => onView(item)}
                                >
                                    <td className="py-4 px-6 text-sm font-medium text-[hsl(var(--foreground))]">{item.name}</td>
                                    <td className="py-4 px-10 text-sm text-[hsl(var(--muted-foreground))]">{item.location}</td>
                                    <td className="py-4 px-10 text-sm font-medium text-[hsl(var(--foreground))]">{item.stock} {item.unit}</td>
                                    <td className="py-4 px-8">
                                        <StatusBadge status={item.status} />
                                    </td>
                                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex justify-end">
                                            <ActionMenu
                                                item={item}
                                                onAdjustStock={onAdjustStock}
                                                onEdit={onEdit}
                                                onDelete={onDelete}
                                            />
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
        </div>
    );
};

export default InventoryTable;
