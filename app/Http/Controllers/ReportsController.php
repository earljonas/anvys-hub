<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
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
        $recentOrders = Order::with(['items.product', 'createdBy.employee.location'])
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
                    'location' => $order->createdBy?->employee?->location?->name ?? 'N/A',
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
            ->paginate(10, ['*'], 'logs_page')
            ->through(function ($log) {
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
            ->paginate(10, ['*'], 'alerts_page')
            ->through(function ($item) {
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

    /**
     * Display the Payroll Reports page.
     */
    public function payroll()
    {
        $now = Carbon::now();
        $startOfYear = $now->copy()->startOfYear();

        // 1. Total Payroll (Year to Date)
        $totalPayrollYTD = DB::table('payrolls') // Assuming 'payrolls' table exists
            ->whereBetween('start_date', [$startOfYear, $now])
            ->sum('total_amount');

        // 2. Average Net Pay (Last 6 Months) - Approximated from recent payrolls
        // Let's try average employee net pay from payslips over the last 6 months.
        $sixMonthsAgo = $now->copy()->subMonths(6);
        $averageNetPay = DB::table('payslips')
            ->join('payrolls', 'payslips.payroll_id', '=', 'payrolls.id')
            ->where('payrolls.start_date', '>=', $sixMonthsAgo)
            ->avg('payslips.net_pay');

        // 3. Total Deductions (Year to Date)
        // Assuming deductions are stored in payslips or you have a way to calculate them.
        // If 'deductions' column in payslips is JSON, we might need to sum it up in PHP or use a raw query.
        // For this example, let's assume we can sum 'gross_pay' - 'net_pay' to get deductions
        // OR if you have a specific deductions column.
        $totalDeductionsYTD = DB::table('payslips')
            ->join('payrolls', 'payslips.payroll_id', '=', 'payrolls.id')
            ->whereBetween('payrolls.start_date', [$startOfYear, $now])
            ->selectRaw('SUM(gross_pay - net_pay) as total_deductions')
            ->value('total_deductions');

        // 4. Pending Payrolls
        $pendingPayrolls = DB::table('payrolls')
            ->whereIn('status', ['Pending', 'draft', 'Draft'])
            ->count();

        // 5. Total Employees on Payroll
        $totalEmployeesOnPayroll = User::where('is_admin', false)->count();

        // 6. Total Hours Worked (YTD)
        $totalHoursWorked = DB::table('payslips')
            ->join('payrolls', 'payslips.payroll_id', '=', 'payrolls.id')
            ->whereBetween('payrolls.start_date', [$startOfYear, $now])
            ->sum('payslips.hours_worked');

        // 7. Monthly Payroll Cost (Last 6 Months) - based on start_date for better visibility
        $monthlyPayrollCost = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = $now->copy()->subMonths($i)->startOfMonth();
            $monthEnd = $now->copy()->subMonths($i)->endOfMonth();

            $cost = DB::table('payrolls')
                ->whereBetween('end_date', [$monthStart, $monthEnd])
                ->sum('total_amount');

            $monthlyPayrollCost[] = [
                'month' => $monthStart->format('M'),
                'cost' => (float) $cost,
            ];
        }

        // 6. Recent Payroll History
        $recentPayrollsData = DB::table('payrolls')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $payrollIds = $recentPayrollsData->pluck('id');

        $payslipCounts = DB::table('payslips')
            ->whereIn('payroll_id', $payrollIds)
            ->select('payroll_id', DB::raw('count(*) as count'))
            ->groupBy('payroll_id')
            ->pluck('count', 'payroll_id');

        $recentPayrolls = $recentPayrollsData->map(function ($payroll) use ($payslipCounts) {
            return [
                'id' => $payroll->id,
                'reference' => 'PAY-' . str_pad($payroll->id, 5, '0', STR_PAD_LEFT),
                'period' => Carbon::parse($payroll->start_date)->format('M d') . ' - ' . Carbon::parse($payroll->end_date)->format('M d, Y'),
                'employees' => $payslipCounts[$payroll->id] ?? 0,
                'amount' => $payroll->total_amount,
                'status' => $payroll->status,
                'date' => $payroll->payment_date ? Carbon::parse($payroll->payment_date)->format('M d, Y') : 'N/A',
            ];
        });

        return Inertia::render('admin/reports/PayrollReports', [
            'stats' => [
                'totalPayrollYTD' => (float) ($totalPayrollYTD ?? 0),
                'averageNetPay' => (float) ($averageNetPay ?? 0),
                'totalDeductionsYTD' => (float) ($totalDeductionsYTD ?? 0),
                'pendingPayrolls' => $pendingPayrolls,
                'totalEmployeesOnPayroll' => $totalEmployeesOnPayroll,
                'totalHoursWorked' => (float) ($totalHoursWorked ?? 0),
            ],
            'monthlyPayrollCost' => $monthlyPayrollCost,
            'recentPayrolls' => $recentPayrolls,
        ]);
    }
}
