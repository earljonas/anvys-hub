<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payslip extends Model
{
    use HasFactory;

    protected $fillable = [
        'payroll_id',
        'user_id',
        'gross_pay',
        'net_pay',
        'hours_worked',
        'deductions',
    ];

    protected $casts = [
        'gross_pay' => 'decimal:2',
        'net_pay' => 'decimal:2',
        'hours_worked' => 'decimal:2',
        'deductions' => 'array',
    ];

    public function payroll(): BelongsTo
    {
        return $this->belongsTo(Payroll::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}