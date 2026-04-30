<?php

declare(strict_types=1);

namespace App\Http\Requests\Product;

use App\Enums\BooleanStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateProductRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255', Rule::unique('products')->whereNull('deleted_at')->ignore($this->route('product'))],
            'sku' => ['required', 'string', 'max:100', Rule::unique('products')->whereNull('deleted_at')->ignore($this->route('product'))],
            'description' => 'nullable|string',
            'brand_id' => ['required', 'integer', 'exists:brands,id'],
            'model' => 'required|string|max:100',
            'color_id' => ['required', 'integer', 'exists:colors,id'],
            'storage_capacity' => 'nullable|string|max:150',
            'ram' => 'nullable|string|max:100',
            'condition_id' => ['required', 'integer', 'exists:conditions,id'],
            'operating_system' => 'nullable|string',
            'photos' => 'nullable|array',
            'is_active' => ['required', new Enum(BooleanStatus::class)],
        ];
    }
}
