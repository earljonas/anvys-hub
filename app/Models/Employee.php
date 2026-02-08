<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes; // Recommended to match User soft deletes

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'employee_id',
        'hourly_rate',
        'basic_salary',
        'tin_number',
        'sss_number',
        'philhealth_number',
        'pagibig_number',
        'bank_details',
        'employment_type',
        'location_id',
        'job_title',
        'department',
    ];

    protected $casts = [
        'hourly_rate' => 'decimal:2',
        'basic_salary' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }
}