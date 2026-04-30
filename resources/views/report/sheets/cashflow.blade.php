@php use App\Enums\CashflowType; @endphp
<table class="table table-bordered">
    <thead>
    <tr>
        <th width="10%">{{__('Date')}}</th>
        <th width="10%">{{__('Voucher NO.')}}</th>
        <th width="15%">{{__('Name')}}</th>
        <th width="45%">{{__('Description')}}</th>
        <th width="10%">{{__('Debit')}}</th>
        <th width="10%">{{__('Credit')}}</th>
    </tr>
    </thead>
    <tbody>

    @if($cashflowTransactions->count())
        @foreach ($cashflowTransactions as $payment)
            <tr class="font-style">
                <td>{{ dateFormat($payment->date) }}</td>
                <td>{{ $payment->voucher_number }}</td>
                <td>{{ data_get($payment, 'name') }}</td>
                <td>{{ data_get($payment, 'description') }}</td>
                <td>{{ $payment->type == CashflowType::CASH_IN ? priceFormat($payment->amount) : '' }}</td>
                <td>{{ $payment->type == CashflowType::CASH_OUT ? priceFormat($payment->amount) : '' }}</td>
            </tr>
        @endforeach
        <tr class="font-style">
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td>
                <strong>{{ priceFormat($summary['total_cashflow_debit']) }}</strong>
            </td>
            <td>
                <strong>{{ priceFormat($summary['total_cashflow_credit']) }}</strong>
            </td>
        </tr>
    @else
        <tr>
            <td colspan="6">No data available</td>
        </tr>
    @endif
    </tbody>
</table>
