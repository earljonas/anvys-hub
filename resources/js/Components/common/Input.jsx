import React from 'react';

const Input = ({
    icon: Icon,
    className = '',
    wrapperClassName = '',
    ...props
}) => {
    return (
        <div className={`relative ${wrapperClassName}`}>
            {Icon && (
                <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--muted-foreground))] h-4 w-4" />
            )}
            <input
                className={`w-full py-2 bg-white border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] transition-all ${Icon ? 'pl-10 pr-4' : 'px-4'} ${className}`}
                {...props}
            />
        </div>
    );
};

export default Input;
