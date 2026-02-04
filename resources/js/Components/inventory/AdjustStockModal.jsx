import React, { useState } from 'react';
import { X, Plus, Minus, FileText, AlertCircle } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

const AdjustStockModal = ({ isOpen, onClose, item, onAdjust }) => {
    const [adjustType, setAdjustType] = useState('in'); // 'in' or 'out'
    const [quantity, setQuantity] = useState('');
    const [notes, setNotes] = useState('');

    if (!isOpen || !item) return null;

    const qty = parseInt(quantity) || 0;
    const newStock = adjustType === 'in'
        ? item.stock + qty
        : Math.max(0, item.stock - qty);
    const wouldGoNegative = adjustType === 'out' && qty > item.stock;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (qty > 0) {
            onAdjust(item.id, adjustType, qty, notes);
            handleClose();
        }
    };

    const handleClose = () => {
        onClose();
        setQuantity('');
        setNotes('');
        setAdjustType('in');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden border border-[hsl(var(--border))]">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-[hsl(var(--border))]">
                    <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Adjust Stock Quantity</h3>
                    <button
                        onClick={handleClose}
                        className="p-1 hover:bg-[hsl(var(--muted))] rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Item Info */}
                    <div className="p-4 bg-[hsl(var(--muted))] rounded-xl">
                        <p className="font-bold text-[hsl(var(--foreground))]">{item.name}</p>
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Current Stock</p>
                            <p className="text-lg font-bold text-[hsl(var(--foreground))]">{item.stock} {item.unit}</p>
                        </div>
                    </div>

                    {/* Stock In/Out Toggle */}
                    <div className="flex rounded-xl border border-[hsl(var(--border))] overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setAdjustType('in')}
                            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-medium transition-all ${adjustType === 'in'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white text-[hsl(var(--muted-foreground))] hover:bg-emerald-50'
                                }`}
                        >
                            <Plus size={16} />
                            Stock In
                        </button>
                        <button
                            type="button"
                            onClick={() => setAdjustType('out')}
                            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-medium transition-all ${adjustType === 'out'
                                ? 'bg-red-500 text-white'
                                : 'bg-white text-[hsl(var(--muted-foreground))] hover:bg-red-50'
                                }`}
                        >
                            <Minus size={16} />
                            Stock Out
                        </button>
                    </div>

                    {/* Quantity Input */}
                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                            Quantity
                        </label>
                        <Input
                            type="number"
                            required
                            min="1"
                            placeholder={adjustType === 'in' ? 'Enter quantity to add' : 'Enter quantity to remove'}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                        />
                    </div>

                    {/* Notes Input */}
                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                            <div className="flex items-center gap-2">
                                <FileText size={14} />
                                Notes <span className="text-[hsl(var(--muted-foreground))] font-normal">(optional)</span>
                            </div>
                        </label>
                        <textarea
                            placeholder={adjustType === 'in'
                                ? 'e.g., Received from supplier, Restocking...'
                                : 'e.g., End of sale, Damaged items, Expired...'}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            maxLength={500}
                            className="w-full px-4 py-2.5 border border-[hsl(var(--border))] rounded-xl bg-white focus:ring-2 focus:ring-[hsl(var(--primary))]/20 focus:border-[hsl(var(--primary))] outline-none transition-all resize-none"
                        />
                        <p className="text-xs text-[hsl(var(--muted-foreground))] text-right mt-1">
                            {notes.length}/500
                        </p>
                    </div>

                    {/* Stock Preview */}
                    {qty > 0 && (
                        <div className={`p-3 rounded-xl border ${wouldGoNegative ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[hsl(var(--muted-foreground))]">New Stock Level:</span>
                                <span className={`font-bold ${wouldGoNegative ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {newStock} {item.unit}
                                </span>
                            </div>
                            {wouldGoNegative && (
                                <div className="flex items-center gap-2 mt-2 text-red-600 text-xs">
                                    <AlertCircle size={14} />
                                    Quantity exceeds current stock (will be set to 0)
                                </div>
                            )}
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="primary"
                        className={`w-full cursor-pointer ${adjustType === 'in'
                            ? 'bg-emerald-500 hover:bg-emerald-600'
                            : 'bg-red-500 hover:bg-red-600'}`}
                    >
                        {adjustType === 'in' ? 'Add Stock' : 'Remove Stock'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AdjustStockModal;

