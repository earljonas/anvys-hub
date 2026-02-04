<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_item_id',
        'location_id',
        'user_id',
        'type',
        'quantity',
        'notes',
        'logged_at',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'logged_at' => 'datetime',
    ];

    /**
     * Get the inventory item this log belongs to.
     */
    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Get the location where this adjustment happened.
     */
    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Get the user who made this adjustment.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
