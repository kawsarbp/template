<?php

declare(strict_types=1);

namespace App\Http\Resources\BankAccount;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Customer
 */
class BankAccountDetailResource extends JsonResource
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
            'holder_name' => $this->holder_name,
            'name' => $this->name,
            'account_number' => $this->account_number,
            'opening_balance' => $this->opening_balance,
        ];
    }
}
