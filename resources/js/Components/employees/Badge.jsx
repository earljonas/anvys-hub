import React from 'react';

const Badge = ({ children, variant = 'default', className = '', ...props }) => {
    const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2";

    const variants = {
        default: "border-transparent bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]",
        secondary: "border-transparent bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]",
        destructive: "border-transparent bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]",
        success: "border-transparent bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]",
        outline: "text-[hsl(var(--foreground))]",
        pink: "border-transparent bg-pink-400 text-white",
        warning: "border-transparent bg-orange-100 text-orange-700",
    };

    return (
        <div className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
            {children}
        </div>
    );
};

export default Badge;
