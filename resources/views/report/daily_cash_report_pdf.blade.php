@php use App\Enums\CashflowType; @endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Cash Bank</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }

        .container {
            width: 100%;
            margin: 0 auto;
        }

        .header {
            color: #3b5d9c; /* blue color */
            font-size: 24px;
            margin-bottom: 10px;
            font-weight: bold;
        }

        .company-name {
            color: #000; /* black color */
            font-size: 22px;
            margin-bottom: 20px;
        }

        .data {
            margin-top: 15px;
            text-align: right;
        }

        .value {
            padding: 5px;
            min-width: 100px; /* Adjust as needed */
            text-align: right;
            margin-top: 10px;
            color: #282727;
        }

        .value2 {
            padding: 2px;
            /*display: inline-block;*/
            min-width: 130px; /* Adjust as needed */
            text-align: right;
            margin-top: 10px;
            font-weight: bold;
            color: black;
        }

        .blue-background {
            background-color: #3b5d9c; /* blue background */
            color: #fff; /* white text */
            padding: 5px;
            margin-top: 20px;
            margin-bottom: 10px;
        }

        table {
            width: 100%;
        }

        th,
        td {
            text-align: left;
        }

        .right-align {
            text-align: right;
            width: 20%;
        }

        .right-align-total {
            text-align: right;
            width: 20%;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }
    </style>
