<?php

namespace App\Exports;

use App\Models\AdvancedAccount;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class CustomerAdvanceHistoryExport implements FromCollection, WithHeadings, WithMapping
{
    private int $customerId;

    /**
     * ConsigneesExport constructor.
     */
    public function __construct(int $customerId)
    {
        $this->customerId = $customerId;
    }

    public function headings(): array
    {
        return [
            'DATE',
            'VOUCHER NO.',
            'DESCRIPTION',
            'MODE OF PAYMENT',
            'AMOUNT RECEIVED',
            'ADVANCE UTILIZED',
            'BALANCE',
        ];
    }

    public function map($row): array
    {
        return [
            dateFormat($row->date),
            $row->voucher_number,
            $row->note,
            data_get($row, 'bank_account.holder_name'),
            $row->amount > 0 ? priceFormat($row->amount) : '',
            $row->amount < 0 ? priceFormat(abs($row->amount)) : '',
            priceFormat($row->balance),
        ];
    }

    public function collection()
    {
        $customerReport = AdvancedAccount::with(['bank_account'])
            ->where('customer_id', $this->customerId)
            ->orderby('date')
            ->get();
        $balance = 0;
        foreach ($customerReport as $key => $account) {
            $balance += $account->amount;
            $customerReport[$key]->balance = $balance;
        }

        return $customerReport->reverse();
    }
}
