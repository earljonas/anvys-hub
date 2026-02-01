import React, { useRef } from 'react';
import { X, Download, Plus, Receipt } from 'lucide-react';
import Button from '../common/Button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ReceiptModal = ({
    isOpen,
    onClose,
    order,
    onNewOrder,
}) => {
    const receiptRef = useRef(null);
    const [isDownloading, setIsDownloading] = React.useState(false);

    if (!isOpen || !order) return null;

    const handleDownloadPDF = async () => {
        if (!receiptRef.current) return;

        setIsDownloading(true);
        try {
            const canvas = await html2canvas(receiptRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [80, canvas.height * 80 / canvas.width], // 80mm receipt width
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`receipt-${order.order_number}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleNewOrder = () => {
        onNewOrder();
        onClose();
    };

    const getPaymentMethodLabel = (method) => {
        const labels = {
            cash: 'Cash',
            card: 'Card',
            gcash: 'GCash',
        };
        return labels[method] || method;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))] bg-linear-to-r from-green-500 to-green-600">
                    <div className="flex items-center gap-2 text-white">
                        <Receipt size={24} />
                        <h2 className="text-lg font-bold">Payment Successful!</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Receipt Content */}
                <div className="p-4 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Printable Receipt */}
                    <div
                        ref={receiptRef}
                        className="bg-white p-6 border border-dashed border-slate-300 rounded-lg"
                        style={{ fontFamily: 'Consolas, Monaco, monospace' }}
                    >
                        {/* Business Header */}
                        <div className="text-center mb-4 pb-4 border-b border-dashed border-slate-300">
                            <h1 className="text-lg font-black text-slate-800">ANVYS ICE SCRAMBLE AND MILKSHAKES</h1>
                            <p className="text-xs text-slate-400 mt-1">Thank you for your order!</p>
                        </div>

                        {/* Order Info */}
                        <div className="text-xs text-slate-600 mb-4 pb-3 border-b border-dashed border-slate-300">
                            <div className="flex justify-between">
                                <span>Order #:</span>
                                <span className="font-bold">{order.order_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Date:</span>
                                <span>{order.created_at}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Cashier:</span>
                                <span>{order.cashier}</span>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="text-xs space-y-2 mb-4 pb-3 border-b border-dashed border-slate-300">
                            <div className="flex justify-between font-bold text-slate-700 pb-1 border-b border-slate-200">
                                <span className="flex-1">Item</span>
                                <span className="w-12 text-center">Qty</span>
                                <span className="w-16 text-right">Price</span>
                            </div>
                            {order.items.map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-slate-700">
                                        <span className="flex-1 font-medium">
                                            {item.product_name}
                                            {item.size_name && ` (${item.size_name})`}
                                        </span>
                                        <span className="w-12 text-center">{item.quantity}</span>
                                        <span className="w-16 text-right">
                                            ₱{(item.unit_price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                    {item.addons_data && Object.keys(item.addons_data).length > 0 && (
                                        <div className="text-[10px] text-slate-500 ml-2">
                                            + {Object.entries(item.addons_data)
                                                .filter(([_, qty]) => qty > 0)
                                                .map(([name, qty]) => `${name} (x${qty})`)
                                                .join(', ')}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="text-xs space-y-1 mb-4 pb-3 border-b border-dashed border-slate-300">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>₱{parseFloat(order.subtotal).toFixed(2)}</span>
                            </div>
                            {order.discount_percent > 0 && (
                                <div className="flex justify-between text-pink-600">
                                    <span>Discount ({order.discount_percent}%)</span>
                                    <span>-₱{parseFloat(order.discount_amount).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-black text-lg text-slate-800 pt-2 border-t border-slate-200">
                                <span>TOTAL</span>
                                <span>₱{parseFloat(order.total).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="text-xs space-y-1 mb-4">
                            <div className="flex justify-between text-slate-600">
                                <span>Payment Method</span>
                                <span className="font-semibold">{getPaymentMethodLabel(order.payment_method)}</span>
                            </div>
                            {order.payment_method === 'cash' && order.amount_received && (
                                <>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Amount Received</span>
                                        <span>₱{parseFloat(order.amount_received).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-green-600">
                                        <span>Change</span>
                                        <span>₱{parseFloat(order.change_amount || 0).toFixed(2)}</span>
                                    </div>
                                </>
                            )}
                            {order.reference_number && (
                                <div className="flex justify-between text-slate-600">
                                    <span>Reference #</span>
                                    <span className="font-mono">{order.reference_number}</span>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="text-center pt-3 border-t border-dashed border-slate-300">
                            <p className="text-xs text-slate-500">★ ★ ★ ★ ★</p>
                            <p className="text-[10px] text-slate-400 mt-1">Thank you for choosing Anvys Hub!</p>
                            <p className="text-[10px] text-slate-400">Please come again</p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-[hsl(var(--border))] bg-slate-50 flex gap-3">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        icon={Download}
                        className="flex-1"
                    >
                        {isDownloading ? 'Printing...' : 'Print Receipt'}
                    </Button>
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleNewOrder}
                        icon={Plus}
                        className="flex-1"
                    >
                        New Order
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptModal;