</head>
<body>
<div class="container">
    <table>
        <tr>
            <td>
                <div class="header">{{ config('app.name') }}</div>
                <div class="company-name">{!! $reportTitle !!}</div>
            </td>
            <td style="text-align: right;">
                <img width="150"
                     src="{{ config('setting.basic_information.logo') }}">
            </td>
        </tr>
    </table>
    <div style="margin-top: 5px; border-top: 2px solid #232b2b;"></div>
    <div style="margin-top: 2px; border-top: 2px solid #232b2b;"></div>
    <div class="data">
        <table>
            <tr>
                <td>
                    <div style="color: #878181; font-size: 15px">
                        <span class="value">Statement of: {{ \Illuminate\Support\Carbon::parse( $start )->format('d/m/Y') }} to {{ \Illuminate\Support\Carbon::parse($end)->format('d/m/Y') }} </span>
                    </div>
                </td>
                <td style="text-align: right;">
                    Opening Balance: <span
                        class="value2"> {!! $openingBalance >= 0 ? priceFormat($openingBalance,0,'AED ') : '<span style="color: red;">('. priceFormat(abs($openingBalance)).')</span>' !!} </span>
                </td>
            </tr>
        </table>
    </div>

    @if( $customerAdvances->count() )
        <div>
            <div class="blue-background">Customer Advance Payment</div>
            @if( $summary['total_advance_debit'] )
                <strong style="color: #878181; font-size: 13px">CASH ADVANCE RECEIVED</strong>
                <div style="margin-bottom: 10px; font-size: 13px;">
                    <table border="1" cellspacing="0" cellpadding="2">
                        <thead>
                        <tr>
                            <th width="15%">{{__('Voucher NO.')}}</th>
                            <th width="25%">{{__('Name')}}</th>
                            <th width="50%">{{__('Description')}}</th>
                            <th width="10%">{{__('Amount')}}</th>
                        </tr>
                        </thead>
                        <tbody>
                        @foreach( $customerAdvances->where('amount', '>', 0) as $customerAdvance )
                            <tr style="font-size: 12px;">
                                <td>{{ $customerAdvance->voucher_number }}</td>
                                <td>{{ data_get($customerAdvance, 'customer.name') }}</td>
                                <td>{{ $customerAdvance->note }}</td>
                                <td class="right-align">{{ priceFormat(abs($customerAdvance->amount)) }}</td>
                            </tr>
                        @endforeach
                        </tbody>
                        <tfoot>
                        <tr>
                            <th class="text-center" colspan="3">Total Received</th>
                            <td class="text-right">{{ priceFormat($summary['total_advance_debit']) }}</td>
                        </tr>
                        </tfoot>
                    </table>
                </div>
            @endif
            @if( $summary['total_advance_credit'] )
                <strong style="color: #878181; font-size: 13px; margin-top: 20px;">ADVANCED UTILIZED/RECEIVED</strong>
                <div style="margin-bottom: 10px; font-size: 13px;">
                    <table border="1" cellspacing="0" cellpadding="2">
                        <thead>
                        <tr>
                            <th width="15%">{{__('Voucher NO.')}}</th>
                            <th width="25%">{{__('Name')}}</th>
                            <th width="50%">{{__('Description')}}</th>
                            <th width="10%">{{__('Amount')}}</th>
                        </tr>
                        </thead>
                        <tbody>
                        @foreach( $customerAdvances->where('amount', '<', 0) as $customerAdvance )
                            <tr style="font-size: 12px;">
                                <td>{{ $customerAdvance->voucher_number }}</td>
                                <td>{{ data_get($customerAdvance, 'customer.name') }}</td>
                                <td>{{ $customerAdvance->note }}</td>
                                <td class="right-align" style="color: red;">
                                    ({{ priceFormat(abs($customerAdvance->amount)) }})
                                </td>
                            </tr>
                        @endforeach
                        </tbody>
                        <tfoot>
                        <tr>
                            <th class="text-center" colspan="3">Total Paid</th>
                            <td class="right-align" style="color: red;">
                                ({{ priceFormat(abs($summary['total_advance_credit'])) }})
                            </td>
                        </tr>
                        </tfoot>
                    </table>
                </div>
            @endif
            @php $netCashFlow = $summary['total_advance_debit'] - abs( $summary['total_advance_credit'] ); @endphp
            <table>
                <tr style="background-color: #f3f2f2; padding: 2px">
                    <td style="color: #878181; font-size: 15px">
                        Net Cash Flow Customer Advance
                    </td>
                    @if( $netCashFlow >= 0 )
                        <td
                            class="right-align-total"
                            style="color: black; font-weight: bold"
                        >
                            {{ priceFormat(abs($netCashFlow)) }}
                        </td>
                    @else
                        <td class="right-align" style="color: red; font-weight: bold;">
                            ({{ priceFormat(abs($netCashFlow)) }})
                        </td>
                    @endif
                </tr>
            </table>
        </div>
    @endif

    @if( $salePayments->count() )
        <div>
            <div class="blue-background">Sale Payment</div>
            @if( $summary['total_sale_debit'] )
                <strong style="color: #878181; font-size: 13px">CASH RECEIPTS FROM</strong>
                <div style="margin-bottom: 10px; font-size: 13px;">
                    <table border="1" cellspacing="0" cellpadding="2">
                        <thead>
                        <tr>
                            <th width="15%">{{__('Voucher NO.')}}</th>
                            <th width="25%">{{__('Name')}}</th>
                            <th width="50%">{{__('Description')}}</th>
                            <th width="10%">{{__('Amount')}}</th>
                        </tr>
                        </thead>
                        <tbody>
                        @foreach( $salePayments as $payment )
                            <tr style="font-size: 12px;">
                                <td>{{ $payment->voucher_number ?? 'N/A' }}</td>
                                <td>{{ data_get($payment, 'sale.customer.name') }}</td>
                                <td>{{ data_get($payment, 'notes') }} </td>
                                <td class="right-align">{{ priceFormat($payment->amount) }}</td>
                            </tr>
                        @endforeach
                        </tbody>
                        <tfoot>
                        <tr>
                            <th class="text-center" colspan="3">Total Received</th>
                            <td class="text-right">{{ priceFormat($summary['total_sale_debit']) }}</td>
                        </tr>
                        </tfoot>
                    </table>
                </div>
            @endif
            <table>
                <tr style="background-color: #f3f2f2; padding: 2px">
                    <td style="color: #878181; font-size: 15px">
                        Net Cash Flow Sale
                    </td>
                    <td
                        class="right-align-total"
                        style="color: black; font-weight: bold"
                    >
                        {{ priceFormat($summary['total_sale_debit']) }}
                    </td>
                </tr>
            </table>
        </div>
    @endif

    {{-- stockPurchases Payment --}}
    @if($stockPurchases->count())
        <div>
            <div class="blue-background">Stock Purchases</div>
            @if( $summary['total_stock_purchase_credit'] )
                <div style="margin-bottom: 10px; font-size: 13px;">
                    <table border="1" cellspacing="0" cellpadding="2">
                        <thead>
                        <tr>
                            <th width="15%">{{__('Voucher NO.')}}</th>
                            <th width="25%">{{__('Name')}}</th>
                            <th width="50%">{{__('Description')}}</th>
                            <th width="10%">{{__('Amount')}}</th>
                        </tr>
                        </thead>
                        <tbody>
                        @foreach($stockPurchases as $payment )
                            <tr style="font-size: 12px;">
                                <td>{{ $payment->voucher_number ?? 'N/A' }}</td>
                                <td>{{ $payment->stockPurchase?->supplier?->name }}</td>
                                <td>{{ data_get($payment, 'notes') }}</td>
                                <td class="right-align">{{ priceFormat($payment->amount) }}</td>
                            </tr>
                        @endforeach
                        </tbody>
                        <tfoot>
                        <tr>
                            <th class="text-center" colspan="3">Total Payment</th>
                            <td class="text-right">{{ priceFormat( $summary['total_stock_purchase_credit'] ) }}</td>
                        </tr>
                        </tfoot>
                    </table>
                </div>
            @endif
            <table>
                <tr style="background-color: #f3f2f2; padding: 2px">
                    <td style="color: #878181; font-size: 15px">
                        Net Stock Purchase Payments
                    </td>
                    <td
                        class="right-align-total"
                        style="color: black; font-weight: bold"
                    >
                        {{ priceFormat( $summary['total_stock_purchase_credit'] ) }}
                    </td>
                </tr>
            </table>
        </div>
    @endif

    @if( $cashflowTransactions->count() )
        <div>
            <div class="blue-background">Other</div>
            @if( $summary['total_cashflow_debit'] )
                <strong style="color: #878181; font-size: 13px">CASH RECEIPTS FROM</strong>
                <div style="margin-bottom: 10px; font-size: 13px;">
                    <table border="1" cellspacing="0" cellpadding="2">
                        <thead>
                        <tr>
                            <th width="15%">{{__('Voucher NO.')}}</th>
                            <th width="25%">{{__('Name')}}</th>
                            <th width="50%">{{__('Description')}}</th>
                            <th width="10%">{{__('Amount')}}</th>
                        </tr>
                        </thead>
                        <tbody>
                        @foreach( $cashflowTransactions->where('type', CashflowType::CASH_IN) as $payment )
                            <tr style="font-size: 12px;">
                                <td>{{ $payment->voucher_number }}</td>
                                <td>{{ $payment->name }}</td>
                                <td>{{ $payment->description }}</td>
                                <td class="right-align">{{ priceFormat(abs($payment->amount)) }}</td>
                            </tr>
                        @endforeach
                        </tbody>
                        <tfoot>
                        <tr>
                            <th class="text-center" colspan="3">Total Received</th>
                            <td class="text-right">{{ priceFormat( $summary['total_cashflow_debit']) }}</td>
                        </tr>
                        </tfoot>
                    </table>
                </div>
            @endif
            @if( $summary['total_cashflow_credit'] )
                <strong style="color: #878181; font-size: 13px; margin-top: 20px;">CASH PAID FOR</strong>
                <div style="margin-bottom: 10px; font-size: 13px;">
                    <table border="1" cellspacing="0" cellpadding="2">
                        <thead>
                        <tr>
                            <th width="15%">{{__('Voucher NO.')}}</th>
                            <th width="25%">{{__('Name')}}</th>
                            <th width="50%">{{__('Description')}}</th>
                            <th width="10%">{{__('Amount')}}</th>
                        </tr>
                        </thead>
                        <tbody>
                        @foreach( $cashflowTransactions->where('type', CashflowType::CASH_OUT) as $payment )
                            <tr style="font-size: 12px;">
                                <td>{{ $payment->voucher_number }}</td>
                                <td>{{ $payment->name }}</td>
                                <td>{{ $payment->description }}</td>
                                <td class="right-align" style="color: red;">
                                    ({{ priceFormat(abs( $payment->amount)) }})
                                </td>
                            </tr>
                        @endforeach
                        </tbody>
                        <tfoot>
                        <tr>
                            <th class="text-center" colspan="3">Total Paid</th>
                            <td class="right-align" style="color: red;">
                                ({{ priceFormat( abs($summary['total_cashflow_credit']) ) }})
                            </td>
                        </tr>
                        </tfoot>
                    </table>
                </div>
            @endif
            @php $netCashFlow = $summary['total_cashflow_debit'] - abs($summary['total_cashflow_credit']); @endphp
            <table>
                <tr style="background-color: #f3f2f2; padding: 2px">
                    <td style="color: #878181; font-size: 15px">
                        Net Cash Flow Other
                    </td>
                    @if( $netCashFlow >= 0 )
                        <td
                            class="right-align-total"
                            style="color: black; font-weight: bold"
                        >
                            {{ priceFormat(abs($netCashFlow)) }}
                        </td>
                    @else
                        <td class="right-align" style="color: red; font-weight: bold;">
                            ({{ priceFormat(abs($netCashFlow)) }})
                        </td>
                    @endif
                </tr>
            </table>
        </div>
    @endif


    <div class="data">
        <p style="color: black; font-size: 15px; font-weight: bold;">
            Closing Balance:
            @if( $summary['closing_balance'] > 0 )
                <strong class="value" style="padding-left: 40px; color: black;"
                >{{ priceFormat(abs($summary['closing_balance']))}}</strong>
            @else
                <strong class="value" style="padding-left: 40px; color: red;"
                >({{ priceFormat(abs($summary['closing_balance']))}})</strong>
            @endif
        </p>
    </div>

    <div class="" style="width: 100%; padding: 10px">
        <table style="margin-top: 30px; width: 100%;">
            <tr>
                <td style=" color: #878181;">
                    <h4 style="width: 170px; text-align: center; border-top: 2px dotted  #333">
                        Signature of CEO
                        <br><span style="width: 170px; text-align: center; color: #333; margin-top: 5px;"></span>
                    </h4>
                </td>
                <td style="color: #878181;">
                    <h4 style="width: 170px; text-align: center; float: right; border-top: 2px dotted  #333">
                        Signature of Cashier
                    </h4>
                </td>
            </tr>
        </table>
    </div>

</div>
</body>
</html>
