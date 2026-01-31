import React from 'react';
import { IceCream } from 'lucide-react';

export default function ProductCard({ product, onSelect }) {
    return (
        <div
            onClick={() => onSelect(product)}
            className="group cursor-pointer flex flex-col gap-3 p-3 rounded-[2rem] bg-white border border-gray-200 hover:border-[hsl(var(--primary))] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-in fade-in zoom-in-95"
        >
            <div className="relative aspect-square w-full rounded-[1.5rem] bg-[hsl(var(--primary))]/10 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">
                {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                    <IceCream size={48} className="text-[hsl(var(--primary))] opacity-60" strokeWidth={1.5} />
                )}
            </div>

            <div className="px-1 pb-1">
                <h3 className="font-bold text-[hsl(var(--foreground))] text-sm leading-tight line-clamp-2 mb-1 group-hover:text-[hsl(var(--primary))]">
                    {product.name}
                </h3>
                <div className="flex flex-col">
                    <span className="font-black text-lg text-[hsl(var(--primary))]">₱{product.basePrice}</span>
                </div>
            </div>
        </div>
    );
}