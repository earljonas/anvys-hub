import React from 'react';
import {
    ShoppingCart,
    Trash2,
    Minus,
    Plus,
    CreditCard,
    Pencil, // Import Pencil icon
} from 'lucide-react';
import Button from '../common/Button';

const CartSidebar = ({
    cart,
    discount,
    setDiscount,
    subtotal,
    discountAmount,
    total,
    onQuantityChange,
    onRemove,
    onEdit, // New prop for editing
    onClear,
    onProcessPayment, // New prop for payment
    isProcessing = false, // New prop for loading state
}) => {

    // Helper to decide if we show the Flavor label
    // Scramble: Show Flavor
    // Frappe: Hide Flavor (it's in the name)
    // Soda: Hide Flavor (it's in the name)
    const shouldShowFlavor = (category) => {
        return category === 'scramble';
    };

    return (
        <div
            className={`
        bg-white rounded-[1.5rem] border border-[hsl(var(--border))]
        flex flex-col overflow-hidden relative transition-all duration-300
        ${cart.length === 0 ? 'h-auto' : 'h-full'}`}
        >
            {/* Header */}
            <div className="p-5 border-b border-[hsl(var(--border))] flex items-center gap-3">
                <ShoppingCart size={24} />
                <h2 className="font-bold text-xl">Cart ({cart.length})</h2>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar-thin">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 gap-4">
                        <ShoppingCart size={48} strokeWidth={1.5} />
                        <p className="font-medium text-sm">No items in cart</p>
                    </div>
                ) : (
                    cart.map(item => (
                        <div
                            key={item.uniqueId}
                            className="p-4 rounded-xl border border-[hsl(var(--border))] relative shadow-sm hover:border-[hsl(var(--primary))] transition-colors group"
                        >
                            {/* Action Buttons */}
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                <button
                                    onClick={() => onEdit(item)}
                                    className="text-muted-foreground hover:text-[hsl(var(--primary))] p-1 rounded-md hover:bg-slate-100 transition-colors"
                                    title="Edit Item"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => onRemove(item.uniqueId)}
                                    className="text-muted-foreground hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                                    title="Remove Item"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <h4 className="font-bold text-sm mb-1 pr-16">{item.name}</h4>

                            {/* Item Details (Flavor, Size, Add-ons) */}
                            <div className="text-xs text-muted-foreground space-y-1 mb-3">

                                {/* Conditionally Render Flavor */}
                                {shouldShowFlavor(item.category) && (
                                    <p>Flavor: <span className="text-foreground">{item.flavor || 'Original'}</span></p>
                                )}

                                {/* Only show size if the item has one (e.g., Scramble) */}
                                {item.size && (
                                    <p>Size: <span className="font-medium text-foreground">{item.size.name}</span></p>
                                )}

                                {/* Show Add-ons if they exist and count is > 0 */}
                                {item.addons && Object.keys(item.addons).length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        <span className="mr-1">Add-ons:</span>
                                        {Object.entries(item.addons).map(([name, qty]) => (
                                            qty > 0 && (
                                                <span key={name} className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-700 border border-slate-200">
                                                    {name} (x{qty})
                                                </span>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => onQuantityChange(item.uniqueId, -1)}
                                    className="w-8 h-8 border rounded-lg flex items-center justify-center hover:bg-slate-50 active:bg-slate-100"
                                >
                                    <Minus size={14} />
                                </button>

                                <span className="font-bold text-sm w-4 text-center">
                                    {item.quantity || 1}
                                </span>

                                <button
                                    onClick={() => onQuantityChange(item.uniqueId, 1)}
                                    className="w-8 h-8 border rounded-lg flex items-center justify-center hover:bg-slate-50 active:bg-slate-100"
                                >
                                    <Plus size={14} />
                                </button>

                                {/* Price Calculation for this item */}
                                <div className="ml-auto font-bold text-sm">
                                    ₱{((item.finalPrice || item.basePrice) * (item.quantity || 1)).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Totals Section */}
            {cart.length > 0 && (
                <div className="p-5 border border-[hsl(var(--border))] space-y-4 bg-slate-50/50">
                    <div>
                        <label className="text-xs font-bold block mb-1.5">Discount (%)</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            // Convert 0 to an empty string so the placeholder "0" shows up instead of a hard value
                            value={discount === 0 ? '' : discount}
                            onChange={(e) => {
                                const val = e.target.value;
                                // If the user clears the input, set discount to 0
                                if (val === '') {
                                    setDiscount(0);
                                } else {
                                    // Otherwise, parse the number and clamp it between 0 and 100
                                    const num = Math.min(100, Math.max(0, Number(val)));
                                    setDiscount(num);
                                }
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none transition-all"
                            placeholder="0"
                        />
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>₱{subtotal.toFixed(2)}</span>
                        </div>

                        {discount > 0 && (
                            <div className="flex justify-between text-[hsl(var(--primary))]">
                                <span>Discount</span>
                                <span>-₱{discountAmount.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-xl font-black pt-2 border-t border-dashed">
                            <span>Total</span>
                            <span>₱{total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <Button
                            variant="primary"
                            size="lg"
                            disabled={cart.length === 0 || isProcessing}
                            icon={CreditCard}
                            onClick={onProcessPayment}
                        >
                            {isProcessing ? 'Processing...' : 'Process Payment'}
                        </Button>

                        <Button
                            variant="outline"
                            size="lg"
                            onClick={onClear}
                            disabled={cart.length === 0}
                        >
                            Clear Cart
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartSidebar;