<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>customer advance payment pdf</title>
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

        table.tbl {
            caption-side: bottom;
            border-collapse: collapse;
        }

        table.tbl tr td, thead tr th {
            border: 1px solid #333;
            padding: 4px;
            font-size: 10px;
            text-align: center;
        }

        .border-light td {
            border: 1px solid #afa8a8;
        }

        .tbl tbody tr:nth-child(odd) {background-color: #d8e1f2;}
    </style>
</head>
<body>
<div class="container">
    <table style="width: 100%;">
        <tr>
            <td>
                <div>
                    <img width="140"
                         src="{{ config('setting.basic_information.logo') }}">
                </div>
            </td>
            <td>
                <div style="color: navy; font-family: 'Times New Roman', Times, serif; ">
                    <h2 style="text-align: right; font-size: 28px;">{{ config('setting.basic_information.company_name') }}</h2>
                </div>
            </td>
        </tr>
    </table>
    <hr style="color: #403a94; margin-top: -5px;">
    <h2 style="text-align: center;">Customer Advance Report</h2>

    <table class="tbl" style="width: 100%; margin-top: 10px;">
        <thead>
        <tr style="background: #4472c4; color: white;">
            <th>SL</th>
            <th>CUSTOMER NAME</th>
            <th>BALANCE</th>
        </tr>
        </thead>
        <tbody>
        @php $sl = 1; $totalDue = 0; @endphp
        @foreach( $accounts as $account )
            <tr>
                <td>{{ $sl++ }}</td>
                <td>{{ $account->name }}</td>
                <td style="text-align: right;">{{ number_format($account->advance_payment_balance, 2) }}</td>
            </tr>
        @endforeach
        </tbody>
        <tfoot>

        <tr>
            <td></td>
            <td style="text-align:right;">Current balance: </td>
            <td style="text-align:right;">{{ $summary['total_amount'] }}</td>
        </tr>
        </tfoot>
    </table>
</div>
</body>
</html>
