import React from 'react';
import { X, Archive, AlertTriangle, Package } from 'lucide-react';

const ArchiveConfirmModal = ({ isOpen, onClose, item, onConfirm }) => {
    const dialogRef = React.useRef(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        if (isOpen) {
            setError('');
            setIsSubmitting(false);

            // Small timeout to ensure DOM is ready before focusing
            setTimeout(() => dialogRef.current?.focus(), 50);

            const handleKeyDown = (e) => {
                if (e.key === 'Escape') onClose();
            };
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onClose]);

    if (!isOpen || !item) return null;

    const hasStock = item.stock > 0;

    const handleConfirm = async () => {
        setIsSubmitting(true);
        setError('');
        try {
            await onConfirm(item.id);
            onClose();
        } catch (err) {
            setError('An error occurred while archiving. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-modal-title"
        >
            <div
                ref={dialogRef}
                tabIndex={-1}
                className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden border border-[hsl(var(--border))] outline-none"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-[hsl(var(--border))]">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${hasStock ? 'bg-amber-100' : 'bg-red-100'}`}>
                            {hasStock
                                ? <AlertTriangle size={20} className="text-amber-600" />
                                : <Archive size={20} className="text-red-600" />
                            }
                        </div>
                        <h3 id="archive-modal-title" className="text-xl font-bold text-[hsl(var(--foreground))]">
                            {hasStock ? 'Warning' : 'Archive Item'}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="p-1 hover:bg-[hsl(var(--muted))] rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* Item Info Card */}
                    <div className="p-4 bg-[hsl(var(--muted))] rounded-xl">
                        <p className="font-bold text-[hsl(var(--foreground))]">{item.name}</p>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-[hsl(var(--muted-foreground))]">{item.location}</span>
                            <div className="flex items-center gap-1.5">
                                <Package size={14} className="text-[hsl(var(--muted-foreground))]" />
                                <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
                                    {item.stock} {item.unit}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Warning Banner (only when stock > 0) */}
                    {hasStock && (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
                            <div className="text-sm text-amber-800">
                                <p className="font-semibold">This item still has stock</p>
                                <p className="mt-1 text-amber-700">
                                    There are <strong>{item.stock} {item.unit}</strong> remaining. Archiving will hide
                                    this item from inventory views but the record will be preserved.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Confirmation Text */}
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {hasStock
                            ? 'Are you sure you want to archive this item? You can restore it anytime from the Archived Items list.'
                            : 'This item will be moved to the archive. You can restore it anytime from the Archived Items list.'
                        }
                    </p>

                    {error && (
                        <div className="p-3 mt-2 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200 flex items-center gap-2">
                            <AlertTriangle size={16} /> {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors border border-[hsl(var(--border))] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className={`px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${hasStock
                            ? 'bg-amber-500 hover:bg-amber-600'
                            : 'bg-red-500 hover:bg-red-600'
                            }`}
                    >
                        <Archive size={14} className={isSubmitting ? 'animate-pulse' : ''} />
                        {isSubmitting ? 'Archiving...' : (hasStock ? 'Archive Anyway' : 'Archive')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArchiveConfirmModal;
