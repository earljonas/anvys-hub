import React from 'react';
import { X, Package, MapPin, ArrowUpDown, Edit2 } from 'lucide-react';
import Button from '../common/Button';

const StatusBadge = ({ status }) => {
    let colorClass = "";

    switch (status?.toLowerCase()) {
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

const ViewItemModal = ({ isOpen, onClose, item, onEdit, onAdjustStock }) => {
    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden border border-[hsl(var(--border))]">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-[hsl(var(--border))]">
                    <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Item Details</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-[hsl(var(--muted))] rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {/* Item Header Card */}
                    <div className="p-4 bg-[hsl(var(--muted))] rounded-xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-[hsl(var(--primary))]/20 rounded-xl flex items-center justify-center">
                            <Package size={24} className="text-[hsl(var(--primary))]" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-[hsl(var(--foreground))]">{item.name}</h4>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.category}</p>
                        </div>
                        <StatusBadge status={item.status} />
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Current Stock */}
                        <div className="p-4 bg-[hsl(var(--muted))] rounded-xl">
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Current Stock</p>
                            <p className="text-lg font-bold text-[hsl(var(--foreground))]">
                                {item.stock} {item.unit}
                            </p>
                        </div>

                        {/* Minimum Stock */}
                        <div className="p-4 bg-[hsl(var(--muted))] rounded-xl">
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Minimum Stock</p>
                            <p className="text-lg font-bold text-[hsl(var(--foreground))]">
                                {item.minStock || 0} {item.unit}
                            </p>
                        </div>

                        {/* Unit */}
                        <div className="p-4 bg-[hsl(var(--muted))] rounded-xl">
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Unit</p>
                            <p className="text-lg font-bold text-[hsl(var(--foreground))]">{item.unit}</p>
                        </div>

                        {/* Cost per Unit */}
                        <div className="p-4 bg-[hsl(var(--muted))] rounded-xl">
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Cost per Unit</p>
                            <p className="text-lg font-bold text-[hsl(var(--foreground))]">₱{item.costPerUnit || 0}</p>
                        </div>

                        {/* Location (full width) */}
                        <div className="col-span-2 p-4 bg-[hsl(var(--muted))] rounded-xl">
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Location</p>
                            <div className="flex items-center gap-2 mt-1">
                                <MapPin size={16} className="text-[hsl(var(--muted-foreground))]" />
                                <p className="font-bold text-[hsl(var(--foreground))]">{item.location}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 flex gap-3 border-t border-[hsl(var(--border))]">
                    <Button
                        variant="primary"
                        className="flex-1 cursor-pointer"
                        icon={Edit2}
                        onClick={() => {
                            onClose();
                            onEdit(item);
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 cursor-pointer"
                        icon={ArrowUpDown}
                        onClick={() => {
                            onClose();
                            onAdjustStock(item);
                        }}
                    >
                        Adjust Stock
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ViewItemModal;
