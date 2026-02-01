<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'flavor',
        'base_price',
        'has_sizes',
        'image',
        'is_active',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'has_sizes' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get the category this product belongs to.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the sizes for this product.
     */
    public function sizes()
    {
        return $this->hasMany(ProductSize::class)->orderBy('sort_order');
    }

    /**
     * Get the add-ons for this product.
     */
    public function addons()
    {
        return $this->hasMany(ProductAddon::class);
    }
}
