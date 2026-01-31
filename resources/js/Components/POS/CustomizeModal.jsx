import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function CustomizeModal({ product, isOpen, onClose, onAddToCart }) {
    if (!isOpen || !product) return null;

    const [size, setSize] = useState(product.sizes ? product.sizes[0] : null);
    const [addons, setAddons] = useState({});

    useEffect(() => {
        setSize(product.sizes ? product.sizes[0] : null);
        setAddons({});
    }, [product]);

    const addonTotal = Object.entries(addons).reduce((sum, [name, qty]) => {
        const info = product.addons?.find(a => a.name === name);
        return sum + ((info?.price || 0) * qty);
    }, 0);

    const finalPrice = (size ? size.price : product.basePrice) + addonTotal;

    const updateAddon = (name, delta) => {
        setAddons(prev => ({ ...prev, [name]: Math.max(0, (prev[name] || 0) + delta) }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center bg-[hsl(var(--muted))]">
                    <div>
                        <h2 className="text-xl font-black text-[hsl(var(--foreground))]">{product.name}</h2>
                        <span className="text-xs font-bold text-[hsl(var(--primary))] uppercase tracking-widest">Options & Toppings</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors"><X size={24} /></button>
                </div>

                <div className="overflow-y-auto p-6 space-y-8 flex-1">
                    {product.sizes && (
                        <div>
                            <h3 className="text-xs font-black text-[hsl(var(--muted-foreground))] uppercase mb-4">Select Size</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {product.sizes.map(s => (
                                    <button key={s.name} onClick={() => setSize(s)} className={`p-4 rounded-2xl border-2 font-black transition-all ${size?.name === s.name ? 'border-[hsl(var(--primary))] bg-pink-50 text-[hsl(var(--primary))]' : 'border-border'}`}>
                                        {s.name} • ₱{s.price}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {product.addons && (
                        <div>
                            <h3 className="text-xs font-black text-[hsl(var(--muted-foreground))] uppercase mb-4">Add-ons (+₱10-15)</h3>
                            <div className="space-y-3">
                                {product.addons.map(addon => (
                                    <div key={addon.name} className="flex justify-between items-center p-4 rounded-2xl border border-border bg-white shadow-sm">
                                        <span className="font-bold text-sm">{addon.name} (+₱{addon.price})</span>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => updateAddon(addon.name, -1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-gray-200"><Minus size={18} /></button>
                                            <span className="font-black text-lg w-4 text-center">{addons[addon.name] || 0}</span>
                                            <button onClick={() => updateAddon(addon.name, 1)} className="w-9 h-9 rounded-full bg-[hsl(var(--primary))] text-white flex items-center justify-center hover:brightness-110 shadow-lg shadow-pink-100"><Plus size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t bg-[hsl(var(--muted))] flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-black text-[hsl(var(--muted-foreground))] uppercase">Total</p>
                        <p className="text-3xl font-black text-[hsl(var(--primary))]">₱{finalPrice}</p>
                    </div>
                    <button onClick={() => { onAddToCart({ ...product, uniqueId: Date.now(), size, addons, finalPrice }); onClose(); }} className="bg-[hsl(var(--primary))] text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-pink-200">
                        <ShoppingBag size={20} /> ADD TO CART
                    </button>
                </div>
            </div>
        </div>
    );
}