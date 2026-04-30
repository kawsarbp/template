<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('roles')->insert([
            ['name' => 'owner', 'guard_name' => 'web'],
            ['name' => 'super admin', 'guard_name' => 'web'],
            ['name' => 'accountant', 'guard_name' => 'web'],
            ['name' => 'customer', 'guard_name' => 'web'],
        ]);

        Role::find(1)->givePermissionTo(Permission::pluck('name')->toArray());
        Role::find(2)->givePermissionTo(Permission::where('name', 'not like', 'delete %')->pluck('name')->toArray());
        Role::find(3)->givePermissionTo(Permission::where('name', 'not like', 'delete %')->whereNot('module_id', 8)->pluck('name')->toArray());
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
