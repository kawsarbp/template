<?php

declare(strict_types=1);

namespace App\Http\Requests\Color;

use App\Enums\VisibilityStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateColorRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:200', Rule::unique('colors', 'name')->whereNull('deleted_at')->ignore($this->route('color'))],
            'status' => ['required', 'integer', new Enum(VisibilityStatus::class)],
        ];
    }
}
