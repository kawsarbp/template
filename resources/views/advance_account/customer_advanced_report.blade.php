<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap"
        rel="stylesheet">
<title>customer advance report</title>
    <style>
        * {
            font-family: "Poppins", sans-serif;
        }

        .h1,
        .h2,
        .h3,
        .h4,
        .h5,
        .h6,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
            margin-top: 0;
            margin-bottom: 8px;
            font-weight: 500;
            line-height: 1.2;
        }

        h4 {
            font-size: 18px;
        }

        h5 {
            font-size: 16px;
        }

        .pt-5 {
            padding-top: 48px;
        }

        .mb-4 {
            margin-bottom: 25px;
            padding: 0px 5px;
        }

        table {
            caption-side: bottom;
            border-collapse: collapse;
        }

        table tr td {
            border: 1px solid black;
        }

        table tr td {
            /*border: 1px solid rgb(222, 226, 230);*/
            padding: 4px;
            font-size: 10px;
        }


        .border-light td {
            border: 1px solid #afa8a8;
        }

        .heading td {
            font-size: 14px;
            text-align: center;
        }

        .heading.text-left td {
            text-align: left;
        }

        .text-center {
            text-align: center;
        }

        .text-left {
            text-align: left;
        }

        .text-right {
            text-align: right;
        }

        .tr-text-right td {
            text-align: right;
        }
    </style>

</head>

<body class="">
<div class="bill-preview-main" id="boxes" style="margin: 0 auto; width: 100%; box-shadow: 0 0 10px #ddd">
    <div class="text-center">
        <h4>
            <strong>{{ config('setting.basic_information.company_name') }}</strong>
        </h4>
        <h5>
            <strong>Customer Balance Report</strong>
        </h5>
        <h5>
            <strong>{{ $customerName }}</strong>
        </h5>
    </div>
    <div>
        <div style="margin: 0 auto">
            <table style="margin-top: 10px">
                <tbody>
                <tr style=" font-size: 12px; font-weight: bold; letter-spacing: 0.7px; text-transform: uppercase; border: 1px solid white">
                    <td>DATE</td>
                    <td>VOUCHER NO.</td>
                    <td>DESCRIPTION</td>
                    <td>MODE OF PAYMENT</td>
                    <td>AMOUNT RECEIVED</td>
                    <td>ADVANCE UTILIZED</td>
                    <td>BALANCE</td>
                </tr>
                @foreach($customerReport as $key => $account)
                    <tr width="100%">
                        <td style="width: 60px"> {{ dateFormat($account->date) }}</td>
                        <td style="width: 60px">{{ $account->voucher_number }}</td>
                        <td>{{ $account->note }}</td>
                        <td style="width: 90px">{!! data_get($account, 'bank_account.holder_name') !!}</td>
                        <td class="text-right">
                            @if($account->amount > 0)
                                {{ priceFormat($account->amount) }}
                            @else
                                0
                            @endif
                        </td>
                        <td class="text-right">
                            @if($account->amount < 0)
                                {{ number_format( abs($account->amount), 2) }}
                            @else
                                0
                            @endif
                        </td>
                        <td class="text-right">{{ priceFormat($account->balance) }}</td>
                    </tr>
                @endforeach
                </tbody>
                <tfoot>
                @php
                    $total_received  = $customerReport->pluck('amount')->filter(fn($item) => $item > 0)->sum();
                    $advance_utilized  = abs($customerReport->pluck('amount')->filter(fn($item) => $item < 0)->sum());
                    $total_balance = $customerReport->sum('amount');
                @endphp

                <tr style="font-weight: bold; background-color: #f2f2f2;">
                    <td colspan="4" style="text-align: right;">Total:</td>
                    <td style="text-align: right;">{{ priceFormat($total_received) }}</td>
                    <td style="text-align: right;">{{ priceFormat($advance_utilized) }}</td>
                    <td style="text-align: right;">{{ priceFormat($total_balance) }}</td>
                </tr>
                </tfoot>
            </table>
        </div>
    </div>

</div>

</body>

</html>
