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

        table.add-border-2 td {
            border: 1px solid #CCC;
            padding-left: 3px;
        }

        tfoot tr:first-of-type {
            border-bottom: 1px solid var(--theme-color);
        }

        .arabic-text {
            font-family: "Tajawal", sans-serif;
            font-weight: 400;
        }

        .voucher-text {
            font-family: "Times New Roman", serif;
            font-size: 16px;
            margin-bottom: 2px;
        }

        .voucher-text.arabic {
            font-family: "Tajawal", sans-serif;
            font-size: 16px;
            text-align: right;
            margin-top: -4px;
            font-weight: normal;
        }

        .voucher-text.arabic2 {
            font-family: "Tajawal", sans-serif;
            font-size: 16px;
            margin-top: -4px;
            font-weight: normal;
        }
        .voucher-text {
            font-family: "Times New Roman", serif;
            font-size: 16px;
            margin-bottom: 2px;
        }
        .arabic-text {
            font-family: "Tajawal", sans-serif;
            text-align: right;
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
                    <strong>
                        Generated AT: {{ isset($salePayment) ? dateTimeFormat($salePayment->created_at) : dateTimeFormat(now()) }}</strong>
                </small>
            </td>
        </tr>
    </table>
</header>
<div>
    <table width="100%">
        <tr>
            <td>
                <div class="">
                    <img width="140"
                         src="{{ config('setting.basic_information.logo') }}">
                </div>
            </td>
            <td align="right">
                <div style="color: #d1652b; font-size: 18px;">
                    <h2 style="">{{ config('setting.basic_information.company_name') }}</h2>
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
                    <span style="color: black; border-bottom: 2px dotted #d1652b">{{ $salePayment->voucher_number }}</span>
                </h4>
            </td>
            <td style="width: 33.33%; text-align:center;">
                <h4 style="color: #d1652b; margin: 0; text-align: center;">RECEIPT VOUCHER</h4>
            </td>
            <td style="color: #d1652b; width: 33.33%; text-align:right;">
                <h4>
                    <span class="voucher-text">Date</span> <span style="color: black; border-bottom: 2px dotted #d1652b; direction: ltr;">{{ dateFormat($salePayment->payment_date) }}</span>
                </h4>
            </td>
        </tr>
    </table>
</div>

<div>
    <div class="">
        <h4 style="color: #d1652b; min-width: 70px; border-bottom: 2px dotted #d1652b; padding-bottom: 5px; margin: 5px 0;">
            Customer Name:
            <span style="color: black; margin-left: 20px; font-weight: bold;">{{ data_get($salePayment, 'sale.customer.name')  }}</span>
        </h4>
    </div>
    <div class="">
        <h4 style="color: #d1652b; min-width: 70px; border-bottom: 2px dotted #d1652b; padding-bottom: 5px; margin: 5px 0;">
            Received From:
            <span style="color: black; margin-left: 20px; font-weight: bold;">{{ data_get($salePayment, 'received_from')  }}</span>
        </h4>
    </div>
    <div class="">
        <h4 style="color: #d1652b; min-width: 70px; margin: 5px 0; ">
            Description:
            <span style="font-weight: normal; color: black; margin-left: 20px; display: inline; line-height: 1.6; border-bottom: 2px dotted #d1652b;"></span>
        </h4>
        <div class="" style=" border-bottom: 2px dotted #d1652b; margin-top: -23px"></div>
    </div>
</div>

<div>
    <table cellspacing="0" cellpadding="1"
           style="width: 100%; font-size: 12px; margin-top: 20px; border-collapse: collapse;">
        <thead>
        <tr>
            <th class="arabic-text" style="text-align: center;">
                <strong>SL</strong>
            </th>
            <th class="arabic-text" style="text-align: center;">
                <strong>SALE. NO.</strong>
            </th>
            <th class="arabic-text" style="text-align: center;">
                <strong>Total Amount</strong>
            </th>
            <th class="arabic-text" style="text-align: center;">
                <strong>Prev. Paid</strong>
            </th>
            <th class="arabic-text" style="text-align: center;">
                <strong>Paid Amount</strong>
            </th>
            <th class="arabic-text" style="text-align: center;">
                <strong>Balance</strong>
            </th>
        </tr>
        </thead>

        <tbody>
        @php $totalAmount = 0;  @endphp
        @foreach($paymentData as $key => $value)
            @php
                $totalAmount += $value->amount;
            @endphp
            <tr>
                <td colspan="8">
                    <hr style="background: #CCC; margin: 0;">
                </td>
            </tr>
            <tr>
                <td style="text-align: center;"><strong>{{ $key + 1 }}</strong></td>
                <td style="text-align: center;">{{ $value->sale->sale_number }}</td>
                <td style="text-align: center;">{{ priceFormat($value->sale->total_amount,2,'') }}</td>
                <td style="text-align: center;">{{priceFormat($value->sale->payments->where('id', '<', $value->id)->sum('amount')) }}</td>
                <td style="text-align: center;">{{ priceFormat($value->amount, 2, '') }}</td>
                <td style="text-align: center;">{{ priceFormat($value->sale->total_due, 2, '') }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>

</div>

<table style="width: 100%;">
    <tbody>
    <tr>
        <td style="padding-left: 200px; padding-top: 15px;">
            <div>
                <img style="z-index: -100; width: 150px; margin-top: -20px;" src="https://olfat-auction.blr1.cdn.digitaloceanspaces.com/assets/received_watter_mark.png" alt="Received">
            </div>
        </td>

        <td style=" padding-left: 20px; padding-top: -30px; padding-right: 0;">
            <div style="">
                <table class="add-border" style="padding-left: 100px; width: 350px;">
                    <tr>
                        <td rowspan="2" style="text-align: center; padding: 10px;">
                            TOTAL PAID
                        </td>
                        <td style="text-align: right; padding-right: 5px;">
                            AED: {{ priceFormat($totalAmount, 2, '') }}</td>
                    </tr>
                </table>
            </div>
        </td>
    </tr>
    </tbody>
</table>

<h4 style="color: #d1652b; border-bottom: 2px dotted #d1652b;">
    Note : @if(!empty($salePayment->notes))
        <span style="color: black; ">{{ $salePayment->notes }} </span>
    @endif
</h4>
<br>
<br>
<br>
<br>
<div style="clear:both; width: 100%; padding: 0; margin-top: 5px;">
    <table style="margin-top: 30px; width: 100%;">
        <tr>
            <td style=" color: #d1652b;">
                <h4 style=" border-top: 2px dotted  #d1652b; margin: 0;">
                    Receiver Sign
                </h4>
            </td>
            <td style=" color: #d1652b; text-align: right;  padding-right: 0;">
                <h4 style="border-top: 2px dotted  #d1652b; margin: 0;">
                    Payer Sign
                </h4>
            </td>
        </tr>
    </table>
</div>
<br><br>


{{--footer--}}
<div style="border-top: 4px solid #403a94;">
    <div style="margin-top: 5px;">
        <div style="font-size: 13px; margin-bottom: 0; text-align: center" >{{ config('setting.basic_information.contact_number'). config('setting.basic_information.address') }}</div>
        <div style="font-size: 13px; margin-bottom: 0; margin-top: 5px; text-align: center" >{{ config('setting.basic_information.contact_site') }}</div>
    </div>
</div>
{{--footer--}}
</body>
</html>
