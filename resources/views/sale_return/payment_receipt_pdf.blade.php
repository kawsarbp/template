<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: "Times New Roman", Serif;
        }

        header {
            width: 100%;
            position: fixed;
            top: -15px;
            font-size: 10px;
        }

        h1,
        h2 {
            margin-top: 0;
            margin-bottom: 0;
            font-weight: 500;
            line-height: 1.2;
        }

        .pt-5 {
            padding-top: 48px;
        }

        .mb-4 {
            margin-bottom: 25px;
            padding: 0px 5px;
        }

        .text-center {
            text-align: center;
        }

        .color-blue {
            color: darkslateblue;
            font-family: Serif;
        }

        table.add-border {
            border-collapse: collapse;
        }

        table.add-border td, table.add-border th {
            border: 1px solid #CCC;
            padding-left: 3px;
        }

        .arabic-text {
            font-family: "Tajawal", sans-serif;
            text-align: right;
        }

        .voucher-text {
            font-family: "Times New Roman", serif;
            font-size: 16px;
            margin-bottom: 2px;
        }

        tr, td {
            margin: 0;
            padding: 2px;
        }

        table {
            border-collapse: collapse;
        }
    </style>
</head>

<body>
{{--header--}}
<header style="width: 100%;">
    <table width="100%">
        <tr>
            <td style="text-align: right;">
                <small>
                    <strong>Generated AT: {{ dateTimeFormat($payment->created_at) }}</strong>
                </small>
            </td>
        </tr>
    </table>
</header>

<div>
    <table width="100%">
        <tr>
            <td>
                <div>
                    <img width="140" src="{{ config('setting.basic_information.logo') }}">
                </div>
            </td>
            <td align="right">
                <div style="color: #d1652b; font-size: 18px;">
                    <h2>{{ config('setting.basic_information.company_name') }}</h2>
                </div>
            </td>
        </tr>
    </table>
    <hr style="color: #403a94; margin: 2px;">
</div>
{{--header--}}

<div>
    <table style="width: 100%; margin-bottom: 20px;">
        <tr>
            <td style="color: #d1652b; width: 33.33%">
                <h4 style="margin: 0; padding: 0;">
                    <span class="voucher-text">No.</span>
                    <span style="color: black; border-bottom: 2px dotted #d1652b">{{ $payment->voucher_number }}</span>
                </h4>
            </td>
            <td style="width: 33.33%; text-align: center;">
                <h4 style="color: #d1652b; margin: 0; text-align: center;">PAYMENT VOUCHER</h4>
                <p style="color: #888; font-size: 11px; margin: 2px 0 0; text-align: center;">(Sale Return Refund)</p>
            </td>
            <td style="color: #d1652b; width: 33.33%; text-align: right;">
                <h4>
                    <span class="voucher-text">Date</span>
                    <span style="color: black; border-bottom: 2px dotted #d1652b; direction: ltr;">{{ dateFormat($payment->payment_date) }}</span>
                </h4>
            </td>
        </tr>
    </table>
</div>

<div>
    <div>
        <h4 style="color: #d1652b; min-width: 70px; border-bottom: 2px dotted #d1652b; padding-bottom: 5px; margin: 5px 0;">
            Customer Name:
            <span style="color: black; margin-left: 20px; font-weight: bold;">{{ data_get($payment, 'saleReturn.customer.name', '—') }}</span>
        </h4>
    </div>
    <div>
        <h4 style="color: #d1652b; min-width: 70px; border-bottom: 2px dotted #d1652b; padding-bottom: 5px; margin: 5px 0;">
            Return No.:
            <span style="color: black; margin-left: 20px; font-weight: bold;">{{ data_get($payment, 'saleReturn.return_number') }}</span>
        </h4>
    </div>
    <div>
        <h4 style="color: #d1652b; min-width: 70px; border-bottom: 2px dotted #d1652b; padding-bottom: 5px; margin: 5px 0;">
            Bank Account:
            <span style="color: black; margin-left: 20px; font-weight: normal;">{{ data_get($payment, 'bankAccount.holder_name', '—') }}</span>
        </h4>
    </div>
