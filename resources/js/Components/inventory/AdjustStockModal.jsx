import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

const AdjustStockModal = ({ isOpen, onClose, item, onAdjust }) => {
    const [adjustType, setAdjustType] = useState('in'); // 'in' or 'out'
    const [quantity, setQuantity] = useState('');

    if (!isOpen || !item) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const qty = parseInt(quantity);
        if (qty > 0) {
            onAdjust(item.id, adjustType, qty);
            onClose();
            setQuantity('');
            setAdjustType('in');
        }
    };

    const handleClose = () => {
        onClose();
        setQuantity('');
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
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Current Stock: {item.stock} {item.unit}</p>
                    </div>

                    {/* Stock In/Out Toggle */}
                    <div className="flex rounded-xl border border-[hsl(var(--border))] overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setAdjustType('in')}
                            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-medium transition-colors ${adjustType === 'in'
                                ? 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]'
                                : 'bg-white text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/50'
                                }`}
                        >
                            <Plus size={16} />
                            Stock In
                        </button>
                        <button
                            type="button"
                            onClick={() => setAdjustType('out')}
                            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-medium transition-colors ${adjustType === 'out'
                                ? 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]'
                                : 'bg-white text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/50'
                                }`}
                        >
                            <Minus size={16} />
                            Stock Out
                        </button>
                    </div>

                    {/* Quantity Input */}
                    <div>
                        <Input
                            type="number"
                            required
                            min="1"
                            placeholder={adjustType === 'in' ? 'Enter quantity to add' : 'Enter quantity to remove'}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                        />
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full cursor-pointer bg-[hsl(var(--success))] hover:brightness-110"
                    >
                        {adjustType === 'in' ? 'Add Stock' : 'Remove Stock'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AdjustStockModal;
