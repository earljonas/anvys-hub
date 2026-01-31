import React from 'react';

export default function CategoryTab({ category, active, onClick }) {
    const isActive = active === category.id;

    return (
        <button
            onClick={() => onClick(category.id)}
            className={`
                px-6 py-3 cursor-pointer rounded-xl whitespace-nowrap font-bold text-sm transition-all duration-200
                ${isActive
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md scale-105'
                    : 'bg-white text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]'
                }
            `}
        >
            {category.name}
        </button>
    );
}