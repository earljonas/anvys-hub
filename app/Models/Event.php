<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_name',
        'address',
        'contact_number',
        'event_package_id',
        'event_date',
        'event_time',
        'extra_guests',
        'total_price',
        'payment_status',
    ];

    protected $casts = [
        'event_date' => 'date',
        'total_price' => 'decimal:2',
    ];

    public function package()
    {
        return $this->belongsTo(EventPackage::class, 'event_package_id');
    }
}
