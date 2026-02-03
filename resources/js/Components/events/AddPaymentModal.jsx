import React, { useState } from 'react';
import { X, DollarSign, FileText } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

const AddPaymentModal = ({ isOpen, onClose, event, onSave }) => {
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !event) return null;

    const remainingBalance = (event.totalPrice || 0) - (event.totalPaid || 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return;

        setIsSubmitting(true);
        onSave({
            eventId: event.id,
            amount: parseFloat(amount),
            notes: notes.trim() || null
        });
    };

    const handleClose = () => {
        setAmount('');
        setNotes('');
        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-[hsl(var(--card))] rounded-[var(--radius)] shadow-xl w-full max-w-md overflow-hidden border border-[hsl(var(--border))]">
                <div className="flex justify-between items-center p-4 border-b border-[hsl(var(--border))]">
                    <h3 className="text-xl font-bold">Add Payment</h3>
                    <button onClick={handleClose} className="p-1 rounded-lg hover:bg-[hsl(var(--muted))]">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Summary */}
                    <div className="p-4 rounded-xl bg-[hsl(var(--muted))] space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-[hsl(var(--muted-foreground))]">Total Price</span>
                            <span className="font-semibold">₱{(event.totalPrice || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-[hsl(var(--muted-foreground))]">Already Paid</span>
                            <span className="font-semibold text-green-600">₱{(event.totalPaid || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-[hsl(var(--border))]">
                            <span className="font-medium">Remaining Balance</span>
                            <span className="font-bold text-lg text-[hsl(var(--primary))]">₱{remainingBalance.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <label className="text-sm font-medium flex items-center gap-2 mb-2">
                            <DollarSign size={14} /> Payment Amount
                        </label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max={remainingBalance > 0 ? remainingBalance : undefined}
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            required
                        />
                        {remainingBalance > 0 && (
                            <button
                                type="button"
                                onClick={() => setAmount(remainingBalance.toString())}
                                className="mt-2 text-xs text-[hsl(var(--primary))] hover:underline"
                            >
                                Pay full remaining balance (₱{remainingBalance.toLocaleString()})
                            </button>
                        )}
                    </div>

                    {/* Notes Input */}
                    <div>
                        <label className="text-sm font-medium flex items-center gap-2 mb-2">
                            <FileText size={14} /> Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Payment method, reference number, etc."
                            rows={3}
                            className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting || !amount}>
                            {isSubmitting ? 'Recording...' : 'Record Payment'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPaymentModal;
