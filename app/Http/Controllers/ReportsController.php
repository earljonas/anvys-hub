<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportsController extends Controller
{
    /**
     * Display the Reports page with real data.
     */
    public function index()
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        // Monthly revenue
        $monthlyRevenue = Order::where('status', 'completed')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->sum('total');

        // Last month revenue for comparison
        $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
        $lastMonthEnd = $now->copy()->subMonth()->endOfMonth();
        $lastMonthRevenue = Order::where('status', 'completed')
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->sum('total');

        $revenueChange = $lastMonthRevenue > 0
            ? round((($monthlyRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : 0;

        // Total orders this month
        $totalOrders = Order::where('status', 'completed')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->count();

        $lastMonthOrders = Order::where('status', 'completed')
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->count();

        $ordersChange = $lastMonthOrders > 0
            ? round((($totalOrders - $lastMonthOrders) / $lastMonthOrders) * 100, 1)
            : 0;

        // Peak hour
        $peakHourData = Order::where('status', 'completed')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->selectRaw('HOUR(created_at) as hour, COUNT(*) as count')
            ->groupBy('hour')
            ->orderByDesc('count')
            ->first();

        $peakHour = $peakHourData ? Carbon::createFromTime($peakHourData->hour)->format('g:i A') : 'N/A';
        $peakHourOrders = $peakHourData ? $peakHourData->count : 0;

        // Weekly revenue for this month
        $weeklyRevenue = [];
        for ($week = 1; $week <= 4; $week++) {
            $weekStart = $startOfMonth->copy()->addWeeks($week - 1);
            $weekEnd = $week < 4
                ? $weekStart->copy()->addDays(6)->endOfDay()
                : $endOfMonth->copy()->endOfDay();

            $revenue = Order::where('status', 'completed')
                ->whereBetween('created_at', [$weekStart, $weekEnd])
                ->sum('total');

            $weeklyRevenue[] = [
                'label' => "Week $week",
                'value' => round($revenue, 2),
            ];
        }

        // Best selling products
        $bestSelling = OrderItem::select('product_id', DB::raw('SUM(quantity) as total_sold'))
            ->whereHas('order', function ($query) use ($startOfMonth, $endOfMonth) {
                $query->where('status', 'completed')
                    ->whereBetween('created_at', [$startOfMonth, $endOfMonth]);
            })
            ->groupBy('product_id')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->with('product')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->product?->name ?? 'Unknown',
                    'value' => (int) $item->total_sold,
                ];
            });

        // If no best selling, provide placeholder
        if ($bestSelling->isEmpty()) {
            $bestSelling = collect([
                ['name' => 'No sales yet', 'value' => 0],
            ]);
        }

        // Recent orders for the table
        $recentOrders = Order::with('items.product')
            ->where('status', 'completed')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function ($order) {
                return [
                    'order_number' => $order->order_number,
                    'date' => $order->created_at->format('M d, Y h:i A'),
                    'items_count' => $order->items->count(),
                    'total' => (float) $order->total,
                    'payment_method' => $order->payment_method,
                ];
            });

        return Inertia::render('admin/Reports', [
            'stats' => [
                'monthlyRevenue' => round($monthlyRevenue, 2),
                'revenueChange' => $revenueChange,
                'totalOrders' => $totalOrders,
                'ordersChange' => $ordersChange,
                'peakHour' => $peakHour,
                'peakHourOrders' => $peakHourOrders,
            ],
            'weeklyRevenue' => $weeklyRevenue,
            'bestSelling' => $bestSelling,
            'recentOrders' => $recentOrders,
        ]);
    }
}
