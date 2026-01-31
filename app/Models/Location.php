<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Location extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'address',
        'status',
    ];

    /**
     * Get all employees assigned to this location.
     */
    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    /**
     * Get the count of active employees at this location.
     */
    public function getStaffCountAttribute()
    {
        return $this->employees()->where('status', 'Active')->count();
    }
}
