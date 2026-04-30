<?php

declare(strict_types=1);

namespace App\Http\Requests\Sale;

use App\Enums\SaleType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class ImportSaleRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'customer_id' => 'nullable|exists:customers,id',
            'sale_type' => ['required', new Enum(SaleType::class)],
            'sale_date' => 'required|date',
            'discount' => 'nullable|numeric|min:0',
            'payment' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ];
    }
}
