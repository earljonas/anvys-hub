import React from 'react';
import { X, AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';

const variantConfig = {
    confirm: {
        icon: AlertTriangle,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        accentColor: 'from-red-400 via-red-500 to-rose-500',
        confirmBtnClass: 'bg-red-500 hover:bg-red-600 text-white',
        defaultTitle: 'Confirm Action',
        defaultConfirmText: 'Confirm',
    },
    warning: {
        icon: AlertTriangle,
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        accentColor: 'from-amber-400 via-amber-500 to-orange-500',
        confirmBtnClass: 'bg-amber-500 hover:bg-amber-600 text-white',
        defaultTitle: 'Are you sure?',
        defaultConfirmText: 'Confirm',
    },
    error: {
        icon: AlertCircle,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-500',
        accentColor: 'from-red-400 via-red-500 to-rose-500',
        confirmBtnClass: null, // no confirm btn for alerts
        defaultTitle: 'Something went wrong',
        defaultConfirmText: null,
    },
    success: {
        icon: CheckCircle,
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        accentColor: 'from-emerald-400 via-emerald-500 to-teal-500',
        confirmBtnClass: null,
        defaultTitle: 'Success',
        defaultConfirmText: null,
    },
    info: {
        icon: Info,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        accentColor: 'from-blue-400 via-blue-500 to-indigo-500',
        confirmBtnClass: 'bg-blue-500 hover:bg-blue-600 text-white',
        defaultTitle: 'Information',
        defaultConfirmText: 'OK',
    },
};

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm = null,
    title,
    message,
    confirmText,
    cancelText = 'Cancel',
    variant = 'confirm',
}) => {
    if (!isOpen) return null;

    const config = variantConfig[variant] || variantConfig.confirm;
    const IconComponent = config.icon;
    const displayTitle = title || config.defaultTitle;
    const displayConfirmText = confirmText || config.defaultConfirmText;
    const isAlertOnly = !onConfirm;

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Top accent bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${config.accentColor}`} />

                <div className="p-7 flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-full ${config.iconBg} border-4 ${config.iconBg} flex items-center justify-center mb-5 shadow-inner`}>
                        <IconComponent className={config.iconColor} size={32} strokeWidth={2.5} />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2 tracking-tight">
                        {displayTitle}
                    </h3>

                    {/* Message */}
                    {message && (
                        <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-1 whitespace-pre-line">
                            {message}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="px-7 pb-7 flex gap-3">
                    {isAlertOnly ? (
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-sm cursor-pointer"
                        >
                            OK
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-semibold text-sm hover:bg-[hsl(var(--muted))] active:scale-[0.98] transition-all duration-150 cursor-pointer"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm active:scale-[0.98] transition-all duration-150 shadow-sm cursor-pointer ${config.confirmBtnClass}`}
                            >
                                {displayConfirmText}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
