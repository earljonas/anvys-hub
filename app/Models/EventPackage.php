<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'price',
        'cups_count',
        'extra_guest_price',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'extra_guest_price' => 'decimal:2',
    ];
}
