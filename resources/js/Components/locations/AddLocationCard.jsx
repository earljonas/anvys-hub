import React from 'react';
import { Plus } from 'lucide-react';

const AddLocationCard = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center h-full min-h-[240px] w-full rounded-[var(--radius)] border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))/30] hover:bg-[hsl(var(--muted))/50] hover:border-[hsl(var(--primary))/50] transition-all duration-200 group"
        >
            <div className="h-12 w-12 rounded-full bg-[hsl(var(--primary))/10] flex items-center justify-center text-[hsl(var(--primary))] mb-3 group-hover:scale-110 transition-transform">
                <Plus size={24} />
            </div>
            <span className="font-semibold text-[hsl(var(--foreground))]">Add New Location</span>
            <span className="text-sm text-[hsl(var(--muted-foreground))]">Expand your business</span>
        </button>
    );
};

export default AddLocationCard;