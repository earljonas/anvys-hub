import React, { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import Button from '../common/Button'; // Assuming this exists based on your reference

export default function CustomizeModal({ product, isOpen, onClose, onAddToCart, initialData }) {
    if (!isOpen || !product) return null;

    const [size, setSize] = useState(product.sizes ? product.sizes[0] : null);
    const [addons, setAddons] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // EDIT MODE: Find matching size object and load addons
                const savedSize = product.sizes
                    ? product.sizes.find(s => s.name === initialData.size?.name)
                    : null;

                setSize(savedSize || (product.sizes ? product.sizes[0] : null));
                setAddons(initialData.addons || {});
            } else {
                // ADD MODE: Reset
                setSize(product.sizes ? product.sizes[0] : null);
                setAddons({});
            }
        }
    }, [isOpen, product, initialData]);

    const addonTotal = Object.entries(addons).reduce((sum, [name, qty]) => {
        const info = product.addons?.find(a => a.name === name);
        return sum + ((info?.price || 0) * qty);
    }, 0);

    const finalPrice = (size ? size.price : product.basePrice) + addonTotal;

    const updateAddon = (name, delta) => {
        setAddons(prev => ({ ...prev, [name]: Math.max(0, (prev[name] || 0) + delta) }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        const itemData = {
            ...product,
            uniqueId: initialData ? initialData.uniqueId : Date.now().toString(),
            size,
            addons,
            finalPrice
        };
        onAddToCart(itemData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 overflow-hidden border border-[hsl(var(--border))] flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-[hsl(var(--border))]">
                    <div>
                        <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">{product.name}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-[hsl(var(--muted))] rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">

                    {/* Size Selector */}
                    {product.sizes && (
                        <div>
                            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">Size</label>
                            <div className="grid grid-cols-2 gap-3">
                                {product.sizes.map(s => (
                                    <button
                                        key={s.name}
                                        onClick={() => setSize(s)}
                                        className={`
                                            px-4 py-3 rounded-lg border text-left transition-all
                                            ${size?.name === s.name
                                                ? 'border-[hsl(var(--primary))] bg-pink-50 ring-1 ring-[hsl(var(--primary))]'
                                                : 'border-[hsl(var(--border))] hover:bg-slate-50'}
                                        `}
                                    >
                                        <div className="font-semibold text-sm">{s.name}</div>
                                        <div className="text-xs text-[hsl(var(--muted-foreground))]">₱{s.price}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add-ons Selector */}
                    {product.addons && (
                        <div>
                            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">Add-ons</label>
                            <div className="space-y-2">
                                {product.addons.map(addon => (
                                    <div
                                        key={addon.name}
                                        className="flex items-center justify-between p-3 border border-[hsl(var(--border))] rounded-lg bg-white"
                                    >
                                        <div>
                                            <div className="font-medium text-sm">{addon.name}</div>
                                            <div className="text-xs text-[hsl(var(--muted-foreground))]">+₱{addon.price}</div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => updateAddon(addon.name, -1)}
                                                disabled={!addons[addon.name]}
                                                className="w-8 h-8 rounded flex items-center justify-center border hover:bg-slate-100 disabled:opacity-50"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-6 text-center font-bold text-sm">
                                                {addons[addon.name] || 0}
                                            </span>
                                            <button
                                                onClick={() => updateAddon(addon.name, 1)}
                                                className="w-8 h-8 rounded flex items-center justify-center border bg-slate-50 hover:bg-slate-100"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[hsl(var(--border))] bg-slate-50 flex items-center justify-between">
                    <div>
                        <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase block">Total Price</span>
                        <span className="text-2xl font-black text-[hsl(var(--primary))]">₱{finalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSave}>
                            {initialData ? 'Update Order' : 'Add to Cart'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}