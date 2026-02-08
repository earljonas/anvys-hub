<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payroll;
use App\Models\Payslip;
use App\Services\PayrollService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayrollController extends Controller
{
    protected $payrollService;

    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }

    public function index(Request $request)
    {
        $query = Payroll::with(['payslips.user'])
            ->orderBy('created_at', 'desc');

        if ($request->search) {
            $search = strtolower($request->search);
            $query->whereHas('payslips.user', function ($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"]);
            });
        }

        if ($request->date) {
            $query->whereDate('start_date', $request->date);
        }

        $payrolls = $query->paginate(5)
            ->withQueryString()
            ->through(function ($payroll) {
                $payslips = $payroll->payslips;

                $gross_total = $payslips->sum('gross_pay');
                $net_total = $payslips->sum('net_pay');
                $total_hours = $payslips->sum('hours_worked');

                $deductions_total = 0;
                $sss_total = 0;
                $pagibig_total = 0;
                $philhealth_total = 0;
                $tax_total = 0;

                foreach ($payslips as $slip) {
                    $slipDeductions = is_array($slip->deductions) ? $slip->deductions : [];
                    $deductions_total += array_sum($slipDeductions);
                    $sss_total += $slipDeductions['sss'] ?? 0;
                    $pagibig_total += $slipDeductions['pagibig'] ?? 0;
                    $philhealth_total += $slipDeductions['philhealth'] ?? 0;
                    $tax_total += $slipDeductions['tax'] ?? 0;
                }

                if ($payslips->count() === 1) {
                    $employee_name = optional($payslips->first()->user)->name ?? 'Unknown Employee';
                } else {
                    $employee_name = $payslips->count() > 0 ? 'Bulk Payroll (' . $payslips->count() . ' Employees)' : 'Empty Payroll';
                }

                return [
                    'id' => $payroll->id,
                    'start_date' => $payroll->start_date,
                    'end_date' => $payroll->end_date,
                    'employee_name' => $employee_name,
                    'gross_pay' => (float) $gross_total,
                    'net_pay' => (float) $net_total,
                    'deductions' => (float) $deductions_total,
                    'sss_deduction' => (float) $sss_total,
                    'pagibig_deduction' => (float) $pagibig_total,
                    'philhealth_deduction' => (float) $philhealth_total,
                    'tax_deduction' => (float) $tax_total,
                    'total_hours' => (float) $total_hours,
                    'status' => $payroll->status,
                    'payment_date' => $payroll->payment_date,
                ];
            });

        return Inertia::render('admin/employee/Payroll', [
            'payrolls' => $payrolls,
            'employees' => \App\Models\User::where('is_admin', false)
                ->with('employee')
                ->get()
                ->map(function ($user) {
                    $hourlyRate = $user->employee->hourly_rate ?? 0;
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'rate_per_day' => $hourlyRate * 8,
                        'employee_profile' => $user->employee ? [
                            'tin_number' => $user->employee->tin_number,
                            'sss_number' => $user->employee->sss_number,
                            'philhealth_number' => $user->employee->philhealth_number,
                            'pagibig_number' => $user->employee->pagibig_number,
                        ] : null,
                    ];
                }),
            'filters' => $request->only(['search', 'date']),
        ]);
    }

    public function calculate(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $user = \App\Models\User::with('employee')->findOrFail($request->user_id);

        $calculation = $this->payrollService->calculateForUser(
            $user,
            $request->start_date,
            $request->end_date
        );

        if (!$calculation) {
            return response()->json(['error' => 'No approved attendance records found for this period.'], 422);
        }

        return response()->json($calculation);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        try {
            $payroll = $this->payrollService->generatePayroll(
                $request->start_date,
                $request->end_date,
                $request->user_id
            );

            return back()->with('success', 'Payroll generated successfully with ' . $payroll->payslips()->count() . ' payslips.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to generate payroll: ' . $e->getMessage()]);
        }
    }

    public function show($id)
    {
        $payroll = Payroll::with(['payslips.user.employee'])->findOrFail($id);

        return Inertia::render('admin/PayrollDetails', [
            'payroll' => $payroll
        ]);
    }

    public function markAsPaid($id)
    {
        $payroll = Payroll::findOrFail($id);
        $payroll->update(['status' => 'paid', 'payment_date' => now()]);

        return back()->with('success', 'Payroll marked as PAID.');
    }
}