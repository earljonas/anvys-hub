import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, variant = 'primary' }) => {
    const variants = {
        primary: {
            iconBg: 'bg-[hsl(var(--primary)/0.1)]',
            iconColor: 'text-[hsl(var(--primary))]'
        },
        success: {
            iconBg: 'bg-[hsl(var(--success)/0.1)]',
            iconColor: 'text-[hsl(var(--success))]'
        },
        warning: {
            iconBg: 'bg-[hsl(var(--warning)/0.1)]',
            iconColor: 'text-[hsl(var(--warning))]'
        },
        destructive: {
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600'
        },
        muted: {
            iconBg: 'bg-[hsl(var(--muted))]',
            iconColor: 'text-[hsl(var(--muted-foreground))]'
        }
    };

    const { iconBg, iconColor } = variants[variant] || variants.primary;

    return (
        <div className="bg-[hsl(var(--card))] p-6 rounded-xl border border-[hsl(var(--border))] shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{title}</p>
                    <h3 className="text-3xl font-bold mt-2 text-[hsl(var(--foreground))]">{value}</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{subtitle}</p>
                </div>
                <div className={`p-3 rounded-lg ${iconBg}`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
            </div>
        </div>
    );
};

export default StatCard;
