<?php

declare(strict_types=1);

namespace App\Http\Requests\Role;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRoleRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'max:200',
                Rule::unique('roles'),
            ],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => 'required|integer',
        ];
    }
}
