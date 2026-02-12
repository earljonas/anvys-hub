import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
                className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors cursor-pointer"
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
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAdjustStock(item);
                            setIsOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] flex items-center gap-2 cursor-pointer"
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
                        className="w-full text-left px-3 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] flex items-center gap-2 cursor-pointer"
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
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                    >
                        <Archive size={14} />
                        Archive
                    </button>
                </div>,
                document.body
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
