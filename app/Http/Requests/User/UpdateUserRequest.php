<?php

declare(strict_types=1);

namespace App\Http\Requests\User;

use App\Enums\VisibilityStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateUserRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|max:200',
            'email' => [
                'required',
                'email',
                'max:200',
                Rule::unique('users')->whereNull('deleted_at')->ignore($this->user),
            ],
            'password' => 'nullable|min:6|max:12',
            'profile_photo' => ['nullable', 'max:200'],
            'role_id' => 'required|integer',
            'status' => ['required', new Enum(VisibilityStatus::class)],
        ];
    }

    public function messages(): array
    {
        return [
            'role_id.required' => 'The role field is required.',
        ];
    }
}
