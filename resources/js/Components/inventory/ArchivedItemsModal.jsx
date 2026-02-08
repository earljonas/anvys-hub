import React from 'react';
import { X, Archive, RotateCcw } from 'lucide-react';

const ArchivedItemsModal = ({ isOpen, onClose, items = [], onRestore }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl mx-4 overflow-hidden border border-[hsl(var(--border))] flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center p-6 border-b border-[hsl(var(--border))]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Archive size={20} className="text-amber-700" />
                        </div>
                        <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Archived Items</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors">
                        <X size={20} className="text-[hsl(var(--muted-foreground))]" />
                    </button>
                </div>

                <div className="overflow-y-auto p-0 flex-1">
                    <table className="w-full text-left">
                        <thead className="bg-[hsl(var(--muted))] sticky top-0">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Item Name</th>
                                <th className="p-4 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Location</th>
                                <th className="p-4 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Archived At</th>
                                <th className="p-4 text-right text-sm font-semibold text-[hsl(var(--muted-foreground))]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[hsl(var(--border))]">
                            {items.length > 0 ? (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-[hsl(var(--muted))/30] transition-colors">
                                        <td className="p-4 text-sm font-medium text-[hsl(var(--foreground))]">{item.name}</td>
                                        <td className="p-4 text-sm text-[hsl(var(--muted-foreground))]">{item.location}</td>
                                        <td className="p-4 text-sm text-[hsl(var(--muted-foreground))]">{item.deletedAt}</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => onRestore(item.id)}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-full transition-colors"
                                            >
                                                <RotateCcw size={14} />
                                                Restore
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-[hsl(var(--muted-foreground))]">
                                        No archived items found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))/20] flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors border border-[hsl(var(--border))]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArchivedItemsModal;
