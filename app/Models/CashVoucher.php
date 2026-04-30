<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashVoucher extends Model
{
    protected $fillable = [
        'voucher_type',
        'voucher_number',
    ];
}
