<?php

declare(strict_types=1);

namespace App\Http\Requests\BankAccount;

use Illuminate\Foundation\Http\FormRequest;

class StoreBankAccountRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'holder_name' => ['required'],
            'name' => ['nullable'],
            'account_number' => ['nullable'],
            'opening_balance' => ['required', 'numeric'],
        ];
    }
}
