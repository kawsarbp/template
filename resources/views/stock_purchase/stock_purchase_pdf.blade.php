@php
    use App\Enums\PaymentStatus;
    $currency = $stockPurchase->currency ?? 'AED';
@endphp
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Stock Purchases PDF</title>
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
            <div class="font-color" style="font-size: 22px;">BILL: {{ $stockPurchase->batch_number }}</div>
        </td>
    </tr>
</table>

<br>

<table style="width: 100%;" class="font-14">
    <tr>
        <td style="width: 62%; vertical-align: top;">
            <div class="font-bold">Bill From:</div>
            <div class="font-bold">{{ $stockPurchase->supplier?->name }}</div>
            <br>
            <div class="font-bold">Purchase Date:</div>
            <div style="margin-bottom: 5px;">{{ dateFormat($stockPurchase->purchase_date) }}</div>

            <div class="font-bold">Payment Status:</div>
            <div>{{ $stockPurchase->payment_status->getLabel() }}</div>
        </td>
    </tr>
</table>

<br><br>

<table class="font-color" style="width: 100%; font-size: 12px; table-layout: fixed;">
    <thead>
    <tr style="border-bottom: 1.5px solid #6f6f6f;">
        <th class="text-left table-padding">PRODUCT</th>
        <th class="text-center table-padding"  style="width: 40%; word-wrap: break-word;">IMEI</th>
        <th class="table-padding">QUANTITY</th>
        <th class="text-right table-padding">UNIT PRICE</th>
        <th class="text-right table-padding">SUB TOTAL</th>
    </tr>
    </thead>
    <tbody>
        @foreach($stockPurchase->items as $key => $item)
            <tr style="border-bottom: 1.5px solid {{ count($stockPurchase->items) - 1 == $key ? '#6f6f6f':'#919191' }};" class="font-14">
                <td class="table-padding">{{ $item->product?->title }}</td>
                <td class="table-padding text-center" style="width: 40%; word-wrap: break-word;">{{ $item->stocks->pluck('imei')->implode(',') }}</td>
                <td class="table-padding text-center">{{ $item->quantity }}</td>
                <td style="padding: 7px 7px 7px 0;" class="text-right"> {{ $item->unit_price }} </td>
                <td style="padding: 7px 7px 7px 0;" class="text-right"> {{ ($item->unit_price * $item->quantity) }} </td>
            </tr>
        @endforeach
    </tbody>
</table>

<br>

<table class="font-color font-14" style="width: 100%;">
    <tr>
        <td style=" width: 30%;">
            <div class="font-bold" style="margin-bottom: 8px;">
                <span style="margin-right: 20px;">Total Amount:</span>
                <span>{{ priceFormat($stockPurchase->total_amount, 2, $currency) }}</span>
            </div>
            <div class="font-bold" style="margin-bottom: 8px;">
                <span style="margin-right: 20px;">Total Payment:</span>
                <span>{{ priceFormat($stockPurchase->total_paid, 2, $currency) }}</span>
            </div>
            <div style="margin-bottom: 8px;">
                <span style="margin-right: 18px;">Total Due:</span>
                <span> {{ priceFormat($stockPurchase->total_due, 2, $currency) }}</span>
            </div>
        </td>

        <td style="width: 30%; vertical-align: top;">
            @if($stockPurchase->payment_status === PaymentStatus::PAID)
                <div>
                    <img style="width: 120px; padding-left: 30px;" src="{{ config('setting.basic_information.paid_watter_mark') }}" alt="Paid">
                </div>
            @endif
        </td>

        <td style="width: 30%; vertical-align: top;">
            <div style="margin-bottom: 8px;">
                <span class="font-bold">Subtotal: </span>
                <span style="float:right;">{{ priceFormat($stockPurchase->total_amount, 2, $currency) }}</span>
            </div>
            <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 2px solid #919191;">
                <span class="font-bold">Discount: </span>
                <span style="float:right;">{{ priceFormat($stockPurchase->discount, 2, $currency) }}</span>
            </div>
            <div>
                <span class="font-bold">Total: </span>
                <span class="font-bold"
                      style="float:right;">{{ priceFormat($stockPurchase->total_amount - $stockPurchase->discount, 2, $currency) }}</span>
            </div>
        </td>
    </tr>
</table>

<br>
@if(!empty($stockPurchase->notes))
    <div class="font-color font-14"><strong>Note: </strong> {{ $stockPurchase->notes }}</div>
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
