<?php

declare(strict_types=1);

namespace App\Actions\AdvanceAccount;

use App\Models\AdvancedAccount;

class ShowAdvanceAccountAction
{
    public function execute($id)
    {
        return AdvancedAccount::with(['customer', 'bank_account'])
            ->find($id);
    }
}
