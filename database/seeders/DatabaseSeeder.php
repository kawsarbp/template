<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $owner = User::updateOrCreate(
            ['email' => 'dev@ignitionit.com'],
            [
                'name' => 'Ignition Developer',
                'email' => 'dev@ignitionit.com',
                'password' => Hash::make('password'),
            ]
        );

        // $owner->assignRole('owner');
    }
}
