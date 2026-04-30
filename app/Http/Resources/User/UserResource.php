<?php

declare(strict_types=1);

namespace App\Http\Resources\User;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @mixin User
 */
class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $role = $this->role;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'profile_photo' => $this->getProfilePhoto($this->profile_photo),
            'role_id' => $role?->id,
            'role_name' => $role?->name,
            'status' => $this->status->value,
            'status_name' => $this->status->getLabel(),
        ];
    }

    private function getProfilePhoto(mixed $profilePhoto)
    {
        if (empty($profilePhoto)) {
            // return default profile photo
            return '';
        }

        return filter_var($profilePhoto, FILTER_VALIDATE_URL) ? $profilePhoto : Storage::url($profilePhoto);
    }
}
