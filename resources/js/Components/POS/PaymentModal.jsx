import React, { useState, useEffect } from 'react';
import {
    X,
    Banknote,
    CreditCard,
    Smartphone,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
import Button from '../common/Button';

const PaymentModal = ({
    isOpen,
    onClose,
    cart,
    subtotal,
    discountPercent,
    discountAmount,
    total,
    onConfirmPayment,
    isProcessing,
}) => {
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [amountReceived, setAmountReceived] = useState('');
    const [referenceNumber, setReferenceNumber] = useState('');

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setPaymentMethod('cash');
            setAmountReceived('');
            setReferenceNumber('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const change = paymentMethod === 'cash' && amountReceived
        ? parseFloat(amountReceived) - total
        : 0;

    const isValidPayment = () => {
        if (paymentMethod === 'cash') {
            return amountReceived && parseFloat(amountReceived) >= total;
        }
        // Card and GCash can proceed without reference (optional for demo)
        return true;
    };

    const handleConfirm = () => {
        if (!isValidPayment()) return;

        onConfirmPayment({
            paymentMethod,
            amountReceived: paymentMethod === 'cash' ? parseFloat(amountReceived) : null,
            referenceNumber: paymentMethod !== 'cash' ? referenceNumber : null,
        });
    };

    const quickAmounts = [
        { label: 'Exact', value: total },
        { label: '+₱20', value: total + 20 },
        { label: '+₱50', value: total + 50 },
        { label: '+₱100', value: total + 100 },
        { label: '₱500', value: 500 },
        { label: '₱1000', value: 1000 },
    ];

    const paymentMethods = [
        { id: 'cash', label: 'Cash', icon: Banknote, color: 'bg-green-500' },
        { id: 'card', label: 'Card', icon: CreditCard, color: 'bg-blue-500' },
        { id: 'gcash', label: 'GCash', icon: Smartphone, color: 'bg-blue-600' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.8)]">
                    <h2 className="text-xl font-bold text-white">Payment Confirmation</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
                    {/* Order Summary */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <h3 className="font-bold text-sm text-slate-700 mb-3">Order Summary</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <div className="flex-1">
                                        <span className="font-medium">{item.name}</span>
                                        {item.size && (
                                            <span className="text-slate-500 ml-1">({item.size.name})</span>
                                        )}
                                        <span className="text-slate-400 ml-2">x{item.quantity || 1}</span>
                                    </div>
                                    <span className="font-semibold">
                                        ₱{(item.finalPrice * (item.quantity || 1)).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-dashed border-slate-300 mt-3 pt-3 space-y-1">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Subtotal</span>
                                <span>₱{subtotal.toFixed(2)}</span>
                            </div>
                            {discountPercent > 0 && (
                                <div className="flex justify-between text-sm text-[hsl(var(--primary))]">
                                    <span>Discount ({discountPercent}%)</span>
                                    <span>-₱{discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-black pt-2">
                                <span>Total</span>
                                <span>₱{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div>
                        <h3 className="font-bold text-sm text-slate-700 mb-3">Payment Method</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {paymentMethods.map((method) => {
                                const Icon = method.icon;
                                const isSelected = paymentMethod === method.id;
                                return (
                                    <button
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id)}
                                        className={`
                                            relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2
                                            ${isSelected
                                                ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)] shadow-lg shadow-[hsl(var(--primary)/0.2)]'
                                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                            }
                                        `}
                                    >
                                        {isSelected && (
                                            <CheckCircle2
                                                className="absolute top-2 right-2 text-[hsl(var(--primary))]"
                                                size={16}
                                            />
                                        )}
                                        <div className={`p-3 rounded-full ${method.color}`}>
                                            <Icon className="text-white" size={24} />
                                        </div>
                                        <span className={`font-semibold text-sm ${isSelected ? 'text-[hsl(var(--primary))]' : 'text-slate-700'}`}>
                                            {method.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Cash Payment Input */}
                    {paymentMethod === 'cash' && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <label className="font-bold text-sm text-slate-700 block mb-2">
                                    Amount Received
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₱</span>
                                    <input
                                        type="number"
                                        value={amountReceived}
                                        onChange={(e) => setAmountReceived(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-8 pr-4 py-3 text-2xl font-bold rounded-xl border-2 border-slate-200 focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] outline-none transition-all text-center"
                                    />
                                </div>
                            </div>

                            {/* Quick Amount Buttons */}
                            <div className="grid grid-cols-3 gap-2">
                                {quickAmounts.map((quick) => (
                                    <button
                                        key={quick.label}
                                        onClick={() => setAmountReceived(quick.value.toFixed(2))}
                                        className="py-2 px-3 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 hover:border-[hsl(var(--primary))] transition-all"
                                    >
                                        {quick.label}
                                    </button>
                                ))}
                            </div>

                            {/* Change Display */}
                            {amountReceived && (
                                <div className={`
                                    p-4 rounded-xl border-2 flex items-center justify-between
                                    ${change >= 0
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-red-50 border-red-200'
                                    }
                                `}>
                                    <div className="flex items-center gap-2">
                                        {change >= 0 ? (
                                            <CheckCircle2 className="text-green-500" size={24} />
                                        ) : (
                                            <AlertCircle className="text-red-500" size={24} />
                                        )}
                                        <span className={`font-semibold ${change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                            {change >= 0 ? 'Change' : 'Insufficient Amount'}
                                        </span>
                                    </div>
                                    <span className={`text-2xl font-black ${change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                        ₱{Math.abs(change).toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Card/GCash Reference Input */}
                    {(paymentMethod === 'card' || paymentMethod === 'gcash') && (
                        <div className="animate-in fade-in duration-200">
                            <label className="font-bold text-sm text-slate-700 block mb-2">
                                Reference Number (Optional)
                            </label>
                            <input
                                type="text"
                                value={referenceNumber}
                                onChange={(e) => setReferenceNumber(e.target.value)}
                                placeholder="Enter transaction reference..."
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] outline-none transition-all"
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-[hsl(var(--border))] bg-slate-50 flex gap-3">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={onClose}
                        className="flex-1"
                        disabled={isProcessing}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleConfirm}
                        className="flex-1"
                        disabled={!isValidPayment() || isProcessing}
                    >
                        {isProcessing ? 'Processing...' : `Confirm Payment (₱${total.toFixed(2)})`}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
