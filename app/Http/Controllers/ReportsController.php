<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Event;
use App\Models\InventoryItem;
use App\Models\StockLog;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportsController extends Controller
{
    /**
     * Display the Sales Reports page.
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

        // Last month revenue
        $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
        $lastMonthEnd = $now->copy()->subMonth()->endOfMonth();

        $lastMonthRevenue = Order::where('status', 'completed')
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->sum('total');

        $revenueChange = $lastMonthRevenue > 0
            ? round((($monthlyRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : 0;

        // Orders count
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

        $peakHour = $peakHourData
            ? Carbon::createFromTime($peakHourData->hour)->format('g:i A')
            : 'N/A';

        $peakHourOrders = $peakHourData ? $peakHourData->count : 0;

        // Weekly revenue
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

        if ($bestSelling->isEmpty()) {
            $bestSelling = collect([
                ['name' => 'No sales yet', 'value' => 0],
            ]);
        }

        // Recent orders
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

        return Inertia::render('admin/reports/SalesReports', [
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

    /**
     * Display the Inventory Reports page.
     */
    public function inventory()
    {
        $totalItems = InventoryItem::count();
        $lowStockCount = InventoryItem::where('status', 'Low Stock')->count();
        $outOfStockCount = InventoryItem::where('status', 'Out of Stock')->count();
        $totalValue = InventoryItem::sum(DB::raw('stock * cost_per_unit'));

        $stockLogs = StockLog::with(['inventoryItem', 'user.employee', 'location'])
            ->latest('logged_at')
            ->limit(10)
            ->get()
            ->map(function ($log) {
                // Use employee name if available, otherwise fall back to user name
                $userName = 'System';
                if ($log->user) {
                    $userName = $log->user->employee?->name ?? $log->user->name;
                }
                return [
                    'id' => $log->id,
                    'item' => $log->inventoryItem->name ?? 'Unknown',
                    'location' => $log->location->name ?? 'Unknown',
                    'type' => $log->type,
                    'quantity' => $log->quantity,
                    'notes' => $log->notes,
                    'user' => $userName,
                    'date' => $log->logged_at->format('M d, Y'),
                    'time' => $log->logged_at->format('h:i A'),
                ];
            });

        $lowStockItems = InventoryItem::with('location')
            ->whereIn('status', ['Low Stock', 'Out of Stock'])
            ->orderBy('stock')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'location' => $item->location->name ?? 'N/A',
                    'stock' => $item->stock,
                    'min_stock' => $item->min_stock,
                    'status' => $item->status,
                ];
            });

        return Inertia::render('admin/reports/InventoryReports', [
            'stats' => [
                'totalItems' => $totalItems,
                'lowStockCount' => $lowStockCount,
                'outOfStockCount' => $outOfStockCount,
                'totalValue' => $totalValue,
            ],
            'stockLogs' => $stockLogs,
            'lowStockItems' => $lowStockItems,
        ]);
    }

    /**
     * Display the Events Reports page.
     */
    public function events()
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        $totalEvents = Event::whereBetween('event_date', [$startOfMonth, $endOfMonth])->count();
        $upcomingEventsCount = Event::where('event_date', '>=', $now->toDateString())->count();

        $eventsThisMonth = Event::with('package')
            ->whereBetween('event_date', [$startOfMonth, $endOfMonth])
            ->get();

        $totalAttendees = $eventsThisMonth->sum(function ($event) {
            $basePax = $event->package ? $event->package->cups_count : 0;
            return $basePax + $event->extra_guests;
        });

        $locationsUsed = Event::distinct('address')->count('address');

        $upcomingEvents = Event::with('package')
            ->where('event_date', '>=', $now->toDateString())
            ->orderBy('event_date')
            ->limit(5)
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'name' => $event->customer_name,
                    'package' => $event->package->name ?? 'Custom',
                    'date' => $event->event_date->format('M d, Y'),
                    'time' => Carbon::parse($event->event_time)->format('g:i A'),
                    'attendees' => ($event->package ? $event->package->cups_count : 0) + $event->extra_guests,
                    'status' => $event->payment_status,
                ];
            });

        $monthlyEvents = [];

        for ($i = 5; $i >= 0; $i--) {
            $date = $now->copy()->subMonths($i);

            $count = Event::whereYear('event_date', $date->year)
                ->whereMonth('event_date', $date->month)
                ->count();

            $monthlyEvents[] = [
                'name' => $date->format('M'),
                'events' => $count,
            ];
        }

        return Inertia::render('admin/reports/EventsReports', [
            'stats' => [
                'totalEvents' => $totalEvents,
                'upcomingEvents' => $upcomingEventsCount,
                'totalAttendees' => $totalAttendees,
                'locationsUsed' => $locationsUsed,
            ],
            'upcomingEvents' => $upcomingEvents,
            'monthlyEvents' => $monthlyEvents,
        ]);
    }
}
