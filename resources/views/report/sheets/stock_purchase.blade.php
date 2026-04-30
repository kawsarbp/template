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
    @if($stockPurchases->count() )
        @foreach ($stockPurchases as $payment)
            <tr class="font-style">
                <td>{{ dateFormat($payment->date) }}</td>
                <td>{{ $payment->voucher_number ?? 'N/A' }}</td>
                <td>{{ $payment->stockPurchase?->supplier?->name }}</td>
                <td>{{ data_get($payment, 'notes') }}</td>
                <td></td>
                <td>{{ priceFormat( $payment->amount) }}</td>
            </tr>
        @endforeach
        <tr class="font-style">
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td><strong>{{ priceFormat(0) }}</strong></td>
            <td>
                <strong>{{ priceFormat($summary['total_stock_purchase_credit'])  }}</strong>
            </td>
        </tr>
    @else
        <tr>
            <td colspan="6">No data available</td>
        </tr>
    @endif
    </tbody>
</table>
