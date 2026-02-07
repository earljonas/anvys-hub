import React, { useState, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import StaffLayout from '../../Layouts/StaffLayout';
import { Search } from 'lucide-react';
import CategoryTab from '../../Components/POS/CategoryTab';
import ProductCard from '../../Components/POS/ProductCard';
import CustomizeModal from '../../Components/POS/CustomizeModal';
import CartSidebar from '../../Components/POS/CartSidebar';
import PaymentModal from '../../Components/POS/PaymentModal';
import ReceiptModal from '../../Components/POS/ReceiptModal';

const POS = ({ categories, products }) => {
    const { flash } = usePage().props;

    const [cart, setCart] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');

    // selectedProduct triggers the modal to open
    const [selectedProduct, setSelectedProduct] = useState(null);

    // editingItem tracks if we are modifying an existing cart item
    const [editingItem, setEditingItem] = useState(null);

    const [search, setSearch] = useState("");
    const [discount, setDiscount] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Payment flow state
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [completedOrder, setCompletedOrder] = useState(null);

    const filteredProducts = useMemo(() => {
        return products.filter(p => (activeCategory === 'all' || p.category === activeCategory) && p.name.toLowerCase().includes(search.toLowerCase()));
    }, [activeCategory, search, products]);

    const handleQuantityChange = (uniqueId, change) => {
        setCart(cart.map(item => {
            if (item.uniqueId === uniqueId) {
                const newQuantity = Math.max(1, (item.quantity || 1) + change);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const removeFromCart = (uniqueId) => {
        setCart(cart.filter(c => c.uniqueId !== uniqueId));
    };

    // Triggered when clicking the Edit icon in sidebar
    const handleEditCartItem = (cartItem) => {
        // Find the original product definition to pass to the modal
        const originalProduct = products.find(p => p.id === cartItem.id) || cartItem;

        setEditingItem(cartItem);      // Set the item being edited
        setSelectedProduct(originalProduct); // Open the modal with this product
    };

    // Central function to handle Adding OR Updating items
    const saveToCart = (itemData) => {
        if (editingItem) {
            // EDIT MODE: Update the existing item in the cart
            setCart(cart.map(item =>
                item.uniqueId === editingItem.uniqueId
                    ? { ...itemData, uniqueId: editingItem.uniqueId, quantity: editingItem.quantity } // Keep original ID and Qty
                    : item
            ));
            setEditingItem(null); // Clear edit mode
        } else {
            // ADD MODE: Push new item
            const newItem = { ...itemData, quantity: 1 };
            setCart([...cart, newItem]);
        }

        setSelectedProduct(null); // Close modal
    };

    const handleModalClose = () => {
        setSelectedProduct(null);
        setEditingItem(null); // Ensure edit mode is cleared if they close without saving
    };

    const clearCart = () => {
        if (confirm('Are you sure you want to clear the cart?')) {
            setCart([]);
            setDiscount(0);
        }
    };

    const subtotal = cart.reduce((s, i) => s + (i.finalPrice * (i.quantity || 1)), 0);
    const discountAmount = (subtotal * discount) / 100;
    const total = subtotal - discountAmount;

    // Open payment modal instead of direct processing
    const handleProcessPayment = () => {
        if (cart.length === 0) return;
        setShowPaymentModal(true);
    };

    // Handle payment confirmation from PaymentModal
    const handleConfirmPayment = async (paymentData) => {
        setIsProcessing(true);

        // Prepare items for backend
        const items = cart.map(item => ({
            product_id: item.id,
            product_size_id: item.size?.id || null,
            quantity: item.quantity || 1,
            unit_price: item.finalPrice,
            addons_data: item.addons || null,
            total_price: item.finalPrice * (item.quantity || 1),
            product_name: item.name,
            size_name: item.size?.name || null,
        }));

        try {
            const payload = {
                items,
                discount,
                payment_method: paymentData.paymentMethod,
                amount_received: paymentData.amountReceived,
                reference_number: paymentData.referenceNumber,
            };

            const response = await window.axios.post('/staff/pos/orders', payload);
            const data = response.data;

            if (data.success) {
                setShowPaymentModal(false);
                setCompletedOrder(data.order);
                setShowReceiptModal(true);
            } else {
                console.error('Payment failed:', data);
                const msg = data.message || 'Payment failed. Please try again.';
                alert(msg + (data.errors ? '\n' + JSON.stringify(data.errors) : ''));
            }
        } catch (error) {
            console.error('Payment error:', error);
            if (error.response) {
                const data = error.response.data;
                const msg = data.message || 'Payment failed. Please try again.';
                alert(msg + (data.errors ? '\n' + JSON.stringify(data.errors) : ''));
            } else {
                alert('Payment failed. Please check your connection.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle new order after receipt
    const handleNewOrder = () => {
        setCart([]);
        setDiscount(0);
        setCompletedOrder(null);
        setShowReceiptModal(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Head title="POS System" />

            {/* Flash Messages */}
            {flash?.success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {flash.error}
                </div>
            )}

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-hidden">

                {/* Product Grid Area (Left) */}
                <div className="lg:col-span-8 xl:col-span-9 flex flex-col h-full gap-4">
                    {/* Header / Filter Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-2 rounded-2xl border border-[hsl(var(--border))] shadow-sm gap-4">
                        <div className="flex gap-2 p-1 overflow-x-auto w-full sm:w-auto no-scrollbar">
                            {categories.map(cat => <CategoryTab key={cat.id} category={cat} active={activeCategory} onClick={setActiveCategory} />)}
                        </div>
                        <div className="relative w-full sm:w-auto min-w-[250px] mr-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input
                                onChange={(e) => setSearch(e.target.value)}
                                type="text"
                                placeholder="Search menu..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
                            />
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1 overflow-y-auto pr-2 pb-10 custom-scrollbar">
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredProducts.map(p => <ProductCard key={p.id} product={p} onSelect={setSelectedProduct} />)}
                        </div>
                    </div>
                </div>

                {/* Cart Sidebar (Right) */}
                <div className="lg:col-span-4 xl:col-span-3">
                    <CartSidebar
                        cart={cart}
                        discount={discount}
                        setDiscount={setDiscount}
                        subtotal={subtotal}
                        discountAmount={discountAmount}
                        total={total}
                        onQuantityChange={handleQuantityChange}
                        onRemove={removeFromCart}
                        onEdit={handleEditCartItem}
                        onClear={clearCart}
                        onProcessPayment={handleProcessPayment}
                        isProcessing={isProcessing}
                    />
                </div>

            </div>

            {/* Customize Product Modal */}
            <CustomizeModal
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={handleModalClose}
                onAddToCart={saveToCart}
                initialData={editingItem}
            />

            {/* Payment Modal */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                cart={cart}
                subtotal={subtotal}
                discountPercent={discount}
                discountAmount={discountAmount}
                total={total}
                onConfirmPayment={handleConfirmPayment}
                isProcessing={isProcessing}
            />

            {/* Receipt Modal */}
            <ReceiptModal
                isOpen={showReceiptModal}
                onClose={() => setShowReceiptModal(false)}
                order={completedOrder}
                onNewOrder={handleNewOrder}
            />
        </div>
    );
};

POS.layout = (page) => <StaffLayout>{page}</StaffLayout>;
export default POS;