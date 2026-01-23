import React from 'react';
import { X, History } from 'lucide-react';

const StockLogsModal = ({ isOpen, onClose, logs = [] }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-4 overflow-hidden border border-[hsl(var(--border))] flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center p-6 border-b border-[hsl(var(--border))]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[hsl(var(--primary))/10] rounded-lg">
                            <History size={20} className="text-[hsl(var(--primary))]" />
                        </div>
                        <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Stock Movement Logs</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors">
                        <X size={20} className="text-[hsl(var(--muted-foreground))]" />
                    </button>
                </div>

                <div className="overflow-y-auto p-0">
                    <table className="w-full text-left">
                        <thead className="bg-[hsl(var(--muted))] sticky top-0">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Time</th>
                                <th className="p-4 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Item</th>
                                <th className="p-4 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Location</th>
                                <th className="p-4 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Action</th>
                                <th className="p-4 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Quantity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[hsl(var(--border))]">
                            {logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-[hsl(var(--muted))/30] transition-colors">
                                        <td className="p-4 text-sm text-[hsl(var(--muted-foreground))]">
                                            <div className="font-medium text-[hsl(var(--foreground))]">{log.date}</div>
                                            <div className="text-xs">{log.time}</div>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-[hsl(var(--foreground))]">{log.item}</td>
                                        <td className="p-4 text-sm text-[hsl(var(--muted-foreground))]">{log.location}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.type === 'IN'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                Stock {log.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-bold text-[hsl(var(--foreground))]">
                                            {log.type === 'IN' ? '+' : '-'}{log.quantity}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-[hsl(var(--muted-foreground))]">
                                        No logs available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))/20] text-right">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/10] rounded-lg transition-colors"
                    >
                        Close Logs
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StockLogsModal;
