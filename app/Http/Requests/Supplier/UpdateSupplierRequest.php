<?php

declare(strict_types=1);

namespace App\Http\Requests\Supplier;

use App\Enums\Currency;
use App\Enums\VisibilityStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateSupplierRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:200'],
            'email' => ['nullable', 'email', 'max:50', Rule::unique('suppliers', 'email')->whereNull('deleted_at')->ignore($this->route('supplier'))],
            'phone' => ['nullable', 'string', 'max:20'],
            'company_name' => ['nullable', 'string', 'max:200'],
            'address' => ['nullable', 'string'],
            'currency' => ['required', 'string', new Enum(Currency::class)],
            'status' => ['required', 'integer', new Enum(VisibilityStatus::class)],
        ];
    }
}
