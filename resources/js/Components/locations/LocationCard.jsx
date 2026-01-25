import React from 'react';
import { MapPin, Store, Edit2, Trash2 } from 'lucide-react';

const LocationCard = ({ location, onView, onEdit, onDelete }) => {
    return (
        <div
            onClick={() => onView(location)}
            className="group relative bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[var(--radius)] p-5 transition-all duration-200 hover:shadow-md hover:border-[hsl(var(--primary))/50] cursor-pointer"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-1">
                <div className="h-12 w-12 rounded-xl bg-[hsl(var(--primary))/10] flex items-center justify-left text-[hsl(var(--primary))]">
                    <Store size={24} />
                </div>
                <span className={`px-2.5 py-2 rounded-full text-xs font-medium ${location.status === 'Active'
                    ? 'bg-[hsl(var(--success))/10] text-[hsl(var(--success))]'
                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                    }`}>
                    {location.status}
                </span>
            </div>

            {/* Content */}
            <div className="space-y-2 mb-6">
                <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">{location.name}</h3>
                <div className="flex items-start gap-1 text-[hsl(var(--muted-foreground))] text-xs">
                    <MapPin size={16} className="mt-0.5 shrink-0" />
                    <span className="line-clamp-2 mt-1">{location.address}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))]">
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                    {location.staffCount || 0} staff members
                </span>

                <div className="flex">

                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(location); }}
                        className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors cursor-pointer"
                        title="Edit"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(location); }}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                        title="Archive"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

        </div>
    );
};

export default LocationCard;