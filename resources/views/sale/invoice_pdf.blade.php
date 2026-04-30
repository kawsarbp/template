@php use App\Enums\PaymentStatus; @endphp
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Invoice - {{ $sale->sale_number }}</title>
    <style>

        body {
            font-family: "Lato", sans-serif;
            margin: 0;
        }

        tr, td {
            margin: 0;
            padding: 2px;
        }

        table {
            border-collapse: collapse;
        }

        .invoice-logo {
            width: 140px;
            height: 80px;
        }

        .font-color {
            color: #1e1e1e;
        }

        .font-bold {
            font-weight: bold;
        }

        .font-14 {
            font-size: 14px;
        }

        .text-left {
            text-align: left;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .table-padding {
            padding: 7px 0;
        }

        .footer-bg {
            background: #82c8e5;
        }

        .text-white {
            color: #ffffff;
        }

        .glot-row {
            background-color: #eff6ff;
        }

        .glot-badge {
            background-color: #dbeafe;
            color: #1d4ed8;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 6px;
        }

        .imei-list {
            font-size: 10px;
            color: #6b6b6b;
            margin-top: 2px;
        }
    </style>
</head>
<body>

<table style="width: 100%;">
    <tr>
        <td style="width: 40%;">
            <img class="invoice-logo"
                 src="{{ config('setting.basic_information.logo') }}" alt="logo">
        </td>
        <td style="width: 60%; text-align:right;">
            <div class="font-color" style="font-size: 22px;">INVOICE: {{ $sale->sale_number }}</div>
        </td>
    </tr>
</table>

<br>

<table style="width: 100%;" class="font-14">
    <tr>
        <td style="width: 62%; vertical-align: top;">
            <div class="font-bold">Bill To:</div>
            <div class="font-bold">{{ $sale->customer?->name ?? __('Walk-in Customer') }}</div>
            <br>
            <div class="font-bold">Sale Date:</div>
            <div style="margin-bottom: 5px;">{{ dateFormat($sale->sale_date) }}</div>

            <div class="font-bold">Payment Status:</div>
            <div>{{ $sale->payment_status?->getLabel() }}</div>
        </td>
    </tr>
</table>

<br><br>

{{-- Line Items --}}
@php
    $lineGroups = [];
    foreach ($sale->items as $item) {
        $key = $item->line_number;
        if (!isset($lineGroups[$key])) {
            $lineGroups[$key] = [
                'source_type' => $item->source_type ?? 'stock',
                'batch_number' => $item->stockPurchase?->batch_number,
                'items' => [],
            ];
        }
        $lineGroups[$key]['items'][] = $item;
    }
    ksort($lineGroups);
    $lineNumber = 0;
@endphp

<table class="font-color" style="width: 100%; font-size: 12px;">
    <thead>
    <tr style="border-bottom: 1.5px solid #6f6f6f;">
        <th class="text-left table-padding" style="width: 30px;">#</th>
        <th class="text-left table-padding">ITEM</th>
        <th class="table-padding text-center">QUANTITY</th>
        <th class="text-right table-padding">UNIT PRICE</th>
        <th class="text-right table-padding">SUB TOTAL</th>
    </tr>
    </thead>
    <tbody>
        @foreach($lineGroups as $group)
            @php
                $lineNumber++;
                $isLast = $loop->last;
                $borderColor = $isLast ? '#6f6f6f' : '#919191';
            @endphp

            @if($group['source_type'] === 'glot')
                <tr style="border-bottom: 1.5px solid {{ $borderColor }};" class="font-14 glot-row">
                    <td class="table-padding">{{ $lineNumber }}</td>
                    <td class="table-padding">
                        <span class="glot-badge">GLOT</span>
                        <span class="font-bold" style="margin-left: 4px;">{{ $group['batch_number'] }}</span>
                        <div class="imei-list">
                            {{ implode(', ', array_map(fn($i) => $i->stock?->imei ?? 'N/A', $group['items'])) }}
                        </div>
                    </td>
                    <td class="table-padding text-center">{{ count($group['items']) }}</td>
                    <td style="padding: 7px 7px 7px 0;" class="text-right">{{ priceFormat((float) $group['items'][0]->sale_price, 2, '') }}</td>
                    <td style="padding: 7px 7px 7px 0;" class="text-right">{{ priceFormat((float) $group['items'][0]->sale_price * count($group['items']), 2, '') }}</td>
                </tr>
            @else
                @php $item = $group['items'][0]; @endphp
                <tr style="border-bottom: 1.5px solid {{ $borderColor }};" class="font-14">
                    <td class="table-padding">{{ $lineNumber }}</td>
                    <td class="table-padding">
                        <span class="font-bold">{{ $item->stock?->imei ?? 'N/A' }}</span>
                        <div class="imei-list">
                            {{ $item->stock?->product?->brand?->name }} {{ $item->stock?->product?->model }}
                            @if($item->stock?->condition)
                                &middot; {{ $item->stock->condition->name }}
                            @endif
                        </div>
                    </td>
                    <td class="table-padding text-center">1</td>
                    <td style="padding: 7px 7px 7px 0;" class="text-right">{{ priceFormat((float) $item->sale_price, 2,'') }}</td>
                    <td style="padding: 7px 7px 7px 0;" class="text-right">{{ priceFormat((float) $item->sale_price, 2, '') }}</td>
                </tr>
            @endif
        @endforeach
    </tbody>
</table>

<br>

<table class="font-color font-14" style="width: 100%;">
    <tr>
        <td style=" width: 30%;">
            <div class="font-bold" style="margin-bottom: 8px;">
                <span style="margin-right: 20px;">Total Amount:</span>
                <span>{{ priceFormat($sale->total_amount) }}</span>
            </div>
            <div class="font-bold" style="margin-bottom: 8px;">
                <span style="margin-right: 20px;">Total Payment:</span>
                <span>{{ priceFormat($sale->total_paid) }}</span>
            </div>
            <div style="margin-bottom: 8px;">
                <span style="margin-right: 18px;">Total Due:</span>
                <span> {{ priceFormat($sale->total_due) }}</span>
            </div>
        </td>

        <td style="width: 30%; vertical-align: top;">
            @if($sale->payment_status === PaymentStatus::PAID)
                <div>
                    <img style="width: 120px; padding-left: 30px;" src="{{ config('setting.basic_information.paid_watter_mark') }}" alt="Paid">
                </div>
            @endif
        </td>

        <td style="width: 30%; vertical-align: top;">
            <div style="margin-bottom: 8px;">
                <span class="font-bold">Subtotal: </span>
                <span style="float:right;">{{ priceFormat($sale->total_amount) }}</span>
            </div>
            <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 2px solid #919191;">
                <span class="font-bold">Discount: </span>
                <span style="float:right;">{{ priceFormat($sale->discount) }}</span>
            </div>
            <div>
                <span class="font-bold">Total: </span>
                <span class="font-bold"
                      style="float:right;">{{ priceFormat($sale->total_amount - $sale->discount) }}</span>
            </div>
        </td>
    </tr>
</table>

<br>
@if(!empty($sale->notes))
    <div class="font-color font-14"><strong>Note: </strong> {{ $sale->notes }}</div>
@endif
<br>

<div style="position: fixed; bottom: 0; width: 100%;">
    <table class="footer-bg text-white" style="width: 100%; font-size: 12px; padding: 12px 0;">
        <tr>
            <td style="width: 25%; text-align:center;">
                <img style="width: 12px; height: 12px; "
                     src="https://olfat-auction.blr1.cdn.digitaloceanspaces.com/assets/phone_icon.png" alt="">

                <span style="margin-left: 2px;">{{ config('setting.basic_information.mobile') }}</span>
            </td>
            <td style="width: 50%; text-align:center;">
                <img style="width: 15px; height: 15px; "
                     src="https://olfat-auction.blr1.cdn.digitaloceanspaces.com/assets/location_icon.png" alt="">

                <span>{{ config('setting.basic_information.address') }}</span>
            </td>
            <td style="width: 25%; text-align:center;">
                <img style="width: 11px; height: 11px; "
                     src="https://olfat-auction.blr1.cdn.digitaloceanspaces.com/assets/globe_icon.png" alt="">

                <span style="margin-left: 4px;">{{ config('setting.basic_information.website') }}</span>
            </td>
        </tr>
    </table>
</div>

</body>
</html>
