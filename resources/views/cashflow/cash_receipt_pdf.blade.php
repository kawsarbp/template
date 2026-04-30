@php use App\Enums\CashflowType; @endphp
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
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

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .pb-5 {
            padding-bottom: 5px;
        }

        .pb-3 {
            padding-bottom: 3px;
        }
        .arabic-text {
            font-family: "Tajawal", sans-serif;
        }

        .fw-normal {
            font-weight: normal;
        }
    </style>
    <title>Cashflow PDF</title>
</head>

<body>
@include('partials.voucher_header', ['cashflowTransaction' => $cashflowTransaction])

<div>
    <table style="width: 100%;">
        <tr>
            <td style="width: 33.33%;">
                <table style="border: 2px solid #d1652b">
                    <tr>
                        <td style="width: 100px; padding: 10px; border-right: 2px solid #d1652b; font-weight: bold;">
                            {{ priceFormat($cashflowTransaction->amount, 2, '') }}
                        </td>
                        <td style="width: 40px; padding: 10px">
                            AED
                        </td>
                    </tr>
                </table>
            </td>
            <td style=" text-align:center; width: 33.33%;">
                <table>
                    <tr>
                    </tr>
                    <tr>
                        <td style="text-align: center">
                            <h3 style="color: #d1652b">
                                {{ $cashflowTransaction->type == CashflowType::CASH_IN ? 'RECEIPT' : 'PAYMENT' }} VOUCHER
                            </h3>
                        </td>
                    </tr>
                </table>
            </td>
            <td class="text-right" style=" color: #d1652b; width: 33.33%;">
                <h3 class="pb-3">
                    <span style="font-size: 14px;">NO.</span>:
                    <span style="color: black; border-bottom: 2px dotted #d1652b; font-size: 14px;">{{ $cashflowTransaction->voucher_number }}</span>
                </h3>
            </td>
        </tr>
    </table>
</div>
<br>
<br>
<div style="color: #d1652b; text-align: right;">
    <table style="width: 100%;">
        <tr>
            <td style=" text-align: right; padding-right: 0; margin-right: 0;  color: #d1652b; ">
                <h3>
                    <span style=" color: #d1652b;font-size: 14px;">DATE :</span>
                </h3>
            </td>

            <td style="width: 10px; text-align: right;  ">
                <span
                    style="color: black; border-bottom: 2px dotted #d1652b; font-size: 14px; font-weight: bold; ">{{ dateFormat($cashflowTransaction->date) }}</span>
            </td>
        </tr>
    </table>
</div>

<div>
    <div>
        @php
            $customerLabel = $cashflowTransaction->type == CashflowType::CASH_IN ? "RECEIVED FROM" : "PAID TO";
        @endphp
        <h4 class="pb-3 "
            style="color: #d1652b; min-width: 70px; border-bottom: 2px dotted #d1652b; ">
            {{$customerLabel}} : <span style="color: black; padding-left: 20px; font-weight: bold; font-size: 14px;">{{ data_get($cashflowTransaction, 'name')  }}</span>
        </h4>
    </div>
    <div>
        <h4 class="pb-3" style="color: #d1652b; min-width: 650px; border-bottom: 2px dotted #d1652b;">
            AMOUNT : <span style="font-weight: bold; color: black; padding-left: 20px;">{{ priceFormat($cashflowTransaction->amount) }}</span>
        </h4>
    </div>
    <div>
        <h4 class="" style="color: #d1652b; min-width: 650px; font-size: 14px;">
            DESCRIPTION : <span style="font-weight: normal; color: black; margin-left: 20px; display: inline; line-height: 1.6; border-bottom: 2px dotted #d1652b; font-size: 13px;"> {{ $cashflowTransaction->description }} </span>
        </h4>
        @if(empty($cashflowTransaction->description))
            <div class="" style=" border-bottom: 2px dotted #d1652b; margin-top: -23px"></div>
        @endif
    </div>
</div>
@if($cashflowTransaction->type == CashflowType::CASH_IN)
    <img style="z-index: -100; position: absolute; width: 150px;
        margin-top: -20px;
        padding-left: 44%;" src="https://olfat-auction.blr1.cdn.digitaloceanspaces.com/assets/received_watter_mark.png"
         alt="Received">
@endif

<div class="" style="width: 100%; padding: 10px; margin-top: 30px">
    <table style="margin-top: 20px; margin-bottom: 10px; width: 100%;">

        {{--Receipt Voucher--}}
        @if($cashflowTransaction->type == CashflowType::CASH_IN)
            <tr>
                <td style=" color: #d1652b; text-align: left; height: 70px;  vertical-align:  bottom;">
                    <h4 style="width: 130px; text-align: center;">
                        <div class="voucher-text-container">
                            <span class="voucher-text" style="border-top: 2px dotted #d1652b;">Receiver Sign</span>
                        </div>
                    </h4>
                </td>
                <td style="color: #d1652b; text-align: right; height: 70px; vertical-align:  bottom;">
                    <h4 style="width: 130px; text-align: center; vertical-align:  sub;">
                        <div class="voucher-text-container">
                            <span class="voucher-text" style="border-top: 2px dotted #d1652b;">Payer Sign</span>
                        </div>
                    </h4>
                </td>
            </tr>
        @endif
        {{--End Receipt Voucher--}}
        @if($cashflowTransaction->type == CashflowType::CASH_OUT)
            <tr>
                <td style="width: 33.33%; color: #d1652b;  vertical-align: bottom; height:70px;">
                    <h4 style="width: 130px; text-align: center;">
                        <div class="voucher-text-container">
                            <span class="voucher-text" style="border-top: 2px dotted #d1652b;">Authorized By</span>
                        </div>
                    </h4>
                </td>

                <td style="width: 33.33%; color: #d1652b;text-align: center; vertical-align: bottom; height:70px;">
                    <h4 style="width: 130px; text-align: center; display: inline-block;">
                        <div class="voucher-text-container">
                            <span class="voucher-text" style="border-top: 2px dotted #d1652b;">Payer Sign</span>
                        </div>
                    </h4>
                </td>
                <td style="width: 33.34%; color: #d1652b; text-align: right; vertical-align: bottom; height:70px;">
                    <h4 style="width: 140px; text-align: center; display: inline-block;">
                        <div class="voucher-text-container">
                            <span class="voucher-text" style="border-top: 2px dotted #d1652b;">Receiver Sign</span>
                        </div>
                    </h4>
                </td>
            </tr>
        @endif
    </table>
</div>

@include('partials.voucher_footer')
</body>
</html>

