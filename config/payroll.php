<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Break Deduction Settings
    |--------------------------------------------------------------------------
    |
    | Employees working longer than the threshold will have break hours
    | automatically deducted from their total worked time.
    |
    */
    'break_deduction_threshold' => 6, // hours
    'break_deduction_hours' => 1.0,   // hours deducted

    /*
    |--------------------------------------------------------------------------
    | Working Hours
    |--------------------------------------------------------------------------
    */
    'standard_work_hours' => 8.0,

    /*
    |--------------------------------------------------------------------------
    | Overtime Settings
    |--------------------------------------------------------------------------
    */
    'overtime_rate_multiplier' => 1.25, // 125% of hourly rate

    /*
    |--------------------------------------------------------------------------
    | Deduction Thresholds
    |--------------------------------------------------------------------------
    |
    | Minimum days worked in a pay period to apply government deductions.
    |
    */
    'minimum_days_for_deductions' => 14,
];
