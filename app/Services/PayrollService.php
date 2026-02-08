<?php

namespace App\Services;

use App\Models\AttendanceRecord;
use App\Models\Payroll;
use App\Models\Payslip;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PayrollService
{
    public function generatePayroll($startDate, $endDate, $userId = null)
    {
        return DB::transaction(function () use ($startDate, $endDate, $userId) {
            $existingQuery = Payslip::whereHas('payroll', function ($query) use ($startDate, $endDate) {
                $query->where(function ($q) use ($startDate, $endDate) {
                    $q->where('start_date', '<=', $endDate)
                        ->where('end_date', '>=', $startDate);
                });
            });

            if ($userId && $userId !== 'all') {
                $existingQuery->where('user_id', $userId);
                $existingPayslips = $existingQuery->exists();

                if ($existingPayslips) {
                    throw new \Exception('A payroll already exists for this employee within the selected date range.');
                }
            } else {
                $existingPayslips = $existingQuery->first();

                if ($existingPayslips) {
                    $employeeName = optional($existingPayslips->user)->name ?? 'An employee';
                    throw new \Exception("{$employeeName} already has a payroll within the selected date range.");
                }
            }

            $payroll = Payroll::create([
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => 'draft',
            ]);

            $totalPayrollAmount = 0;

            $query = User::with('employee')->whereHas('employee');

            if ($userId && $userId !== 'all') {
                $query->where('id', $userId);
            }

            $users = $query->get();

            foreach ($users as $user) {
                $calc = $this->calculateForUser($user, $startDate, $endDate);

                if (!$calc)
                    continue;

                Payslip::create([
                    'payroll_id' => $payroll->id,
                    'user_id' => $user->id,
                    'gross_pay' => $calc['gross_pay'],
                    'net_pay' => $calc['net_pay'],
                    'hours_worked' => $calc['total_hours'],
                    'deductions' => $calc['deductions'],
                ]);

                $totalPayrollAmount += $calc['net_pay'];
            }

            $payroll->update(['total_amount' => $totalPayrollAmount]);

            return $payroll;
        });
    }

    public function calculateForUser($user, $startDate, $endDate)
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        $attendance = AttendanceRecord::where('user_id', $user->id)
            ->whereBetween('clock_in', [$start, $end])
            ->where('status', 'approved')
            ->get();

        $totalHours = $attendance->sum('total_hours');
        $overtimeHours = $attendance->sum('overtime_hours');
        $regularHours = max(0, $totalHours - $overtimeHours);
        $daysWorked = $attendance->count();

        if ($totalHours <= 0)
            return null;

        $profile = $user->employee;
        if (!$profile)
            return null;

        $regularPay = $regularHours * $profile->hourly_rate;
        $overtimeRateMultiplier = 1.25;
        $overtimePay = $overtimeHours * $profile->hourly_rate * $overtimeRateMultiplier;
        $grossPay = $regularPay + $overtimePay;

        $monthlyDeductions = $this->calculateDeductions($grossPay, $profile->basic_salary);

        $finalDeductions = [];
        $totalDeductions = 0;

        if ($daysWorked >= 14) {
            foreach ($monthlyDeductions as $key => $amount) {
                $halfAmount = round($amount / 2, 2);
                $finalDeductions[$key] = $halfAmount;
                $totalDeductions += $halfAmount;
            }
        } else {
            foreach ($monthlyDeductions as $key => $amount) {
                $finalDeductions[$key] = 0;
            }
            $totalDeductions = 0;
        }

        $netPay = max(0, $grossPay - $totalDeductions);

        return [
            'days_worked' => $daysWorked,
            'total_hours' => $totalHours,
            'regular_hours' => $regularHours,
            'overtime_hours' => $overtimeHours,
            'hourly_rate' => $profile->hourly_rate,
            'gross_pay' => $grossPay,
            'regular_pay' => $regularPay,
            'overtime_pay' => $overtimePay,
            'deductions' => $finalDeductions,
            'total_deductions' => $totalDeductions,
            'net_pay' => $netPay,
        ];
    }

    private function calculateDeductions($grossPay, $monthlyBasicSalary)
    {
        $msc = min($monthlyBasicSalary, 30000);
        $sss = $msc * 0.045;

        $phBase = max(10000, min($monthlyBasicSalary, 100000));
        $philhealth = $phBase * 0.05 / 2;

        $pagibigRate = $monthlyBasicSalary <= 1500 ? 0.01 : 0.02;
        $pagibig = min($monthlyBasicSalary * $pagibigRate, 200);

        $tax = 0;

        return [
            'sss' => round($sss, 2),
            'philhealth' => round($philhealth, 2),
            'pagibig' => round($pagibig, 2),
            'tax' => round($tax, 2),
        ];
    }
}