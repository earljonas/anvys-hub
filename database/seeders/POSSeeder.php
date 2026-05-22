<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Addon; // Changed from ProductAddon
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
        $scrambleCategory = Category::updateOrCreate(
            ['slug' => 'scramble'],
            ['name' => 'Ice Scramble']
        );

        $frappeCategory = Category::updateOrCreate(
            ['slug' => 'frappe'],
            ['name' => 'Frappes']
        );

        $sodaCategory = Category::updateOrCreate(
            ['slug' => 'soda'],
            ['name' => 'Fruit Soda']
        );

        // Ice Scramble Sizes
        $scrambleSizes = [
            ['name' => 'Small', 'price' => 100, 'sort_order' => 1],
            ['name' => 'Medium', 'price' => 110, 'sort_order' => 2],
            ['name' => 'Large', 'price' => 120, 'sort_order' => 3],
            ['name' => '1 Liter', 'price' => 200, 'sort_order' => 4],
        ];

        // Create Shared Addons
        $addons = [];
        $scrambleAddonNames = [
            ['name' => 'Milk', 'price' => 10],
            ['name' => 'Marshmallows', 'price' => 10],
            ['name' => 'Sprinkles', 'price' => 10],
            ['name' => 'Nips', 'price' => 10],
            ['name' => 'Graham', 'price' => 10],
            ['name' => 'Oreo', 'price' => 10],
        ];

        foreach ($scrambleAddonNames as $a) {
            $addons[$a['name']] = Addon::updateOrCreate(
                ['name' => $a['name']],
                ['price' => $a['price']]
            );
        }

        $sodaAddonNames = [
            ['name' => 'Yakult', 'price' => 15],
            ['name' => 'Fruit Jelly', 'price' => 15],
        ];

        foreach ($sodaAddonNames as $a) {
            $addons[$a['name']] = Addon::updateOrCreate(
                ['name' => $a['name']],
                ['price' => $a['price']]
            );
        }

        // Create Ice Scramble Products
        $scrambleFlavors = [
            'Strawberry' => '/product_images/strawberry.jpg',
            'Chocolate' => '/product_images/chocolate.jpg',
            'Ube' => '/product_images/ube.jpg',
            'Pandan' => '/product_images/pandan.jpg',
            'Melon' => '/product_images/melon.jpg',
            'Mango Graham' => '/product_images/mango_graham.jpg',
        ];

        foreach ($scrambleFlavors as $flavor => $image) {
            $product = Product::updateOrCreate(
                ['name' => $flavor . ' Ice Scramble'],
                [
                    'category_id' => $scrambleCategory->id,
                    'flavor' => $flavor,
                    'base_price' => 100,
                    'has_sizes' => true,
                    'image' => $image,
                    'is_active' => true,
                ]
            );

            // Add sizes
            foreach ($scrambleSizes as $size) {
                ProductSize::updateOrCreate(
                    ['product_id' => $product->id, 'name' => $size['name']],
                    [
                        'price' => $size['price'],
                        'sort_order' => $size['sort_order'],
                    ]
                );
            }

            // Attach shared addons
            // Get IDs of scramble addons
            $scrambleAddonIds = collect($scrambleAddonNames)->map(fn($a) => $addons[$a['name']]->id);
            $product->addons()->syncWithoutDetaching($scrambleAddonIds);
        }

        // Create Frappe Products (no sizes, no addons)
        $frappeFlavors = [
            'Cookies & Cream' => '/product_images/cookies_cream_frappe.jpg',
            'Cappuccino' => '/product_images/cappuccino_frappe.jpg',
            'Chocolate' => '/product_images/chocolate_frappe.jpg',
        ];

        foreach ($frappeFlavors as $flavor => $image) {
            Product::updateOrCreate(
                ['name' => $flavor . ' Frappe'],
                [
                    'category_id' => $frappeCategory->id,
                    'flavor' => $flavor,
                    'base_price' => 149,
                    'has_sizes' => false,
                    'image' => $image,
                    'is_active' => true,
                ]
            );
        }

        // Create Fruit Soda Products (with addons, no sizes)
        $sodaFlavors = [
            'Strawberry' => '/product_images/strawberry_fruit.jpg',
            'Green Apple' => '/product_images/green_apple_fruit.jpg',
            'Four Seasons' => '/product_images/four_seasons_fruit.jpg',
            'Lychee' => '/product_images/lychee_fruit.jpg',
            'Blueberry' => '/product_images/blueberry_fruit.jpg',
        ];

        foreach ($sodaFlavors as $flavor => $image) {
            $product = Product::updateOrCreate(
                ['name' => $flavor . ' Fruit Soda'],
                [
                    'category_id' => $sodaCategory->id,
                    'flavor' => $flavor,
                    'base_price' => 59,
                    'has_sizes' => false,
                    'image' => $image,
                    'is_active' => true,
                ]
            );

            // Attach soda addons
            $sodaAddonIds = collect($sodaAddonNames)->map(fn($a) => $addons[$a['name']]->id);
            $product->addons()->syncWithoutDetaching($sodaAddonIds);
        }
    }
}
