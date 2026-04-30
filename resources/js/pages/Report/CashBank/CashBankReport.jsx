import ReportListTable from '@/components/custom-component/ReportListTable';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { ServerSearchSelect } from '@/components/ui/advanced-select';
import { Button } from '@/components/ui/button';
import { SmartDatePicker } from '@/components/ui/date-picker/DatePicker';
import useAxiosFetch from '@/hooks/useAxiosFetch';
import { useLanguage } from '@/hooks/useLanguage';
import {
    formatDateToYMD,
    generateParams,
    objectToQueryParams,
    resetBtnOnOfCheck,
} from '@/lib/helper';
import { Head, router, usePage } from '@inertiajs/react';
import { Download, FileText } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const breadcrumbs = [{ label: 'Reports' }, { label: 'Cash Bank Report' }];

const today = formatDateToYMD(new Date());

const initialFilters = {
    search: '',
    bank_account_id: '',
    start_date: today,
    end_date: today,
};

const initialFilterInputValue = {
    ...initialFilters,
};

export default function CashBankReport(props) {
    const {
        customer_advances = [],
        sale_payments = [],
        stock_purchases = [],
        cashflow_transactions = [],
        formatted_summary = {},
        filters = {},
    } = props;

    const { t } = useLanguage();
    const { url } = usePage();
    const firstRenderRef = useRef(false);
    const [resetBtnOnOf, setResetBtnOnOf] = useState(false);
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const [searchFilterValue, setSearchFilterValue] = useState(initialFilters);
    const [filterInputValue, setFilterInputValue] = useState(
        initialFilterInputValue,
    );
    const [loading, setLoading] = useState(false);

    const [bankAccountOptions, setBankAccountOptions] = useState([]);
    const [bankAccountSearch, setBankAccountSearch] = useState('');

    const { data: bankAccountData, loading: isLoadingBankAccount } =
        useAxiosFetch({
            url: `/search/bank-accounts?search=${bankAccountSearch}`,
        });

    useEffect(() => {
        if (bankAccountData) {
            setBankAccountOptions(bankAccountData?.data);
        }
    }, [bankAccountData]);

    // handle search function call when search filter value changes
    useEffect(() => {
        if (firstRenderRef.current) {
            handleSearch(searchFilterValue);
        } else {
            let queryParamsSet = {};
            let searchInitialInputObj = {};
            let flagSetSearchQueryAndSearchInput = false;
            for (let [key] of Object.entries(initialFilters)) {
                const paramsValue = queryParams.get(key);

                if (paramsValue) {
                    queryParamsSet = { ...queryParamsSet, [key]: paramsValue };
                    flagSetSearchQueryAndSearchInput = true;
                    switch (key) {
                        case 'bank_account_id':
                            searchInitialInputObj[key] =
                                filters?.filters?.bank_account;
                            break;
                        default:
                            searchInitialInputObj[key] = paramsValue;
                    }
                }
            }
            if (flagSetSearchQueryAndSearchInput) {
                const searchInitialInputObjCopy = { ...searchInitialInputObj };
                for (let [key, value] of Object.entries(
                    searchInitialInputObj,
                )) {
                    if (key === 'bank_account_id') {
                        searchInitialInputObjCopy[key] = value?.value;
                    }
                }
                setSearchFilterValue(searchInitialInputObjCopy);
                setFilterInputValue(searchInitialInputObj);
                setResetBtnOnOf(true);
            }
        }
        firstRenderRef.current = true;
    }, [searchFilterValue]);

    // handle searching
    const handleSearch = (searchData) => {
        setLoading(true);
        const generateQueryParams = generateParams(searchData);
        if (resetBtnOnOfCheck(generateQueryParams)) {
            setResetBtnOnOf(true);
        } else {
            setResetBtnOnOf(false);
        }

        router.visit('/reports/cash-bank-report', {
            method: 'get',
            data: generateQueryParams,
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setLoading(false);
            },
        });
    };

    const handleFilterChange = (key, value) => {
        if (key === 'bank_account_id') {
            setFilterInputValue((prev) => ({ ...prev, [key]: value, page: 1 }));
            setSearchFilterValue((prev) => ({
                ...prev,
                [key]: value?.value,
                page: 1,
            }));
        } else {
            setFilterInputValue((prev) => ({
                ...prev,
                [key]: value,
                page: 1,
            }));
            setSearchFilterValue((prev) => ({
                ...prev,
                [key]: value,
                page: 1,
            }));
        }
    };

    const commonColumns = [
        {
            header: 'Date',
            accessorKey: 'date',
            cell: ({ original }) => (
                <div className="text-muted-foreground">{original.date}</div>
            ),
        },
        {
            header: 'Voucher Number',
            accessorKey: 'voucher_number',
            cell: ({ original }) => (
                <a
                    href={`/stock-purchases-pdf/${original.id}`}
                    target="_blank"
                    className="text-muted-foreground"
                >
                    {original.voucher_number || 'N/A'}
                </a>
            ),
        },
        {
            header: 'Name',
            accessorKey: 'name',
            cell: ({ original }) => (
                <div className="text-muted-foreground">{original.name}</div>
            ),
        },
        {
            header: 'Description',
            accessorKey: 'description',
            cell: ({ original }) => (
                <div className="text-muted-foreground">
                    {original.description}
                </div>
            ),
        },
        {
            header: 'Debit',
            accessorKey: 'debit',
            align: 'right',
            className: 'text-success font-medium',
            cell: ({ original }) => (
                <div className="text-right text-success">
                    {original.debit || '0'}
                </div>
            ),
        },
        {
            header: 'Credit',
            accessorKey: 'credit',
            align: 'right',
            className: 'text-destructive font-medium',
            cell: ({ original }) => (
                <div className="text-right text-destructive">
                    {original.credit || '0'}
                </div>
            ),
        },
    ];

    const stockPurchaseColumns = [
        {
            header: 'Date',
            accessorKey: 'date',
            cell: ({ original }) => (
                <div className="text-muted-foreground">{original.date}</div>
            ),
        },
        {
            header: 'Voucher Number',
            accessorKey: 'voucher_number',
            cell: ({ original }) => (
                <a
                    href={`/stock-purchases/multi-payment-receipt?payment_id=${original.id}`}
                    target="_blank"
                    className="text-muted-foreground"
                >
                    {original.voucher_number || 'N/A'}
                </a>
            ),
        },
        {
            header: 'Name',
            accessorKey: 'name',
            cell: ({ original }) => (
                <div className="text-muted-foreground">{original.name}</div>
            ),
        },
        {
            header: 'Description',
            accessorKey: 'description',
            cell: ({ original }) => (
                <div className="text-muted-foreground">
                    {original.description}
                </div>
            ),
        },
        {
            header: 'Debit',
            accessorKey: 'debit',
            align: 'right',
            className: 'text-success font-medium',
            cell: ({ original }) => (
                <div className="text-right text-success">
                    {original.debit || '0'}
                </div>
            ),
        },
        {
            header: 'Credit',
            accessorKey: 'credit',
            align: 'right',
            className: 'text-destructive font-medium',
            cell: ({ original }) => (
                <div className="text-right text-destructive">
                    {original.credit || '0'}
                </div>
            ),
        },
    ];

    const saleColumns = [
        {
            header: 'Date',
            accessorKey: 'date',
            cell: ({ original }) => (
                <div className="text-muted-foreground">{original.date}</div>
            ),
        },
        {
            header: 'Voucher Number',
            accessorKey: 'voucher_number',
            cell: ({ original }) => (
                <a
                    href={`/sales/multi-payment-receipt?payment_id=${original.id}`}
                    target="_blank"
                    className="text-muted-foreground"
                >
                    {original.voucher_number || 'N/A'}
                </a>
            ),
        },
        {
            header: 'Name',
            accessorKey: 'name',
            cell: ({ original }) => (
                <div className="text-muted-foreground">{original.name}</div>
            ),
        },
        {
            header: 'Description',
            accessorKey: 'description',
            cell: ({ original }) => (
                <div className="text-muted-foreground">
                    {original.description}
                </div>
            ),
        },
        {
            header: 'Debit',
            accessorKey: 'debit',
            align: 'right',
            className: 'text-success font-medium',
            cell: ({ original }) => (
                <div className="text-right text-success">
                    {original.debit || '0'}
                </div>
            ),
        },
        {
            header: 'Credit',
            accessorKey: 'credit',
            align: 'right',
            className: 'text-destructive font-medium',
            cell: ({ original }) => (
                <div className="text-right text-destructive">
                    {original.credit || '0'}
                </div>
            ),
        },
    ];

    const SummaryCard = ({ title, debit, credit }) => (
        <div className="min-h-[110px] rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
            <div className="mb-2 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                {t(title)}
            </div>
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-muted-foreground">
                        {t('Debit')} :
                    </span>
                    <span className="ml-2 truncate font-bold text-success">
                        {debit}
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-muted-foreground">
                        {t('Credit')} :
                    </span>
                    <span className="ml-2 truncate font-bold text-destructive">
                        {credit}
                    </span>
                </div>
            </div>
        </div>
    );

    const BalanceCard = ({
        opening,
        closing,
        total_debit = 'AED 0',
        total_credit = 'AED 0',
    }) => (
        <div className="flex h-full min-h-[110px] flex-col justify-center rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
            <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-x-3 gap-y-1.5">
                <div className="text-sm text-muted-foreground">
                    <tr className="font-bold">
                        <td className="font-bold">Opening Balance</td>
                        <td>: </td>
                        <td className="pl-0.5">{opening}</td>
                    </tr>
                    <tr>
                        <td className="font-bold">Total Debit</td>
                        <td>: </td>
                        <td className="pl-0.5">{total_debit}</td>
                    </tr>
                    <tr>
                        <td className="font-bold">Total Credit</td>
                        <td>: </td>
                        <td className="pl-0.5">{total_credit}</td>
                    </tr>
                    <tr>
                        <td className="font-bold">Closing Balance</td>
                        <td>: </td>
                        <td className="pl-0.5">{closing}</td>
                    </tr>
                </div>
            </div>
        </div>
    );

    const customerAdvanceFooter = () => {
        return (
            <tr className="w-12 px-4 py-3 pr-1 text-right font-medium text-muted-foreground">
                <td colSpan={5} className="text-right">
                    Total
                </td>
                <td className="px-4 py-2.5">
                    {formatted_summary.total_advance_debit || 'AED 0'}
                </td>
                <td className="px-4 py-2.5">
                    {formatted_summary.total_advance_credit || 'AED 0'}
                </td>
            </tr>
        );
    };

    const saleFooter = () => {
        return (
            <tr className="w-12 px-4 py-3 pr-1 text-right font-medium text-muted-foreground">
                <td colSpan={5} className="text-right">
                    Total
                </td>
                <td className="px-4 py-2.5">
                    {formatted_summary.total_sale_debit || 'AED 0'}
                </td>
                <td className="px-4 py-2.5">
                    {formatted_summary.total_sale_credit || 'AED 0'}
                </td>
            </tr>
        );
    };

    const cashFlowFooter = () => {
        return (
            <tr className="w-12 px-4 py-3 pr-1 text-right font-medium text-muted-foreground">
                <td colSpan={5} className="text-right">
                    Total
                </td>
                <td className="px-4 py-2.5">
                    {formatted_summary.total_cashflow_debit || 'AED 0'}
                </td>
                <td className="px-4 py-2.5">
                    {formatted_summary.total_cashflow_credit || 'AED 0'}
                </td>
            </tr>
        );
    };

    const stockPurchaseFooter = () => {
        return (
            <tr className="w-12 px-4 py-3 pr-1 text-right font-medium text-muted-foreground">
                <td colSpan={5} className="text-right">
                    Total
                </td>
                <td className="px-4 py-2.5">
                    {formatted_summary.total_stock_purchase_debit || 'AED 0'}
                </td>
                <td className="px-4 py-2.5">
                    {formatted_summary.total_stock_purchase_credit || 'AED 0'}
                </td>
            </tr>
        );
    };

    return (
        <DashboardLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Cash Bank Report')} />
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                {t('Cash Bank Report')}
            </h1>
            <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Header & Filters */}
                <div className="mb-2 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
                    <div className="flex w-full flex-wrap items-end gap-4 lg:w-auto lg:justify-end">
                        <div className="flex max-w-[180px] min-w-[140px] flex-1 flex-col gap-1.5">
                            <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                {t('Start Date')}
                            </span>
                            <SmartDatePicker
                                value={filterInputValue.start_date}
                                onChange={(date) =>
                                    handleFilterChange(
                                        'start_date',
                                        formatDateToYMD(date),
                                    )
                                }
                            />
                        </div>
                        <div className="flex max-w-[180px] min-w-[140px] flex-1 flex-col gap-1.5">
                            <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                {t('End Date')}
                            </span>
                            <SmartDatePicker
                                value={filterInputValue.end_date}
                                onChange={(date) =>
                                    handleFilterChange(
                                        'end_date',
                                        formatDateToYMD(date),
                                    )
                                }
                            />
                        </div>
                        <div className="flex max-w-[280px] min-w-[200px] flex-1 flex-col gap-1.5">
                            <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                {t('Bank Account')}
                            </span>
                            <ServerSearchSelect
                                value={filterInputValue.bank_account_id}
                                options={bankAccountOptions}
                                onInputChange={(val) =>
                                    setBankAccountSearch(val)
                                }
                                isLoading={isLoadingBankAccount}
                                onChange={(val) =>
                                    handleFilterChange('bank_account_id', val)
                                }
                                placeholder={t('Select Account')}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 pb-[1px]">
                        <a
                            href={`/reports/cash-bank-report-excel?${objectToQueryParams(searchFilterValue)}`}
                            target="_blank"
                        >
                            <Button
                                variant="gradient"
                                className="gap-2 px-5 shadow-md shadow-primary/20"
                            >
                                <Download className="h-4 w-4" />
                                {t('Export Excel')}
                            </Button>
                        </a>
                        <a
                            href={`/reports/cash-bank-report-pdf?${objectToQueryParams(searchFilterValue)}`}
                            target="_blank"
                        >
                            <Button
                                variant="outline"
                                className="gap-2 border-primary text-primary shadow-sm transition-all hover:bg-primary hover:text-white"
                            >
                                <FileText className="h-4 w-4" />
                                {t('PDF')}
                            </Button>
                        </a>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    <SummaryCard
                        title="Sale"
                        debit={formatted_summary.total_sale_debit || 'AED 0'}
                        credit={formatted_summary.total_sale_credit || 'AED 0'}
                    />

                    <SummaryCard
                        title="Cash Flow"
                        debit={
                            formatted_summary.total_cashflow_debit || 'AED 0'
                        }
                        credit={
                            formatted_summary.total_cashflow_credit || 'AED 0'
                        }
                    />
                    <SummaryCard
                        title="Advance Account"
                        debit={formatted_summary.total_advance_debit || 'AED 0'}
                        credit={
                            formatted_summary.total_advance_credit || 'AED 0'
                        }
                    />
                    <SummaryCard
                        title="Stock Purchases"
                        debit={
                            formatted_summary.total_stock_purchase_debit ||
                            'AED 0'
                        }
                        credit={
                            formatted_summary.total_stock_purchase_credit ||
                            'AED 0'
                        }
                    />
                    <div className="sm:col-span-2 xl:col-span-1">
                        <BalanceCard
                            opening={
                                formatted_summary.opening_balance || 'AED 0'
                            }
                            closing={
                                formatted_summary.closing_balance || 'AED 0'
                            }
                            total_debit={
                                formatted_summary.total_debit || 'AED 0'
                            }
                            total_credit={
                                formatted_summary.total_credit || 'AED 0'
                            }
                        />
                    </div>
                </div>

                {/* Report Sections */}
                <div className="flex flex-col gap-8">
                    <ReportSection
                        title="Customer Advance"
                        data={customer_advances?.data || []}
                        columns={commonColumns}
                        loading={loading}
                        tfoot={customerAdvanceFooter()}
                    />
                    <ReportSection
                        title="Cash Flow"
                        data={cashflow_transactions?.data || []}
                        columns={commonColumns}
                        loading={loading}
                        tfoot={cashFlowFooter()}
                    />
                    <ReportSection
                        title="Stock Purchase"
                        data={stock_purchases?.data || []}
                        columns={stockPurchaseColumns}
                        loading={loading}
                        tfoot={stockPurchaseFooter()}
                    />
                    <ReportSection
                        title="Sale Payment"
                        data={sale_payments?.data || []}
                        columns={saleColumns}
                        loading={loading}
                        tfoot={saleFooter()}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}

function ReportSection({ title, data, columns, loading, tfoot }) {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col gap-3">
            <h2 className="border-l-4 border-primary pl-3 text-xl font-bold text-foreground">
                {t(title)}
            </h2>
            <ReportListTable
                columns={columns}
                data={data}
                loading={loading}
                tfoot={tfoot}
            />
        </div>
    );
}
