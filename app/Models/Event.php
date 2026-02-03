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
        'status',
    ];

    protected $casts = [
        'event_date' => 'date',
        'total_price' => 'decimal:2',
    ];

    protected $appends = ['payment_status', 'total_paid'];

    public function package()
    {
        return $this->belongsTo(EventPackage::class, 'event_package_id');
    }

    public function payments()
    {
        return $this->hasMany(EventPayment::class);
    }

    /**
     * Get the total amount paid for this event.
     */
    public function getTotalPaidAttribute()
    {
        return (float) $this->payments()->sum('amount');
    }

    /**
     * Compute the payment status based on total paid vs total price.
     */
    public function getPaymentStatusAttribute()
    {
        $totalPaid = $this->total_paid;
        $totalPrice = (float) $this->total_price;

        if ($totalPaid <= 0) {
            return 'UNPAID';
        } elseif ($totalPaid < $totalPrice) {
            return 'PARTIAL';
        } else {
            return 'PAID';
        }
    }

    /**
     * Check if event is active.
     */
    public function isActive()
    {
        return $this->status === 'ACTIVE';
    }

    /**
     * Check if event is cancelled.
     */
    public function isCancelled()
    {
        return $this->status === 'CANCELLED';
    }
}
