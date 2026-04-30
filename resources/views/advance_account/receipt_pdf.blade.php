<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Advance {{ $advanceAccount->amount > 0 ? 'Received' : 'Payment' }} Voucher</title>

    <style>
        body {
            font-family: "Times New Roman", Serif, serif;
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
            font-weight: normal;
        }

        .fw-normal {
            font-weight: normal;
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
                    <strong>Generated
                        AT:
                        {{ isset($advanceAccount) ? \Illuminate\Support\Carbon::parse($advanceAccount->created_at)->format('d/m/Y H:i:s') : now()->format('d/m/Y H:i:s') }}</strong>
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
                    <img width="140" src="{{ config('setting.basic_information.logo') }}">
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
    <table style="width: 100%;">
        <tr>
            <td>
                <table style="border: 2px solid #d1652b">
                    <tr>
                        <td style="width: 100px; padding: 10px; border-right: 2px solid #d1652b; font-weight: bold;">
                            {{ priceFormat(abs($advanceAccount->amount), 0, '') }}
                        </td>
                        <td style="width: 40px; padding: 10px">
                            AED
                        </td>
                    </tr>
                </table>
            </td>
            <td style="text-align: center">
                <table>
                    <tr>
                        <td>
                            <h3 style="color: #d1652b">{{ $advanceAccount->amount > 0 ? 'RECEIPT' : 'PAYMENT'}}
                                VOUCHER</h3>
                        </td>
                    </tr>
                </table>

            </td>
            <td class="text-right" style=" color: #d1652b;">
                <h3 class="pb-3">NO.: <span style="color: black; border-bottom: 2px dotted  #d1652b;">{{ $advanceAccount->voucher_number }}</span>
                </h3>
            </td>
        </tr>
    </table>
</div>

<br>
<br>

<div style="color: #333; text-align: right;">
    <table style="width: 100%;">
        <tr>
            <td style=" text-align: right; padding-right: 0; margin-right: 0;  color: #d1652b; ">
                <h3>
                    <span style=" color: #d1652b;">DATE :</span>
                </h3>
            </td>

            <td style="width: 10px; text-align: right;  ">
                <span style="color: black; border-bottom: 2px dotted #d1652b; font-size: 16px; font-weight: bold; ">{{ dateFormat($advanceAccount->date) }}</span>
            </td>
        </tr>
    </table>
</div>

<div style="padding: 10px">
    <div>
        <h4 style="color: #d1652b; min-width: 70px; border-bottom: 2px dotted #d1652b; ">
            ACCOUNT NAME:
            <span style="color: black; margin-left: 20px; font-weight: bold;">{{ data_get($advanceAccount, 'customer.name')  }}</span>
        </h4>
    </div>
    <div>
        <h4 style="color: #d1652b; min-width: 70px; border-bottom: 2px dotted #d1652b; ">
            {{ $advanceAccount->amount > 0 ? "RECEIVED FROM" : "PAID TO" }}:
        </h4>
    </div>
    <div>
        <h4 class="arabic-text" style="color: #d1652b; min-width: 650px; border-bottom: 2px dotted  #d1652b; ">
            <table>
                <tr>
                    <td style="color: #d1652b; padding-right: 0; margin-right: 0;">
                        <h4 style="padding-right: 0; margin-right: 0;">AMOUNT: <span style="color: #000000;">{{ priceFormat(abs($advanceAccount->amount), 2, '') }}</span></h4>
                    </td>
                </tr>
            </table>

        </h4>
    </div>
    <div>
        <h4 class="mb-3" style="color: #d1652b; min-width: 650px;">
            DESCRIPTION:
            <span style="color: black; margin-left: 20px; border-bottom: 2px dotted #d1652b; display: inline; padding-bottom: 5px;"> {{ $advanceAccount->note }}</span>
        </h4>
        @if(empty($advanceAccount->note))
        <div style="border-top: 2px dotted #d1652b; margin-top: -22px"></div>
        @endif

    </div>
</div>
@if($advanceAccount->amount > 0)
    <img style="z-index: -100; position: absolute; width: 150px;
        margin-top: -20px;
        padding-left: 44%;" src="https://olfat-auction.blr1.cdn.digitaloceanspaces.com/assets/received_watter_mark.png"
         alt="Received">
@endif

<div style="width: 100%; padding: 10px;">
    <table style="margin-top: 20px; margin-bottom: 10px; width: 100%;">
        @if($advanceAccount->amount > 0)
            <tr>
                <td style=" color: #d1652b; text-align: left; height: 70px;  vertical-align:  bottom;">
                    <h4 style="width: 130px; text-align: center;">
                        <div class="voucher-text-container">
                            <span class="voucher-text" style="border-top: 2px dotted #d1652b;">Receiver Sign</span>
                            <br>
                        </div>
                    </h4>
                </td>
                <td style=" color: #d1652b; text-align: right; height: 70px;  vertical-align:  bottom;">
                    <h4 style="width: 130px; text-align: center; vertical-align:  sub;">
                        <div class="voucher-text-container">
                            <span class="voucher-text" style="border-top: 2px dotted #d1652b;">Payer Sign</span>
                            <br>
                        </div>
                    </h4>
                </td>
            </tr>
        @endif
        @if($advanceAccount->amount < 0)
            <tr>
                <td style="width: 33.33%; color: #d1652b;  vertical-align: bottom; height:70px;">
                    <h4 style="width: 130px; text-align: center;">
                        <div class="voucher-text-container">
                            <span class="voucher-text" style="border-top: 2px dotted #d1652b;">Authorized By</span>
                            <br>
                        </div>
                    </h4>
                </td>
                <td style="width: 33.33%; color: #d1652b;text-align: center; vertical-align: bottom; height:70px;">
                    <h4 style="width: 130px; text-align: center; display: inline-block;">
                        <div class="voucher-text-container">
                            <span class="voucher-text" style="border-top: 2px dotted #d1652b;">Payer Sign</span>
                            <br>
                        </div>
                    </h4>
                </td>
                <td style="width: 33.34%; color: #d1652b; text-align: right; vertical-align: bottom; height:70px;">
                    <h4 style="width: 140px; text-align: center; display: inline-block;">
                        <div class="voucher-text-container">
                            <span class="voucher-text" style="border-top: 2px dotted #d1652b;">Receiver Sign</span>
                            <br>
                        </div>
                    </h4>
                </td>
            </tr>
        @endif
    </table>
</div>

{{--footer--}}
<div style="border-top: 4px solid #403a94;">
    <div style="margin-top: 5px;">
        <div style="font-size: 13px; margin-bottom: 0; text-align: center" >{{ config('setting.basic_information.contact_number') }} {{ config('setting.basic_information.address') }}</div>
        <div style="font-size: 13px; margin-bottom: 0; margin-top: 5px; text-align: center" >{{ config('setting.basic_information.contact_site') }}</div>
    </div>
</div>

{{--footer--}}
</body>
</html>
