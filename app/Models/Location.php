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


    public function employees()
    {
        return $this->hasMany(Employee::class);
    }


    public function getStaffCountAttribute()
    {
        return $this->employees()
            ->where('status', 'Active')
            ->whereHas('user', function ($q) {
                $q->whereNull('deleted_at')
                  ->where('is_admin', false);
            })
            ->count();
    }
}
