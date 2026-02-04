<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Event;
use App\Models\Employee;
use App\Models\InventoryItem;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard with real data.
     */
    public function index()
    {
        $now = Carbon::now();
        $today = $now->copy()->startOfDay();
        $yesterday = $now->copy()->subDay()->startOfDay();
        $yesterdayEnd = $now->copy()->subDay()->endOfDay();

        // Today's Sales
        $todaysSales = Order::where('status', 'completed')
            ->whereDate('created_at', $today)
            ->sum('total');

        $yesterdaysSales = Order::where('status', 'completed')
            ->whereBetween('created_at', [$yesterday, $yesterdayEnd])
            ->sum('total');

        $salesChange = $yesterdaysSales > 0
            ? round((($todaysSales - $yesterdaysSales) / $yesterdaysSales) * 100, 1)
            : ($todaysSales > 0 ? 100 : 0);

        // Low Stock Items Count
        $lowStockCount = InventoryItem::whereIn('status', ['Low Stock', 'Out of Stock'])->count();

        // Upcoming Events (next 30 days)
        $upcomingEventsCount = Event::where('event_date', '>=', $now->toDateString())
            ->where('event_date', '<=', $now->copy()->addDays(30)->toDateString())
            ->count();

        // Pending Payroll (active employees count)
        $activeEmployeesCount = Employee::where('status', 'active')->count();
        $pendingPayroll = Employee::where('status', 'active')->sum('daily_rate') * 15; // Estimate

        // Low Stock Alerts (get actual items)
        $lowStockItems = InventoryItem::with('location')
            ->whereIn('status', ['Low Stock', 'Out of Stock'])
            ->orderBy('stock')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'remaining' => $item->stock . ' ' . $item->unit,
                    'min' => $item->min_stock,
                    'status' => $item->status,
                ];
            });

        // Upcoming Events List
        $upcomingEvents = Event::with('package')
            ->where('event_date', '>=', $now->toDateString())
            ->orderBy('event_date')
            ->limit(3)
            ->get()
            ->map(function ($event) {
                $basePax = $event->package ? $event->package->cups_count : 0;
                $totalPax = $basePax + $event->extra_guests;
                $totalPrice = $event->package ? $event->package->price + ($event->extra_guests * 50) : 0;

                return [
                    'id' => $event->id,
                    'name' => $event->customer_name,
                    'date' => Carbon::parse($event->event_date)->format('F j, Y') . ' at ' . Carbon::parse($event->event_time)->format('g:i A'),
                    'details' => $totalPax . ' pax (₱' . number_format($totalPrice) . ')',
                    'status' => $event->payment_status,
                ];
            });

        return Inertia::render('admin/Dashboard', [
            'stats' => [
                'todaysSales' => round($todaysSales, 2),
                'salesChange' => $salesChange,
                'lowStockCount' => $lowStockCount,
                'upcomingEventsCount' => $upcomingEventsCount,
                'pendingPayroll' => round($pendingPayroll, 2),
                'activeEmployeesCount' => $activeEmployeesCount,
            ],
            'lowStockItems' => $lowStockItems,
            'upcomingEvents' => $upcomingEvents,
        ]);
    }
}
