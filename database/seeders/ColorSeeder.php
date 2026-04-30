<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ColorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('colors')->insert([
            ['name' => 'Black', 'status' => 1],
            ['name' => 'White', 'status' => 1],
            ['name' => 'Silver', 'status' => 1],
            ['name' => 'Gray', 'status' => 1],
            ['name' => 'Blue', 'status' => 1],
            ['name' => 'Red', 'status' => 1],
            ['name' => 'Green', 'status' => 1],
            ['name' => 'Gold', 'status' => 1],
            ['name' => 'Rose Gold', 'status' => 1],
            ['name' => 'Midnight', 'status' => 1],
            ['name' => 'Purple', 'status' => 1],
            ['name' => 'Titanium', 'status' => 1],
            ['name' => 'Sky Blue', 'status' => 1],
            ['name' => 'Graphite', 'status' => 1],
            ['name' => 'Cream', 'status' => 1],
        ]);
    }
}
