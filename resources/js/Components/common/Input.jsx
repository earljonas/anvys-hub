import React from 'react';

const Input = React.forwardRef(({
    icon: Icon,
    label,
    error,
    className = '',
    wrapperClassName = '',
    ...props
}, ref) => {
    return (
        <div className={`w-full ${wrapperClassName}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--muted-foreground))] h-4 w-4" />
                )}
                <input
                    ref={ref}
                    className={`w-full py-2 bg-white border ${error ? 'border-red-500 focus:ring-red-500' : 'border-[hsl(var(--border))] focus:ring-[hsl(var(--primary))]'} rounded-lg focus:outline-none focus:ring-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] transition-all ${Icon ? 'pl-10 pr-4' : 'px-4'} ${className}`}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600 font-medium">{error}</p>
            )}
        </div>
    );
});

export default Input;
