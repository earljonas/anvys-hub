import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-4xl' }) => {
    if (!isOpen) return null;

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`bg-[hsl(var(--card))] rounded-xl shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto border border-[hsl(var(--border))]`}>
                <div className="p-6 border-b border-[hsl(var(--border))] sticky top-0 bg-[hsl(var(--card))] z-10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                        type="button"
                    >
                        ✖
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
