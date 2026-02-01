<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductSize;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class POSController extends Controller
{
    /**
     * Display the POS page with products and categories.
     */
    public function index()
    {
        $categories = Category::all()->map(function ($category) {
            return [
                'id' => $category->slug,
                'name' => $category->name,
            ];
        });

        // Add "All Menu" as first category
        $categories = collect([['id' => 'all', 'name' => 'All Menu']])->merge($categories);

        $products = Product::with(['sizes', 'addons', 'category'])
            ->where('is_active', true)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'category' => $product->category->slug,
                    'basePrice' => (float) $product->base_price,
                    'hasSizes' => $product->has_sizes,
                    'flavor' => $product->flavor,
                    'image' => $product->image,
                    'sizes' => $product->sizes->map(function ($size) {
                        return [
                            'id' => $size->id,
                            'name' => $size->name,
                            'price' => (float) $size->price,
                        ];
                    })->toArray(),
                    'addons' => $product->addons->map(function ($addon) {
                        return [
                            'id' => $addon->id,
                            'name' => $addon->name,
                            'price' => (float) $addon->price,
                        ];
                    })->toArray(),
                ];
            });

        return Inertia::render('staff/POS', [
            'categories' => $categories,
            'products' => $products,
        ]);
    }

    /**
     * Store a new order.
     */
    public function storeOrder(Request $request)
    {
        \Illuminate\Support\Facades\Log::info('Order Request Payload:', $request->all());

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_size_id' => 'nullable|exists:product_sizes,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.addons_data' => 'nullable|array',
            'items.*.total_price' => 'required|numeric|min:0',
            'items.*.product_name' => 'required|string',
            'items.*.size_name' => 'nullable|string',
            'discount' => 'nullable|numeric|min:0|max:100',
            'payment_method' => 'required|in:cash,card,gcash',
            'amount_received' => 'nullable|numeric|min:0',
            'reference_number' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $subtotal = collect($validated['items'])->sum('total_price');
            $discountPercent = $validated['discount'] ?? 0;
            $discountAmount = ($subtotal * $discountPercent) / 100;
            $total = $subtotal - $discountAmount;

            // Calculate change for cash payments
            $amountReceived = $validated['amount_received'] ?? null;
            $changeAmount = null;
            if ($validated['payment_method'] === 'cash' && $amountReceived !== null) {
                $changeAmount = $amountReceived - $total;
            }

            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'subtotal' => $subtotal,
                'discount_percent' => $discountPercent,
                'discount_amount' => $discountAmount,
                'total' => $total,
                'status' => 'completed',
                'payment_method' => $validated['payment_method'],
                'amount_received' => $amountReceived,
                'change_amount' => $changeAmount,
                'reference_number' => $validated['reference_number'] ?? null,
                'created_by' => Auth::id(),
            ]);

            foreach ($validated['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'product_size_id' => $item['product_size_id'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'addons_data' => $item['addons_data'] ?? null,
                    'total_price' => $item['total_price'],
                ]);
            }

            DB::commit();

            // Return order data for receipt
            return response()->json([
                'success' => true,
                'order' => [
                    'order_number' => $order->order_number,
                    'created_at' => $order->created_at->format('M d, Y h:i A'),
                    'items' => $validated['items'],
                    'subtotal' => $subtotal,
                    'discount_percent' => $discountPercent,
                    'discount_amount' => $discountAmount,
                    'total' => $total,
                    'payment_method' => $validated['payment_method'],
                    'amount_received' => $amountReceived,
                    'change_amount' => $changeAmount,
                    'reference_number' => $validated['reference_number'] ?? null,
                    'cashier' => Auth::user()->name,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Order creation failed: ' . $e->getMessage());
            \Illuminate\Support\Facades\Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order. Please try again.',
                'error' => $e->getMessage() // Return error message for debugging
            ], 500);
        }
    }
}
