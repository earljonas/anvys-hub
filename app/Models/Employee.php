<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'employee_id',
        'name',
        'email',
        'contact_number',
        'position',
        'location_id',
        'daily_rate',
        'status',
    ];

    protected $casts = [
        'daily_rate' => 'decimal:2',
    ];

    /**
     * Get the user account associated with this employee.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the location this employee is assigned to.
     */
    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Generate a unique employee ID.
     */
    public static function generateEmployeeId(): string
    {
        $lastEmployee = self::withTrashed()->orderBy('id', 'desc')->first();
        $nextNumber = $lastEmployee ? ((int) substr($lastEmployee->employee_id, 4)) + 1 : 1;
        return 'EMP-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }
}
