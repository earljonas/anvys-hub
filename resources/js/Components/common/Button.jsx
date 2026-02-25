import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    className = '',
    ...props
}) => {
    const baseStyles = "flex items-center justify-center gap-2 transition-all rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-[hsl(var(--primary))] text-white hover:brightness-110 font-bold shadow-md hover:shadow-lg",
        outline: "bg-white border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] font-medium shadow-sm hover:shadow",
        ghost: "hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
        danger: "bg-red-500 text-white hover:bg-red-600 font-bold shadow-md hover:shadow-lg",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
        icon: "p-2",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} />}
            {children}
        </button>
    );
};

export default Button;
