<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('permissions')->insert([
            // role module
            ['name' => 'manage role', 'module_id' => 1, 'guard_name' => 'web'],
            ['name' => 'create role', 'module_id' => 1, 'guard_name' => 'web'],
            ['name' => 'update role', 'module_id' => 1, 'guard_name' => 'web'],
            ['name' => 'view role', 'module_id' => 1, 'guard_name' => 'web'],
            ['name' => 'delete role', 'module_id' => 1, 'guard_name' => 'web'],

            // user module
            ['name' => 'manage user', 'module_id' => 2, 'guard_name' => 'web'],
            ['name' => 'create user', 'module_id' => 2, 'guard_name' => 'web'],
            ['name' => 'update user', 'module_id' => 2, 'guard_name' => 'web'],
            ['name' => 'view user', 'module_id' => 2, 'guard_name' => 'web'],
            ['name' => 'delete user', 'module_id' => 2, 'guard_name' => 'web'],

            // customer module
            ['name' => 'manage customer', 'module_id' => 3, 'guard_name' => 'web'],
            ['name' => 'create customer', 'module_id' => 3, 'guard_name' => 'web'],
            ['name' => 'update customer', 'module_id' => 3, 'guard_name' => 'web'],
            ['name' => 'view customer', 'module_id' => 3, 'guard_name' => 'web'],
            ['name' => 'delete customer', 'module_id' => 3, 'guard_name' => 'web'],
            ['name' => 'export excel customer', 'module_id' => 3, 'guard_name' => 'web'],

            // bank account module
            ['name' => 'manage bank account', 'module_id' => 4, 'guard_name' => 'web'],
            ['name' => 'create bank account', 'module_id' => 4, 'guard_name' => 'web'],
            ['name' => 'update bank account', 'module_id' => 4, 'guard_name' => 'web'],
            ['name' => 'view bank account', 'module_id' => 4, 'guard_name' => 'web'],
            ['name' => 'delete bank account', 'module_id' => 4, 'guard_name' => 'web'],
            ['name' => 'export excel bank account', 'module_id' => 4, 'guard_name' => 'web'],

            // cashflow module
            ['name' => 'manage cashflow', 'module_id' => 5, 'guard_name' => 'web'],
            ['name' => 'create cashflow', 'module_id' => 5, 'guard_name' => 'web'],
            ['name' => 'update cashflow', 'module_id' => 5, 'guard_name' => 'web'],
            ['name' => 'view cashflow', 'module_id' => 5, 'guard_name' => 'web'],
            ['name' => 'delete cashflow', 'module_id' => 5, 'guard_name' => 'web'],
            ['name' => 'export excel cashflow', 'module_id' => 5, 'guard_name' => 'web'],

            // cashflow module
            ['name' => 'manage product', 'module_id' => 6, 'guard_name' => 'web'],
            ['name' => 'create product', 'module_id' => 6, 'guard_name' => 'web'],
            ['name' => 'update product', 'module_id' => 6, 'guard_name' => 'web'],
            ['name' => 'view product', 'module_id' => 6, 'guard_name' => 'web'],
            ['name' => 'delete product', 'module_id' => 6, 'guard_name' => 'web'],
            ['name' => 'export excel product', 'module_id' => 6, 'guard_name' => 'web'],

            // advance module
            ['name' => 'manage advance account', 'module_id' => 7, 'guard_name' => 'web'],
            ['name' => 'create advance account', 'module_id' => 7, 'guard_name' => 'web'],
            ['name' => 'update advance account', 'module_id' => 7, 'guard_name' => 'web'],
            ['name' => 'view advance account', 'module_id' => 7, 'guard_name' => 'web'],
            ['name' => 'delete advance account', 'module_id' => 7, 'guard_name' => 'web'],
            ['name' => 'export excel advance account', 'module_id' => 7, 'guard_name' => 'web'],
            ['name' => 'pdf export advance account', 'module_id' => 7, 'guard_name' => 'web'],

            // advance report
            ['name' => 'manage advance report', 'module_id' => 8, 'guard_name' => 'web'],
            ['name' => 'export pdf advance report', 'module_id' => 8, 'guard_name' => 'web'],
            ['name' => 'export excel advance report', 'module_id' => 8, 'guard_name' => 'web'],

            // supplier module
            ['name' => 'manage supplier', 'module_id' => 9, 'guard_name' => 'web'],
            ['name' => 'create supplier', 'module_id' => 9, 'guard_name' => 'web'],
            ['name' => 'update supplier', 'module_id' => 9, 'guard_name' => 'web'],
            ['name' => 'view supplier', 'module_id' => 9, 'guard_name' => 'web'],
            ['name' => 'delete supplier', 'module_id' => 9, 'guard_name' => 'web'],
            ['name' => 'export excel supplier', 'module_id' => 9, 'guard_name' => 'web'],
            ['name' => 'export excel supplier payment', 'module_id' => 9, 'guard_name' => 'web'],

            // stock module
            ['name' => 'manage stock', 'module_id' => 10, 'guard_name' => 'web'],
            ['name' => 'create stock', 'module_id' => 10, 'guard_name' => 'web'],
            ['name' => 'update stock', 'module_id' => 10, 'guard_name' => 'web'],
            ['name' => 'view stock', 'module_id' => 10, 'guard_name' => 'web'],
            ['name' => 'delete stock', 'module_id' => 10, 'guard_name' => 'web'],
            ['name' => 'export excel stock', 'module_id' => 10, 'guard_name' => 'web'],

            // brand module
            ['name' => 'manage brand', 'module_id' => 11, 'guard_name' => 'web'],
            ['name' => 'create brand', 'module_id' => 11, 'guard_name' => 'web'],
            ['name' => 'update brand', 'module_id' => 11, 'guard_name' => 'web'],
            ['name' => 'view brand', 'module_id' => 11, 'guard_name' => 'web'],
            ['name' => 'delete brand', 'module_id' => 11, 'guard_name' => 'web'],

            // color module
            ['name' => 'manage color', 'module_id' => 12, 'guard_name' => 'web'],
            ['name' => 'create color', 'module_id' => 12, 'guard_name' => 'web'],
            ['name' => 'update color', 'module_id' => 12, 'guard_name' => 'web'],
            ['name' => 'view color', 'module_id' => 12, 'guard_name' => 'web'],
            ['name' => 'delete color', 'module_id' => 12, 'guard_name' => 'web'],

            // condition module
            ['name' => 'manage condition', 'module_id' => 15, 'guard_name' => 'web'],
            ['name' => 'create condition', 'module_id' => 15, 'guard_name' => 'web'],
            ['name' => 'update condition', 'module_id' => 15, 'guard_name' => 'web'],
            ['name' => 'view condition', 'module_id' => 15, 'guard_name' => 'web'],
            ['name' => 'delete condition', 'module_id' => 15, 'guard_name' => 'web'],

            // sale module
            ['name' => 'manage sale', 'module_id' => 13, 'guard_name' => 'web'],
            ['name' => 'create sale', 'module_id' => 13, 'guard_name' => 'web'],
            ['name' => 'update sale', 'module_id' => 13, 'guard_name' => 'web'],
            ['name' => 'view sale', 'module_id' => 13, 'guard_name' => 'web'],
            ['name' => 'delete sale', 'module_id' => 13, 'guard_name' => 'web'],

            // cash bank module
            ['name' => 'manage cash bank', 'module_id' => 14, 'guard_name' => 'web'],
            ['name' => 'pdf download cash bank', 'module_id' => 14, 'guard_name' => 'web'],
            ['name' => 'export excel cash bank', 'module_id' => 14, 'guard_name' => 'web'],

            // sale return module
            ['name' => 'manage sale return', 'module_id' => 16, 'guard_name' => 'web'],
            ['name' => 'create sale return', 'module_id' => 16, 'guard_name' => 'web'],
            ['name' => 'update sale return', 'module_id' => 16, 'guard_name' => 'web'],
            ['name' => 'view sale return', 'module_id' => 16, 'guard_name' => 'web'],
            ['name' => 'delete sale return', 'module_id' => 16, 'guard_name' => 'web'],
        ]);
    }
}
