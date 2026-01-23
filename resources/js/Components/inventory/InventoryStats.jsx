import React from 'react';
import { Package, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, bgClass }) => (
    <div className={`p-6 rounded-xl border border-[hsl(var(--border))] ${bgClass} transition-all duration-300 hover:shadow-md`}>
        <div className="flex items-start justify-between">
            <div className="flex gap-4">
                <div className={`p-3 rounded-lg ${colorClass} bg-white/50 backdrop-blur-sm`}>
                    <Icon size={24} />
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-[hsl(var(--foreground))]">{value}</h3>
                    <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] mt-1">{title}</p>
                </div>
            </div>
            {subtext && (
                <span className={`text-xs px-2 py-1 rounded-full ${colorClass} bg-white/50 font-medium`}>
                    {subtext}
                </span>
            )}
        </div>
    </div>
);

const InventoryStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
                title="Total Items"
                value={stats.totalItems}
                icon={Package}
                colorClass="text-pink-500"
                bgClass="bg-white"
            />
            <StatCard
                title="In Stock"
                value={stats.inStock}
                icon={CheckCircle2}
                colorClass="text-emerald-500"
                bgClass="bg-white"
            />
            <StatCard
                title="Low Stock"
                value={stats.lowStock}
                icon={AlertTriangle}
                colorClass="text-amber-500"
                bgClass="bg-white"
            />
            <StatCard
                title="Out of Stock"
                value={stats.outOfStock}
                icon={XCircle}
                colorClass="text-red-500"
                bgClass="bg-white"
            />
        </div>
    );
};

export default InventoryStats;
