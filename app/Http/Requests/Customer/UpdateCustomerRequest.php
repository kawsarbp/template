<?php

declare(strict_types=1);

namespace App\Http\Requests\Customer;

use App\Enums\VisibilityStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateCustomerRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:200'],
            'email' => ['required', 'email', 'max:50', Rule::unique('customers', 'email')->whereNull('deleted_at')->ignore($this->route('customer'))],
            'phone' => ['nullable', 'string', 'max:20'],
            'company_name' => ['nullable', 'string', 'max:200'],
            'address' => ['nullable', 'string'],
            'country' => ['nullable', 'string', 'max:150'],
            'state' => ['nullable', 'string', 'max:150'],
            'city' => ['nullable', 'string', 'max:150'],
            'status' => ['required', 'integer', new Enum(VisibilityStatus::class)],
        ];
    }
}
