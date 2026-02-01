<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductAddon;
use App\Models\ProductSize;
use Illuminate\Database\Seeder;

class POSSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Categories
        $scrambleCategory = Category::create([
            'name' => 'Ice Scramble',
            'slug' => 'scramble',
        ]);

        $frappeCategory = Category::create([
            'name' => 'Frappes',
            'slug' => 'frappe',
        ]);

        $sodaCategory = Category::create([
            'name' => 'Fruit Soda',
            'slug' => 'soda',
        ]);

        // Ice Scramble Sizes (shared across all scramble products)
        $scrambleSizes = [
            ['name' => 'Small', 'price' => 100, 'sort_order' => 1],
            ['name' => 'Medium', 'price' => 110, 'sort_order' => 2],
            ['name' => 'Large', 'price' => 120, 'sort_order' => 3],
            ['name' => '1 Liter', 'price' => 200, 'sort_order' => 4],
        ];

        // Ice Scramble Addons (shared across all scramble products)
        $scrambleAddons = [
            ['name' => 'Milk', 'price' => 10],
            ['name' => 'Marshmallows', 'price' => 10],
            ['name' => 'Sprinkles', 'price' => 10],
            ['name' => 'Nips', 'price' => 10],
            ['name' => 'Graham', 'price' => 10],
            ['name' => 'Oreo', 'price' => 10],
        ];

        // Create Ice Scramble Products
        $scrambleFlavors = ['Strawberry', 'Chocolate', 'Ube', 'Pandan', 'Melon', 'Mango Graham'];

        foreach ($scrambleFlavors as $flavor) {
            $product = Product::create([
                'category_id' => $scrambleCategory->id,
                'name' => $flavor . ' Ice Scramble',
                'flavor' => $flavor,
                'base_price' => 100,
                'has_sizes' => true,
                'is_active' => true,
            ]);

            // Add sizes
            foreach ($scrambleSizes as $size) {
                ProductSize::create([
                    'product_id' => $product->id,
                    'name' => $size['name'],
                    'price' => $size['price'],
                    'sort_order' => $size['sort_order'],
                ]);
            }

            // Add addons
            foreach ($scrambleAddons as $addon) {
                ProductAddon::create([
                    'product_id' => $product->id,
                    'name' => $addon['name'],
                    'price' => $addon['price'],
                ]);
            }
        }

        // Create Frappe Products (no sizes, no addons)
        $frappeFlavors = ['Cookies & Cream', 'Cappuccino', 'Chocolate'];

        foreach ($frappeFlavors as $flavor) {
            Product::create([
                'category_id' => $frappeCategory->id,
                'name' => $flavor . ' Frappe',
                'flavor' => $flavor,
                'base_price' => 149,
                'has_sizes' => false,
                'is_active' => true,
            ]);
        }

        // Fruit Soda Addons
        $sodaAddons = [
            ['name' => 'Yakult', 'price' => 15],
            ['name' => 'Fruit Jelly', 'price' => 15],
        ];

        // Create Fruit Soda Products (with addons, no sizes)
        $sodaFlavors = ['Strawberry', 'Green Apple', 'Four Seasons', 'Lychee', 'Blueberry'];

        foreach ($sodaFlavors as $flavor) {
            $product = Product::create([
                'category_id' => $sodaCategory->id,
                'name' => $flavor . ' Fruit Soda',
                'flavor' => $flavor,
                'base_price' => 59,
                'has_sizes' => false,
                'is_active' => true,
            ]);

            // Add addons
            foreach ($sodaAddons as $addon) {
                ProductAddon::create([
                    'product_id' => $product->id,
                    'name' => $addon['name'],
                    'price' => $addon['price'],
                ]);
            }
        }
    }
}
