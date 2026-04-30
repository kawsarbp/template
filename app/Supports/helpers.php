<?php

declare(strict_types=1);

use App\Enums\VoucherType;
use App\Models\CashVoucher;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

if (! function_exists('priceFormat')) {
    function priceFormat($amount, $decimalPoint = 2, $prefix = 'AED'): string
    {
        if ($prefix) {
            $prefix = trim($prefix).' ';
        }

        return $amount ? $prefix.number_format($amount, $decimalPoint) : number_format(0, $decimalPoint);
    }
}
if (! function_exists('dateFormat')) {
    function dateFormat($date): string
    {
        return ! empty($date) ? Carbon::parse($date)->format('d/m/Y') : '';
    }
}

if (! function_exists('dateTimeFormat')) {
    function dateTimeFormat($date): string
    {
        return $date ? Carbon::parse($date)->format('d/m/Y h:i a') : '';
    }
}
if (! function_exists('convertToSnakeCase')) {
    function convertToSnakeCase($string): string
    {
        return str_replace('-', '_', $string);
    }
}

if (! function_exists('getAuditHistoryPageUrl')) {
    function getAuditHistoryPageUrl(string $html, $id): string
    {
        preg_match('/href=["\'](.*?)["\']/', $html, $matches);

        if (empty($matches[1])) {
            return '';
        }

        $originalUrl = $matches[1];
        $urlParts = parse_url($originalUrl);

        // extract path segments and convert to singular
        $segments = array_map(
            [Str::class, 'singular'],
            explode('/', trim($urlParts['path'] ?? '', '/'))
        );

        // check for `id` query parameter and append it as a segment
        if (! empty($urlParts['query'])) {
            parse_str($urlParts['query'], $queryParams);
            if (! empty($queryParams['id'])) {
                $segments[] = $queryParams['id'];
            }
        }

        return sprintf('activity-logs/list/%s', implode('/', $segments)).'?id='.$id;
    }
}

if (! function_exists('getRelativeUrl')) {
    function getRelativeUrl(string|array $url): string|array
    {
        if (is_array($url)) {
            return array_map(fn ($u) => str_replace(config('app.media_url'), '', $u), $url);
        }

        return str_replace(config('app.media_url'), '', $url);
    }
}

if (! function_exists('generateVoucherNumber')) {
    function generateVoucherNumber(int $type, $displayOnly = false): string
    {
        $prefix = $type === VoucherType::GENERAL_CASH_IN->value ? 'R' : 'P';

        $lastNumber = CashVoucher::where('voucher_type', $type)
            ->latest('id')
            ->value('voucher_number');

        $number = $lastNumber ? ((int) substr($lastNumber, 2)) + 1 : 1;

        if ($displayOnly) {
            return $prefix.'-'.str_pad((string) $number, 4, '0', STR_PAD_LEFT);
        }

        $voucher = CashVoucher::create([
            'voucher_type' => $type,
            'voucher_number' => $prefix.'-'.str_pad((string) $number, 4, '0', STR_PAD_LEFT),
        ]);

        return $voucher->voucher_number;
    }
}

if (! function_exists('dateRangeToDateTimeRange')) {
    function dateRangeToDateTimeRange($dateRange): array
    {
        if (count($dateRange) !== 2) {
            return $dateRange;
        }

        return [
            \Carbon\Carbon::parse($dateRange[0])->startOfDay()->format('Y-m-d H:i:s'),
            \Carbon\Carbon::parse($dateRange[1])->endOfDay()->format('Y-m-d H:i:s'),
        ];
    }
}