</div>

<div>
    @php
        $saleReturn = $payment->saleReturn;
        $prevRefunded = $saleReturn->payments->where('id', '<', $payment->id)->sum('amount');
    @endphp

    {{-- Group items by line_number --}}
    @php
        $lineGroups = [];
        foreach ($saleReturn->items as $item) {
            $key = $item->line_number ?? 1;
            if (!isset($lineGroups[$key])) {
                $lineGroups[$key] = [
                    'source_type'  => $item->source_type ?? 'stock',
                    'batch_number' => $item->stockPurchase?->batch_number,
                    'items'        => [],
                ];
            }
            $lineGroups[$key]['items'][] = $item;
        }
        ksort($lineGroups);
        $groupedLines = array_values($lineGroups);
    @endphp

    {{-- Line Items --}}
    <table cellspacing="0" cellpadding="1"
           style="width: 100%; font-size: 11px; margin-top: 20px; border-collapse: collapse; table-layout: fixed;">
        <colgroup>
            <col style="width: 5%;">
            <col style="width: 55%;">
            <col style="width: 8%;">
            <col style="width: 16%;">
            <col style="width: 16%;">
        </colgroup>
        <thead>
        <tr style="background: #f5f5f5;">
            <th style="text-align: center; border: 1px solid #CCC; padding: 4px;"><strong>#</strong></th>
            <th style="text-align: left; border: 1px solid #CCC; padding: 4px;"><strong>Item</strong></th>
            <th style="text-align: center; border: 1px solid #CCC; padding: 4px;"><strong>Qty</strong></th>
            <th style="text-align: right; border: 1px solid #CCC; padding: 4px;"><strong>Unit Price</strong></th>
            <th style="text-align: right; border: 1px solid #CCC; padding: 4px;"><strong>Total</strong></th>
        </tr>
        </thead>
        <tbody>
        @foreach($groupedLines as $index => $group)
            @if($group['source_type'] === 'stock')
                @php $item = $group['items'][0]; @endphp
                <tr>
                    <td style="text-align: center; border: 1px solid #CCC; padding: 4px; vertical-align: top;">{{ $index + 1 }}</td>
                    <td style="border: 1px solid #CCC; padding: 4px;">
                        <strong>{{ $item->stock?->imei ?? 'N/A' }}</strong><br>
                        <span style="font-size: 10px; color: #666;">
                            {{ $item->stock?->product?->brand?->name }} {{ $item->stock?->product?->model }}
                            @if($item->stock?->condition?->name)
                                &middot; {{ $item->stock->condition->name }}
                            @endif
                        </span>
                    </td>
                    <td style="text-align: center; border: 1px solid #CCC; padding: 4px; vertical-align: top;">1</td>
                    <td style="text-align: right; border: 1px solid #CCC; padding: 4px; vertical-align: top;">{{ priceFormat($item->return_price, 2, '') }}</td>
                    <td style="text-align: right; border: 1px solid #CCC; padding: 4px; vertical-align: top;"><strong>{{ priceFormat($item->return_price, 2, '') }}</strong></td>
                </tr>
            @else
                @php
                    $firstItem = $group['items'][0];
                    $qty = count($group['items']);
                    $total = $firstItem->return_price * $qty;
                    $imeis = implode(', ', array_map(fn($i) => $i->stock?->imei ?? 'N/A', $group['items']));
                @endphp
                <tr>
                    <td style="text-align: center; border: 1px solid #CCC; padding: 4px; vertical-align: top;">{{ $index + 1 }}</td>
                    <td style="border: 1px solid #CCC; padding: 4px;">
                        <div>
                            <span style="background: #dbeafe; color: #1d4ed8; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 3px;">GLOT</span>
                            <strong style="margin-left: 4px;">{{ $group['batch_number'] }}</strong>
                        </div>
                        <div style="font-size: 10px; color: #666; margin-top: 2px;">{{ $imeis }}</div>
                    </td>
                    <td style="text-align: center; border: 1px solid #CCC; padding: 4px; vertical-align: top;">{{ $qty }}</td>
                    <td style="text-align: right; border: 1px solid #CCC; padding: 4px; vertical-align: top;">{{ priceFormat($firstItem->return_price, 2, '') }}</td>
                    <td style="text-align: right; border: 1px solid #CCC; padding: 4px; vertical-align: top;"><strong>{{ priceFormat($total, 2, '') }}</strong></td>
                </tr>
            @endif
        @endforeach
        </tbody>
    </table>

    {{-- Payment Summary --}}
    <table cellspacing="0" cellpadding="1"
           style="width: 100%; font-size: 12px; margin-top: 15px; border-collapse: collapse; table-layout: fixed;">
        <colgroup>
            <col style="width: 22%;">
            <col style="width: 20%;">
            <col style="width: 22%;">
            <col style="width: 18%;">
            <col style="width: 18%;">
        </colgroup>
        <thead>
        <tr style="background: #f5f5f5;">
            <th style="text-align: center; border: 1px solid #CCC; padding: 5px;"><strong>Return No.</strong></th>
            <th style="text-align: center; border: 1px solid #CCC; padding: 5px;"><strong>Total Amount</strong></th>
            <th style="text-align: center; border: 1px solid #CCC; padding: 5px;"><strong>Prev. Refunded</strong></th>
            <th style="text-align: center; border: 1px solid #CCC; padding: 5px;"><strong>This Refund</strong></th>
            <th style="text-align: center; border: 1px solid #CCC; padding: 5px;"><strong>Balance Due</strong></th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td style="text-align: center; border: 1px solid #CCC; padding: 4px;">{{ $saleReturn->return_number }}</td>
            <td style="text-align: center; border: 1px solid #CCC; padding: 4px;">{{ priceFormat($saleReturn->total_amount, 2, '') }}</td>
            <td style="text-align: center; border: 1px solid #CCC; padding: 4px;">{{ priceFormat($prevRefunded, 2, '') }}</td>
            <td style="text-align: center; border: 1px solid #CCC; padding: 4px;">{{ priceFormat($payment->amount, 2, '') }}</td>
            <td style="text-align: center; border: 1px solid #CCC; padding: 4px;">{{ priceFormat($saleReturn->total_due, 2, '') }}</td>
        </tr>
        </tbody>
    </table>
