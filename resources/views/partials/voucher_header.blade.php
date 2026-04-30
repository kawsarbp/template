<header style="width: 100%;">
    <table width="100%">
        <tr>
            <td style="text-align: right;">
                <small>
                    <strong>Generated
                        AT:
                        {{ isset($invoicePayment) ? \Illuminate\Support\Carbon::parse($invoicePayment->created_at)->format('d/m/Y H:i:s') : now()->format('d/m/Y H:i:s') }}</strong>
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
