<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('modules')->insert([
            ['name' => 'Roles'],
            ['name' => 'User Management'],
            ['name' => 'Customer'],
            ['name' => 'Bank Account'],
            ['name' => 'Cash Flow Transaction'],
            ['name' => 'Product'],
            ['name' => 'Advance Account'],
            ['name' => 'Advance Report'],
            ['name' => 'Supplier'],
            ['name' => 'Stock'],
            ['name' => 'Brand'],
            ['name' => 'Color'],
            ['name' => 'Sale'],
            ['name' => 'Cash Bank Report'],
            ['name' => 'Condition'],
            ['name' => 'Sale Return'],
        ]);
    }
}
