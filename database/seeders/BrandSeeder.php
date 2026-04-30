<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('brands')->insert([
            ['name' => 'Apple', 'status' => 1],
            ['name' => 'Samsung', 'status' => 1],
            ['name' => 'Xiaomi', 'status' => 1],
            ['name' => 'Oppo', 'status' => 1],
            ['name' => 'Vivo', 'status' => 1],
            ['name' => 'Realme', 'status' => 1],
            ['name' => 'Huawei', 'status' => 1],
            ['name' => 'OnePlus', 'status' => 1],
            ['name' => 'Motorola', 'status' => 1],
            ['name' => 'Nokia', 'status' => 1],
            ['name' => 'Google Pixel', 'status' => 1],
            ['name' => 'Sony', 'status' => 1],
            ['name' => 'Honor', 'status' => 1],
            ['name' => 'Infinix', 'status' => 1],
            ['name' => 'Tecno', 'status' => 1],
            ['name' => 'Asus', 'status' => 1],
            ['name' => 'Lenovo', 'status' => 1],
            ['name' => 'Nothing', 'status' => 1],
        ]);
    }
}