</div>

<table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
    <tbody>
    <tr>
        <td style="width: 60%;"></td>
        <td style="width: 40%; text-align: right;">
            <table class="add-border" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="text-align: center; padding: 8px; border: 1px solid #CCC; width: 55%;">
                        <strong>TOTAL REFUNDED</strong>
                    </td>
                    <td style="text-align: right; padding: 8px; border: 1px solid #CCC; width: 45%;">
                        AED: {{ priceFormat($payment->amount, 2, '') }}
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    </tbody>
</table>

<h4 style="color: #d1652b; border-bottom: 2px dotted #d1652b; margin-top: 20px;">
    Note:
    @if(!empty($payment->notes))
        <span style="color: black;">{{ $payment->notes }}</span>
    @endif
</h4>

<br><br><br>

<div style="clear: both; width: 100%; padding: 0; margin-top: 5px;">
    <table style="margin-top: 30px; width: 100%;">
        <tr>
            <td style="color: #d1652b;">
                <h4 style="border-top: 2px dotted #d1652b; margin: 0;">
                    Authorized Sign
                </h4>
            </td>
            <td style="color: #d1652b; text-align: right; padding-right: 0;">
                <h4 style="border-top: 2px dotted #d1652b; margin: 0;">
                    Receiver Sign
                </h4>
            </td>
        </tr>
    </table>
</div>
<br><br>

{{--footer--}}
<div style="border-top: 4px solid #403a94;">
    <div style="margin-top: 5px;">
        <div style="font-size: 13px; margin-bottom: 0; text-align: center;">{{ config('setting.basic_information.contact_number') . config('setting.basic_information.address') }}</div>
        <div style="font-size: 13px; margin-bottom: 0; margin-top: 5px; text-align: center;">{{ config('setting.basic_information.contact_site') }}</div>
    </div>
</div>
{{--footer--}}
</body>
</html>
