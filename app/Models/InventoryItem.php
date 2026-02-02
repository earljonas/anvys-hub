<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'location_id',
        'stock',
        'min_stock',
        'unit',
        'cost_per_unit',
        'status',
    ];

    protected $casts = [
        'stock' => 'integer',
        'min_stock' => 'integer',
        'cost_per_unit' => 'decimal:2',
    ];

    /**
     * Get the location that owns the inventory item.
     */
    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Get the stock logs for this item.
     */
    public function stockLogs()
    {
        return $this->hasMany(StockLog::class);
    }

    /**
     * Calculate and update the status based on stock levels.
     */
    public function updateStatus(): void
    {
        if ($this->stock === 0) {
            $this->status = 'Out of Stock';
        } elseif ($this->stock <= $this->min_stock) {
            $this->status = 'Low Stock';
        } else {
            $this->status = 'In Stock';
        }
    }

    /**
     * Boot method to auto-calculate status on save.
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($item) {
            $item->updateStatus();
        });
    }
}
