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

            $userIdsWithExistingPayslips = [];

            if ($userId && $userId !== 'all') {
                $existingQuery->where('user_id', $userId);
                $existingPayslips = $existingQuery->exists();

                if ($existingPayslips) {
                    throw new \Exception('A payroll already exists for this employee within the selected date range.');
                }
            } else {
                // Bulk Generation: Get IDs of users who already have a payslip in this range
                $userIdsWithExistingPayslips = $existingQuery->pluck('user_id')->toArray();
            }

            $query = User::with('employee')->whereHas('employee');

            if ($userId && $userId !== 'all') {
                $query->where('id', $userId);
            } elseif (!empty($userIdsWithExistingPayslips)) {
                // Exclude users who already have payslips
                $query->whereNotIn('id', $userIdsWithExistingPayslips);
            }

            $users = $query->get();

            // Check if there are any eligible users left to process
            if ($users->isEmpty()) {
                if ($userId && $userId !== 'all') {
                     // This condition shouldn't be reached due to the check above, but as a fallback:
                     throw new \Exception('A payroll already exists for this employee within the selected date range.');
                }
                throw new \Exception('All eligible employees already have a payroll within the selected date range.');
            }

             $payroll = Payroll::create([
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => 'draft',
            ]);

            $totalPayrollAmount = 0;

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

    public function calculateBulkPreview($startDate, $endDate)
    {
        $existingQuery = Payslip::whereHas('payroll', function ($query) use ($startDate, $endDate) {
            $query->where(function ($q) use ($startDate, $endDate) {
                $q->where('start_date', '<=', $endDate)
                    ->where('end_date', '>=', $startDate);
            });
        });

        $userIdsWithExistingPayslips = $existingQuery->pluck('user_id')->toArray();

        $query = User::with('employee')->whereHas('employee');

        if (!empty($userIdsWithExistingPayslips)) {
            $query->whereNotIn('id', $userIdsWithExistingPayslips);
        }

        $users = $query->get();

        if ($users->isEmpty()) {
            return null;
        }

        $totalDaysWorked = 0;
        $totalHours = 0;
        $totalRegularHours = 0;
        $totalOvertimeHours = 0;
        $totalGrossPay = 0;
        $totalRegularPay = 0;
        $totalOvertimePay = 0;
        $totalNetPay = 0;
        $totalDeductionsArr = ['sss' => 0, 'philhealth' => 0, 'pagibig' => 0, 'tax' => 0];
        $totalDeductionsAmount = 0;

        $processedUsers = 0;
        $processedEmployeeNames = [];

        foreach ($users as $user) {
            $calc = $this->calculateForUser($user, $startDate, $endDate);
            if (!$calc) continue;

            $processedUsers++;
            $processedEmployeeNames[] = $user->name;
            $totalDaysWorked += $calc['days_worked'];
            $totalHours += $calc['total_hours'];
            $totalRegularHours += $calc['regular_hours'];
            $totalOvertimeHours += $calc['overtime_hours'];
            $totalGrossPay += $calc['gross_pay'];
            $totalRegularPay += $calc['regular_pay'];
            $totalOvertimePay += $calc['overtime_pay'];
            $totalNetPay += $calc['net_pay'];
            $totalDeductionsAmount += $calc['total_deductions'];

            foreach ($calc['deductions'] as $key => $amount) {
                if (isset($totalDeductionsArr[$key])) {
                    $totalDeductionsArr[$key] += $amount;
                }
            }
        }

        if ($processedUsers === 0) {
            return null;
        }

        return [
            'is_bulk' => true,
            'employees_processed' => $processedUsers,
            'employee_names' => $processedEmployeeNames,
            'days_worked' => $totalDaysWorked,
            'total_hours' => $totalHours,
            'regular_hours' => $totalRegularHours,
            'overtime_hours' => $totalOvertimeHours,
            'gross_pay' => $totalGrossPay,
            'regular_pay' => $totalRegularPay,
            'overtime_pay' => $totalOvertimePay,
            'deductions' => $totalDeductionsArr,
            'total_deductions' => $totalDeductionsAmount,
            'net_pay' => $totalNetPay,
        ];
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

        $daysWorked = $attendance->pluck('clock_in')
            ->map(function ($date) {
                return Carbon::parse($date)->toDateString();
            })
            ->unique()
            ->count();

        if ($totalHours <= 0)
            return null;

        $profile = $user->employee;
        if (!$profile)
            return null;

        $regularPay = $regularHours * $profile->hourly_rate;
        $overtimeRateMultiplier = config('payroll.overtime_rate_multiplier', 1.25);
        $overtimePay = $overtimeHours * $profile->hourly_rate * $overtimeRateMultiplier;
        $grossPay = $regularPay + $overtimePay;

        $monthlyDeductions = $this->calculateDeductions($profile->basic_salary);

        $finalDeductions = [];
        $totalDeductions = 0;

        if ($daysWorked >= config('payroll.minimum_days_for_deductions', 14)) {
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

    private function calculateDeductions($monthlyBasicSalary)
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