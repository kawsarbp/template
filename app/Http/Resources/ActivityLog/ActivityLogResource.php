<?php

namespace App\Http\Resources\ActivityLog;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class ActivityLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_name' => $this->causer?->name,
            'description' => $this->description,
            'event' => $this->event,
            'type' => Str::headline(str_replace('App\\Models\\', '', $this->subject_type)),
            'created_at' => dateTimeFormat($this->created_at),
            'history_url' => getAuditHistoryPageUrl($this->description, $this->id),
        ];
    }
}
