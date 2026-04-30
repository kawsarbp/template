<?php

namespace Database\Seeders;

use App\Models\BankAccount;
use Illuminate\Database\Seeder;

class BankAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        BankAccount::updateOrCreate(
            ['id' => BankAccount::CASH],
            [
                'holder_name' => 'Cash',
                'account_number' => '-',
                'opening_balance' => 0,
            ]
        );

        BankAccount::updateOrCreate(
            ['id' => BankAccount::NON_CASH_ID],
            [
                'holder_name' => 'Non Cash',
                'opening_balance' => 0,
            ]
        );
    }
}
