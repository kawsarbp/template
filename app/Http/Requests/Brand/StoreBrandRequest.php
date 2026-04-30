<?php

declare(strict_types=1);

namespace App\Http\Requests\Brand;

use App\Enums\VisibilityStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreBrandRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:200', Rule::unique('brands', 'name')->whereNull('deleted_at')],
            'status' => ['required', 'integer', new Enum(VisibilityStatus::class)],
        ];
    }
}
