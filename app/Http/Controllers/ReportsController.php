<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Event;
use App\Models\InventoryItem;
use App\Models\StockLog;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportsController extends Controller
{
    /**
     * Parse the Y-m string into a valid Carbon instance.
     * Falls back to the current month if invalid.
     */
    private function parseMonthSafe(&$month)
    {
        try {
            return Carbon::createFromFormat('Y-m', $month);
        } catch (\Exception $e) {
            $month = now()->format('Y-m');
            return Carbon::createFromFormat('Y-m', $month);
        }
    }

    // ─── SALES ──────────────────────────────────────────────────────────

    /**
     * Display the Sales Reports page.
     */
    public function index(Request $request)
    {
        $month = $request->input('month', now()->format('Y-m'));
        $locationFilter = $request->input('location', '');

        $parsedDate = $this->parseMonthSafe($month);
        $startOfMonth = $parsedDate->copy()->startOfMonth();
        $endOfMonth = $parsedDate->copy()->endOfMonth();

        $lastMonthStart = $startOfMonth->copy()->subMonth()->startOfMonth();
        $lastMonthEnd = $startOfMonth->copy()->subMonth()->endOfMonth();

        // Location filter helper: returns a closure for filtering orders by employee location
        $locationScope = function ($query) use ($locationFilter) {
            if ($locationFilter) {
                $query->whereHas('createdBy.employee.location', function ($q) use ($locationFilter) {
                    $q->where('name', $locationFilter);
                });
            }
        };

        // Monthly revenue
        $monthlyRevenue = Order::where('status', 'completed')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->tap($locationScope)
            ->sum('total');

        // Last month revenue
        $lastMonthRevenue = Order::where('status', 'completed')
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->tap($locationScope)
            ->sum('total');

        $revenueChange = $lastMonthRevenue > 0
            ? round((($monthlyRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : 0;

        // Orders count
        $totalOrders = Order::where('status', 'completed')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->tap($locationScope)
            ->count();

        $lastMonthOrders = Order::where('status', 'completed')
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->tap($locationScope)
            ->count();

        $ordersChange = $lastMonthOrders > 0
            ? round((($totalOrders - $lastMonthOrders) / $lastMonthOrders) * 100, 1)
            : 0;

        // Peak hour
        $peakHourQuery = Order::where('status', 'completed')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->tap($locationScope);

        $peakHourData = $peakHourQuery
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
                ->tap($locationScope)
                ->sum('total');

            $weeklyRevenue[] = [
                'label' => "Week $week",
                'value' => round($revenue, 2),
            ];
        }

        // Best selling products
        $bestSelling = OrderItem::select('product_id', DB::raw('SUM(quantity) as total_sold'))
            ->whereHas('order', function ($query) use ($startOfMonth, $endOfMonth, $locationScope) {
                $query->where('status', 'completed')
                    ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                    ->tap($locationScope);
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
            $bestSelling = collect([['name' => 'No sales yet', 'value' => 0]]);
        }

        // Recent orders — paginated, full month, with employee
        $recentOrders = Order::with(['items.product', 'createdBy.employee.location'])
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->tap($locationScope)
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString()
            ->through(function ($order) {
                return [
                    'order_number' => $order->order_number,
                    'date' => $order->created_at->format('M d, Y h:i A'),
                    'items_count' => $order->items->count(),
                    'total' => (float) $order->total,
                    'payment_method' => $order->payment_method,
                    'location' => $order->createdBy?->employee?->location?->name ?? 'N/A',
                    'employee' => $order->createdBy?->employee?->name ?? $order->createdBy?->name ?? 'N/A',
                ];
            });

        // Locations for dropdown
        $locations = Location::where('status', 'Active')->pluck('name');

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
            'locations' => $locations,
            'filters' => [
                'month' => $month,
                'location' => $locationFilter,
            ],
        ]);
    }

    /**
     * Export sales data as CSV.
     */
    public function exportSalesCsv(Request $request): StreamedResponse
    {
        $month = $request->input('month', now()->format('Y-m'));
        $locationFilter = $request->input('location', '');

        $parsedDate = $this->parseMonthSafe($month);
        $startOfMonth = $parsedDate->copy()->startOfMonth();
        $endOfMonth = $parsedDate->copy()->endOfMonth();

        $query = Order::with(['items.product', 'createdBy.employee.location'])
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->orderByDesc('created_at');

        if ($locationFilter) {
            $query->whereHas('createdBy.employee.location', function ($q) use ($locationFilter) {
                $q->where('name', $locationFilter);
            });
        }

        $filename = "sales-report-{$month}.csv";

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Order Number', 'Date', 'Items', 'Total', 'Payment Method', 'Location', 'Employee']);

            $query->chunk(200, function ($orders) use ($handle) {
                foreach ($orders as $order) {
                    fputcsv($handle, [
                        $order->order_number,
                        $order->created_at->format('M d, Y h:i A'),
                        $order->items->count(),
                        $order->total,
                        $order->payment_method,
                        $order->createdBy?->employee?->location?->name ?? 'N/A',
                        $order->createdBy?->employee?->name ?? $order->createdBy?->name ?? 'N/A',
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    // ─── INVENTORY ──────────────────────────────────────────────────────

    /**
     * Display the Inventory Reports page.
     */
    public function inventory(Request $request)
    {
        $locationFilter = $request->input('location', '');
        $typeFilter = $request->input('type', '');

        $totalItems = InventoryItem::count();
        $lowStockCount = InventoryItem::where('status', 'Low Stock')->count();
        $outOfStockCount = InventoryItem::where('status', 'Out of Stock')->count();
        $totalValue = InventoryItem::sum(DB::raw('stock * cost_per_unit'));

        // Stock logs with filters
        $stockLogsQuery = StockLog::with(['inventoryItem', 'user.employee', 'location'])
            ->latest('logged_at');

        if ($locationFilter) {
            $stockLogsQuery->whereHas('location', function ($q) use ($locationFilter) {
                $q->where('name', $locationFilter);
            });
        }

        if ($typeFilter) {
            $stockLogsQuery->where('type', $typeFilter);
        }

        $stockLogs = $stockLogsQuery
            ->paginate(10, ['*'], 'logs_page')
            ->withQueryString()
            ->through(function ($log) {
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

        $lowStockQuery = InventoryItem::with('location')
            ->whereIn('status', ['Low Stock', 'Out of Stock'])
            ->orderBy('stock');

        if ($locationFilter) {
            $lowStockQuery->whereHas('location', function ($q) use ($locationFilter) {
                $q->where('name', $locationFilter);
            });
        }

        $lowStockItems = $lowStockQuery
            ->paginate(10, ['*'], 'alerts_page')
            ->withQueryString()
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

        // Locations for dropdown
        $locations = Location::where('status', 'Active')->pluck('name');

        return Inertia::render('admin/reports/InventoryReports', [
            'stats' => [
                'totalItems' => $totalItems,
                'lowStockCount' => $lowStockCount,
                'outOfStockCount' => $outOfStockCount,
                'totalValue' => $totalValue,
            ],
            'stockLogs' => $stockLogs,
            'lowStockItems' => $lowStockItems,
            'locations' => $locations,
            'filters' => [
                'location' => $locationFilter,
                'type' => $typeFilter,
            ],
        ]);
    }

    /**
     * Export inventory stock logs as CSV.
     */
    public function exportInventoryCsv(Request $request): StreamedResponse
    {
        $locationFilter = $request->input('location', '');
        $typeFilter = $request->input('type', '');

        $query = StockLog::with(['inventoryItem', 'user.employee', 'location'])
            ->latest('logged_at');

        if ($locationFilter) {
            $query->whereHas('location', function ($q) use ($locationFilter) {
                $q->where('name', $locationFilter);
            });
        }

        if ($typeFilter) {
            $query->where('type', $typeFilter);
        }

        $filename = 'stock-logs-' . now()->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Date', 'Time', 'Item', 'Location', 'Action', 'Quantity', 'Notes', 'Adjusted By']);

            $query->chunk(200, function ($logs) use ($handle) {
                foreach ($logs as $log) {
                    $userName = 'System';
                    if ($log->user) {
                        $userName = $log->user->employee?->name ?? $log->user->name;
                    }
                    fputcsv($handle, [
                        $log->logged_at->format('M d, Y'),
                        $log->logged_at->format('h:i A'),
                        $log->inventoryItem->name ?? 'Unknown',
                        $log->location->name ?? 'Unknown',
                        $log->type,
                        $log->quantity,
                        $log->notes ?? '',
                        $userName,
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    // ─── EVENTS ─────────────────────────────────────────────────────────

    /**
     * Display the Events Reports page.
     */
    public function events(Request $request)
    {
        $now = Carbon::now();
        $month = $request->input('month', $now->format('Y-m'));
        $statusFilter = $request->input('status', '');

        $parsedDate = $this->parseMonthSafe($month);
        $startOfMonth = $parsedDate->copy()->startOfMonth();
        $endOfMonth = $parsedDate->copy()->endOfMonth();

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

        // Filtered events list — paginated
        $eventsQuery = Event::with(['package', 'payments'])
            ->whereBetween('event_date', [$startOfMonth, $endOfMonth])
            ->orderBy('event_date');

        $eventsData = $eventsQuery->paginate(5)->withQueryString();

        if ($statusFilter) {
            $filtered = collect($eventsData->items())->filter(function ($event) use ($statusFilter) {
                return strtolower($event->payment_status) === strtolower($statusFilter);
            })->values();
            $eventsData->setCollection($filtered);
        }

        $eventsList = $eventsData
            ->through(function ($event) {
                return [
                    'id' => $event->id,
                    'name' => $event->customer_name,
                    'package' => $event->package->name ?? 'Custom',
                    'date' => $event->event_date->format('M d, Y'),
                    'time' => Carbon::parse($event->event_time)->format('g:i A'),
                    'attendees' => ($event->package ? $event->package->cups_count : 0) + $event->extra_guests,
                    'status' => $event->payment_status,
                    'address' => $event->address,
                    'total_price' => (float) $event->total_price,
                    'total_paid' => (float) $event->total_paid,
                ];
            });

        // Monthly events chart (last 6 months)
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
            'eventsList' => $eventsList,
            'monthlyEvents' => $monthlyEvents,
            'filters' => [
                'month' => $month,
                'status' => $statusFilter,
            ],
        ]);
    }

    /**
     * Export events data as CSV.
     */
    public function exportEventsCsv(Request $request): StreamedResponse
    {
        $month = $request->input('month', now()->format('Y-m'));
        $statusFilter = $request->input('status', '');

        $parsedDate = $this->parseMonthSafe($month);
        $startOfMonth = $parsedDate->copy()->startOfMonth();
        $endOfMonth = $parsedDate->copy()->endOfMonth();

        $query = Event::with(['package', 'payments'])
            ->whereBetween('event_date', [$startOfMonth, $endOfMonth])
            ->orderBy('event_date');

        $filename = "events-report-{$month}.csv";

        return response()->streamDownload(function () use ($query, $statusFilter) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Customer Name', 'Package', 'Date', 'Time', 'Attendees', 'Address', 'Total Price', 'Total Paid', 'Payment Status']);

            $query->chunk(200, function ($events) use ($handle, $statusFilter) {
                foreach ($events as $event) {
                    $paymentStatus = $event->payment_status;

                    // Filter by status if provided
                    if ($statusFilter && strtoupper($statusFilter) !== strtoupper($paymentStatus)) {
                        continue;
                    }

                    fputcsv($handle, [
                        $event->customer_name,
                        $event->package->name ?? 'Custom',
                        $event->event_date->format('M d, Y'),
                        Carbon::parse($event->event_time)->format('g:i A'),
                        ($event->package ? $event->package->cups_count : 0) + $event->extra_guests,
                        $event->address,
                        $event->total_price,
                        $event->total_paid,
                        $paymentStatus,
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    // ─── PAYROLL ────────────────────────────────────────────────────────

    /**
     * Display the Payroll Reports page.
     */
    public function payroll(Request $request)
    {
        $now = Carbon::now();
        $month = $request->input('month', $now->format('Y-m'));
        $statusFilter = $request->input('status', '');

        $startOfYear = $now->copy()->startOfYear();
        $parsedDate = $this->parseMonthSafe($month);
        $selectedStart = $parsedDate->copy()->startOfMonth();
        $selectedEnd = $parsedDate->copy()->endOfMonth();

        // 1. Total Payroll (Year to Date)
        $totalPayrollYTD = DB::table('payrolls')
            ->whereBetween('start_date', [$startOfYear, $now])
            ->sum('total_amount');

        // 2. Average Net Pay (Last 6 Months)
        $sixMonthsAgo = $now->copy()->subMonths(6);
        $averageNetPay = DB::table('payslips')
            ->join('payrolls', 'payslips.payroll_id', '=', 'payrolls.id')
            ->where('payrolls.start_date', '>=', $sixMonthsAgo)
            ->avg('payslips.net_pay');

        // 3. Total Deductions (Year to Date)
        $totalDeductionsYTD = DB::table('payslips')
            ->join('payrolls', 'payslips.payroll_id', '=', 'payrolls.id')
            ->whereBetween('payrolls.start_date', [$startOfYear, $now])
            ->selectRaw('SUM(gross_pay - net_pay) as total_deductions')
            ->value('total_deductions');

        // 4. Pending Payrolls
        $pendingPayrolls = DB::table('payrolls')
            ->whereIn('status', ['Pending', 'draft', 'Draft'])
            ->count();

        // 5. Total Non-Admin Employees
        $totalNonAdminEmployees = User::where('is_admin', false)->count();

        // 6. Total Hours Worked (YTD)
        $totalHoursWorked = DB::table('payslips')
            ->join('payrolls', 'payslips.payroll_id', '=', 'payrolls.id')
            ->whereBetween('payrolls.start_date', [$startOfYear, $now])
            ->sum('payslips.hours_worked');

        // 7. Monthly Payroll Cost (Last 6 Months)
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

        // 8. Payrolls — filtered by selected month + status, paginated
        $payrollsQuery = DB::table('payrolls')
            ->whereBetween('start_date', [$selectedStart, $selectedEnd])
            ->orderBy('created_at', 'desc');

        if ($statusFilter) {
            $payrollsQuery->whereRaw('LOWER(status) = ?', [strtolower($statusFilter)]);
        }

        $recentPayrollsData = $payrollsQuery->paginate(10);

        $payrollIds = collect($recentPayrollsData->items())->pluck('id');

        $payslipsData = DB::table('payslips')
            ->join('users', 'payslips.user_id', '=', 'users.id')
            ->whereIn('payroll_id', $payrollIds)
            ->select(
                'payslips.id',
                'payslips.payroll_id',
                'payslips.gross_pay',
                'payslips.net_pay',
                'payslips.hours_worked',
                'payslips.deductions',
                'users.name as employee_name'
            )
            ->get();

        $recentPayrolls = collect($recentPayrollsData->items())->map(function ($payroll) use ($payslipsData) {
            $payrollPayslips = $payslipsData->where('payroll_id', $payroll->id)->values();

            $payrollPayslips->each(function ($slip) {
                $slip->parsed_deductions = is_string($slip->deductions) ? json_decode($slip->deductions, true) : ($slip->deductions ?? []);
            });

            return [
                'id' => $payroll->id,
                'reference' => 'PAY-' . str_pad($payroll->id, 5, '0', STR_PAD_LEFT),
                'period' => Carbon::parse($payroll->start_date)->format('M d') . ' - ' . Carbon::parse($payroll->end_date)->format('M d, Y'),
                'employees' => $payrollPayslips->count(),
                'amount' => $payroll->total_amount,
                'status' => $payroll->status,
                'date' => $payroll->payment_date ? Carbon::parse($payroll->payment_date)->format('M d, Y') : 'N/A',
                'individual_payslips' => $payrollPayslips->map(function ($slip) {
                    return [
                        'id' => $slip->id,
                        'employee_name' => $slip->employee_name,
                        'hours_worked' => $slip->hours_worked,
                        'gross_pay' => $slip->gross_pay,
                        'net_pay' => $slip->net_pay,
                        'sss' => (float) ($slip->parsed_deductions['sss'] ?? 0),
                        'philhealth' => (float) ($slip->parsed_deductions['philhealth'] ?? 0),
                        'pagibig' => (float) ($slip->parsed_deductions['pagibig'] ?? 0),
                        'tax' => (float) ($slip->parsed_deductions['tax'] ?? 0),
                    ];
                }),
                'is_bulk' => $payrollPayslips->count() > 1,
                'gross_pay' => $payrollPayslips->sum('gross_pay'),
                'net_pay' => $payrollPayslips->sum('net_pay'),
                'total_hours' => $payrollPayslips->sum('hours_worked'),
                'employee_name' => $payrollPayslips->count() === 1 ? $payrollPayslips->first()->employee_name : 'Bulk Payroll (' . $payrollPayslips->count() . ' Employees)',
                'sss_deduction' => $payrollPayslips->sum(function ($slip) {
                    return (float) ($slip->parsed_deductions['sss'] ?? 0);
                }),
                'philhealth_deduction' => $payrollPayslips->sum(function ($slip) {
                    return (float) ($slip->parsed_deductions['philhealth'] ?? 0);
                }),
                'pagibig_deduction' => $payrollPayslips->sum(function ($slip) {
                    return (float) ($slip->parsed_deductions['pagibig'] ?? 0);
                }),
                'tax_deduction' => $payrollPayslips->sum(function ($slip) {
                    return (float) ($slip->parsed_deductions['tax'] ?? 0);
                }),
            ];
        });

        // Transform paginator to include our mapped data
        $recentPayrollsPaginated = new \Illuminate\Pagination\LengthAwarePaginator(
            $recentPayrolls,
            $recentPayrollsData->total(),
            $recentPayrollsData->perPage(),
            $recentPayrollsData->currentPage(),
            ['path' => request()->url(), 'query' => request()->query()]
        );

        return Inertia::render('admin/reports/PayrollReports', [
            'stats' => [
                'totalPayrollYTD' => (float) ($totalPayrollYTD ?? 0),
                'averageNetPay' => (float) ($averageNetPay ?? 0),
                'totalDeductionsYTD' => (float) ($totalDeductionsYTD ?? 0),
                'pendingPayrolls' => $pendingPayrolls,
                'totalNonAdminEmployees' => $totalNonAdminEmployees,
                'totalHoursWorked' => (float) ($totalHoursWorked ?? 0),
            ],
            'monthlyPayrollCost' => $monthlyPayrollCost,
            'recentPayrolls' => $recentPayrollsPaginated,
            'filters' => [
                'month' => $month,
                'status' => $statusFilter,
            ],
        ]);
    }

    /**
     * Export payroll data as CSV.
     */
    public function exportPayrollCsv(Request $request): StreamedResponse
    {
        $month = $request->input('month', now()->format('Y-m'));
        $statusFilter = $request->input('status', '');

        $selectedStart = Carbon::parse($month)->startOfMonth();
        $selectedEnd = Carbon::parse($month)->endOfMonth();

        $payrollsQuery = DB::table('payrolls')
            ->whereBetween('start_date', [$selectedStart, $selectedEnd])
            ->orderBy('created_at', 'desc');

        if ($statusFilter) {
            $payrollsQuery->whereRaw('LOWER(status) = ?', [strtolower($statusFilter)]);
        }

        $filename = "payroll-report-{$month}.csv";

        return response()->streamDownload(function () use ($payrollsQuery) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Reference', 'Period', 'Employee', 'Hours Worked', 'Gross Pay', 'Net Pay', 'SSS', 'PhilHealth', 'Pag-IBIG', 'Tax', 'Status', 'Payment Date']);

            $payrollsQuery->chunk(100, function ($payrolls) use ($handle) {
                $payrollIds = $payrolls->pluck('id');

                $payslips = DB::table('payslips')
                    ->join('users', 'payslips.user_id', '=', 'users.id')
                    ->whereIn('payroll_id', $payrollIds)
                    ->select('payslips.*', 'users.name as employee_name')
                    ->get();

                foreach ($payrolls as $payroll) {
                    $slips = $payslips->where('payroll_id', $payroll->id);
                    $reference = 'PAY-' . str_pad($payroll->id, 5, '0', STR_PAD_LEFT);
                    $period = Carbon::parse($payroll->start_date)->format('M d') . ' - ' . Carbon::parse($payroll->end_date)->format('M d, Y');
                    $paymentDate = $payroll->payment_date ? Carbon::parse($payroll->payment_date)->format('M d, Y') : 'N/A';

                    foreach ($slips as $slip) {
                        $deductions = is_string($slip->deductions) ? json_decode($slip->deductions, true) : ($slip->deductions ?? []);
                        fputcsv($handle, [
                            $reference,
                            $period,
                            $slip->employee_name,
                            $slip->hours_worked,
                            $slip->gross_pay,
                            $slip->net_pay,
                            $deductions['sss'] ?? 0,
                            $deductions['philhealth'] ?? 0,
                            $deductions['pagibig'] ?? 0,
                            $deductions['tax'] ?? 0,
                            $payroll->status,
                            $paymentDate,
                        ]);
                    }
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }
}
