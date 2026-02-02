<?php

namespace Database\Seeders;

use App\Models\EventPackage;
use Illuminate\Database\Seeder;

class EventPackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $packages = [
            [
                'name' => 'Sweet Celebration',
                'slug' => 'sweet',
                'price' => 4200.00,
                'cups_count' => 60,
                'extra_guest_price' => 70.00,
            ],
            [
                'name' => 'Grand Fiesta',
                'slug' => 'grand',
                'price' => 5250.00,
                'cups_count' => 75,
                'extra_guest_price' => 70.00,
            ],
            [
                'name' => 'Ultimate Party',
                'slug' => 'ultimate',
                'price' => 6800.00,
                'cups_count' => 100,
                'extra_guest_price' => 70.00,
            ],
        ];

        foreach ($packages as $pkg) {
            EventPackage::create($pkg);
        }
    }
}
