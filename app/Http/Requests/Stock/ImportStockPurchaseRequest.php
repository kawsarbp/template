<?php

declare(strict_types=1);

namespace App\Http\Requests\Stock;

use Illuminate\Foundation\Http\FormRequest;

class ImportStockPurchaseRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'batch_number' => 'required|string|max:100|unique:stock_purchases,batch_number',
            'supplier_id' => 'required|exists:suppliers,id',
            'purchase_date' => 'required|date',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ];
    }
}
