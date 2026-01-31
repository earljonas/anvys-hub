import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import StaffLayout from '../../Layouts/StaffLayout';
import { ShoppingCart, Trash2, Search, Heart, Minus, Plus, CreditCard, RotateCcw } from 'lucide-react';
import CategoryTab from '../../Components/POS/CategoryTab';
import ProductCard from '../../Components/POS/ProductCard';
import CustomizeModal from '../../Components/POS/CustomizeModal';
import Button from '../../Components/common/Button';

const POS = () => {
    const categories = [
        { id: 'all', name: 'All Menu' },
        { id: 'scramble', name: 'Ice Scramble' },
        { id: 'frappe', name: 'Frappes' },
        { id: 'soda', name: 'Fruit Soda' },
    ];

    const products = [
        ...['Strawberry', 'Chocolate', 'Ube', 'Pandan', 'Melon', 'Mango Graham'].map((f, i) => ({
            id: `scramble-${i}`, name: `${f} Ice Scramble`, category: 'scramble', basePrice: 100, hasSizes: true, flavor: f,
            sizes: [{ name: 'Small', price: 100 }, { name: 'Medium', price: 110 }, { name: 'Large', price: 120 }, { name: '1 Liter', price: 200 }],
            addons: [{ name: 'Milk', price: 10 }, { name: 'Marshmallows', price: 10 }, { name: 'Sprinkles', price: 10 }, { name: 'Nips', price: 10 }, { name: 'Graham', price: 10 }, { name: 'Oreo', price: 10 }]
        })),
        ...['Cookies & Cream', 'Cappuccino', 'Chocolate'].map((f, i) => ({
            id: `frappe-${i}`, name: `${f} Frappe`, category: 'frappe', basePrice: 149, flavor: f
        })),
        ...['Strawberry', 'Green Apple', 'Four Seasons', 'Lychee', 'Blueberry'].map((f, i) => ({
            id: `soda-${i}`, name: `${f} Fruit Soda`, category: 'soda', basePrice: 59, flavor: f,
            addons: [{ name: 'Yakult', price: 15 }, { name: 'Fruit Jelly', price: 15 }]
        }))
    ];

    const [cart, setCart] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [search, setSearch] = useState("");
    const [discount, setDiscount] = useState(0);

    const filteredProducts = useMemo(() => {
        return products.filter(p => (activeCategory === 'all' || p.category === activeCategory) && p.name.toLowerCase().includes(search.toLowerCase()));
    }, [activeCategory, search]);

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

    const addToCart = (item) => {
        setCart([...cart, { ...item, quantity: 1 }]);
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

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col gap-6 animate-in fade-in duration-500">
            <Head title="POS System" />
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-hidden">

                {/* Product Grid Area (Left) */}
                <div className="lg:col-span-8 xl:col-span-9 flex flex-col h-full gap-6">
                    {/* Header / Filter Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-2 rounded-2xl border border-border shadow-sm gap-4">
                        <div className="flex gap-2 p-1 overflow-x-auto w-full sm:w-auto no-scrollbar">
                            {categories.map(cat => <CategoryTab key={cat.id} category={cat} active={activeCategory} onClick={setActiveCategory} />)}
                        </div>
                        <div className="relative w-full sm:w-auto min-w-[250px] mr-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input
                                onChange={(e) => setSearch(e.target.value)}
                                type="text"
                                placeholder="Search menu..."
                                className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-xl border-transparent focus:ring-2 focus:ring-[hsl(var(--primary))]/20 focus:border-[hsl(var(--primary))] text-sm transition-all"
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
                <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-[1.5rem] border border-border shadow-lg flex flex-col h-full overflow-hidden relative">
                    <div className="p-5 border-b border-border flex items-center gap-3 bg-white">
                        <ShoppingCart size={24} className="text-[hsl(var(--foreground))]" />
                        <h2 className="font-bold text-xl text-[hsl(var(--foreground))]">Cart ({cart.length})</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white custom-scrollbar-thin">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 gap-4">
                                <ShoppingCart size={48} strokeWidth={1.5} />
                                <p className="font-medium text-sm">No items in cart</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.uniqueId} className="bg-white p-4 rounded-xl border border-border/60 hover:border-[hsl(var(--primary))]/50 group transition-all relative">
                                    <button
                                        onClick={() => removeFromCart(item.uniqueId)}
                                        className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <div className="pr-6">
                                        <h4 className="font-bold text-sm text-[hsl(var(--foreground))] leading-tight mb-1">{item.name}</h4>
                                        <p className="text-xs text-muted-foreground mb-1">{item.flavor || 'Original'}</p>

                                        {/* Addons Display */}
                                        <div className="text-[10px] text-muted-foreground mb-3 flex flex-wrap gap-1">
                                            {Object.entries(item.addons).some(([, q]) => q > 0) && (
                                                <span className="font-medium">+ </span>
                                            )}
                                            {Object.entries(item.addons).map(([n, q], idx, arr) => (
                                                q > 0 && <span key={n}>{n}{idx < arr.length - 1 ? ', ' : ''}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Quantity and Price */}
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleQuantityChange(item.uniqueId, -1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-[hsl(var(--foreground))] transition-colors"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="font-bold text-sm min-w-[1rem] text-center">{item.quantity || 1}</span>
                                            <button
                                                onClick={() => handleQuantityChange(item.uniqueId, 1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-[hsl(var(--foreground))] transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        {/* Currently displaying unit price * quantity or just unit? Usually item total in cart line */}
                                        {/* Let's show unit price if quantity > 1 ?? Or just total? The ref image shows 120.00 total at bottom, but cart items usually don't show per-line total in some simplified views, but good to have. 
                                            Image doesn't show price per item clearly, just subtotal. I'll hide per-item price or make it subtle if needed. 
                                            Actually, let's keep it simple. */}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Discount & Totals Section */}
                    <div className="p-5 bg-[hsl(var(--card))] border-t border-border space-y-4">

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[hsl(var(--foreground))]">Discount (%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={discount}
                                onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm focus:ring-1 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] outline-none transition-all"
                                placeholder="0"
                            />
                        </div>

                        <div className="h-px bg-border my-2" />

                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span className="font-medium">₱{subtotal.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between items-center text-sm text-[hsl(var(--primary))]">
                                    <span className="">Discount ({discount}%):</span>
                                    <span>-₱{discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-xl font-black text-[hsl(var(--foreground))] pt-2">
                                <span>Total:</span>
                                <span>₱{total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() => alert('Process Payment Clicked')} // Placeholder for now or keep empty/disabled logic
                                disabled={cart.length === 0}
                                className="w-full rounded-xl py-3 text-base shadow-md"
                                icon={CreditCard}
                            >
                                Process Payment
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={clearCart}
                                disabled={cart.length === 0}
                                className="w-full rounded-xl py-3 text-base"
                                icon={RotateCcw}
                            >
                                Clear Cart
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <CustomizeModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={(item) => addToCart(item)} />
        </div>
    );
};

POS.layout = (page) => <StaffLayout>{page}</StaffLayout>;
export default POS;