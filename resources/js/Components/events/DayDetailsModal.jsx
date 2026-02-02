import React from 'react';
import { X, Plus, Calendar as CalendarIcon } from 'lucide-react';
import Button from '../common/Button';

const DayDetailsModal = ({ isOpen, onClose, date, events, onAddEvent, onViewEvent }) => {
    if (!isOpen || !date) return null;

    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const isPast = date.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[hsl(var(--card))] rounded-[var(--radius)] shadow-lg w-full max-w-md mx-4 overflow-hidden border border-[hsl(var(--border))]">
                <div className="flex justify-between items-center p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))/30]">
                    <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">{formattedDate}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-[hsl(var(--muted))] rounded-lg text-[hsl(var(--muted-foreground))]">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {events.length === 0 ? (
                        <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                            <CalendarIcon className="mx-auto mb-2 opacity-50" size={40} />
                            <p>No events scheduled for this day.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {events.map(event => (
                                <div
                                    key={event.id}
                                    onClick={() => onViewEvent(event)}
                                    className="p-3 rounded-lg border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/5] cursor-pointer transition-all"
                                >
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-[hsl(var(--foreground))]">{event.customerName}</h4>
                                        <span className="text-xs font-mono bg-[hsl(var(--muted))] px-1.5 py-0.5 rounded text-[hsl(var(--muted-foreground))]">
                                            {event.eventTime}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                                        {event.packageName || 'Event'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-[hsl(var(--border))]">
                    {isPast ? (
                        <p className="text-center text-sm text-[hsl(var(--muted-foreground))] italic">
                            Cannot book events for past dates.
                        </p>
                    ) : (
                        <Button variant="primary" className="w-full flex justify-center items-center gap-2" onClick={onAddEvent}>
                            <Plus size={18} /> Add Event for this Date
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DayDetailsModal;