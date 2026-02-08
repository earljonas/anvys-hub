<?php

namespace App\Services;

use Carbon\Carbon;

class AttendanceService
{
    /**
     * Calculate hours worked, applying break deduction and overtime rules.
     *
     * @param Carbon $clockIn
     * @param Carbon $clockOut
     * @return array{total_hours: float, regular_hours: float, overtime_hours: float}
     */
    public function calculateHoursWorked(Carbon $clockIn, Carbon $clockOut): array
    {
        $minutesWorked = $clockIn->diffInMinutes($clockOut);
        $elapsedHours = $minutesWorked / 60;

        // Apply break deduction (1 hour if worked >= 6 hours)
        $breakDeduction = config('payroll.break_deduction_threshold', 6);
        $breakHours = config('payroll.break_deduction_hours', 1.0);
        $deduction = ($elapsedHours >= $breakDeduction) ? $breakHours : 0.0;

        // Calculate net hours after break
        $netHours = max(0, $elapsedHours - $deduction);

        // Standard work day for overtime calculation
        $standardWorkDay = config('payroll.standard_work_hours', 8.0);
        $regularHours = min($netHours, $standardWorkDay);
        $overtimeHours = max(0, $netHours - $standardWorkDay);

        return [
            'total_hours' => round($netHours, 2),
            'regular_hours' => round($regularHours, 2),
            'overtime_hours' => round($overtimeHours, 2),
        ];
    }
}
