import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { MobileFilterSheet } from '@/components/MobileFilterSheet';
import { ServerSearchSelect } from '@/components/ui/advanced-select';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/DataTable';
import { SmartDatePicker } from '@/components/ui/date-picker/DatePicker';
import { Input } from '@/components/ui/input';
import useAxiosFetch from '@/hooks/useAxiosFetch';
import { useConfirm } from '@/hooks/useConfirm';
import useDebounce from '@/hooks/useDebounce';
import { useLanguage } from '@/hooks/useLanguage';
import {
    fileRouteHandler,
    formatDateRange,
    generateParams,
    parseDateRange,
    resetBtnOnOfCheck,
} from '@/lib/helper';
import { debounceInterval } from '@/lib/utils';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Download, Filter, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

const initialFilters = {
    search: '',
    supplier_id: '',
    payment_date: '',
    page: 1,
    limit: 50,
};

const initialFilterInputValue = {
    ...initialFilters,
};

export default function Index(props) {
    const payments = props?.data?.data ?? [];
    const filters = props?.filters ?? {};
    const summary = props?.data?.summary ?? { total_amount: 0, total_utilized: 0, total_balance: 0 };
    const { t } = useLanguage();
    const { url, props: pageProps } = usePage();
    const permissions = pageProps?.permissions ?? {};
    const [loading, setLoading] = useState(false);
    const [excelLoading, setExcelLoading] = useState(false);
    const [ConfirmationBox, confirm] = useConfirm();
    const [searchFilterValue, setSearchFilterValue] = useState(initialFilters);
    const [filterInputValue, setFilterInputValue] = useState(
        initialFilterInputValue,
    );
    const firstRenderRef = useRef(false);
    const [resetBtnOnOf, setResetBtnOnOf] = useState(false);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const queryParams = new URLSearchParams(url.split('?')[1]);

    const [supplierOptions, setSupplierOptions] = useState([]);
    const [supplierSearch, setSupplierSearch] = useState('');

    const { data: supplierData, loading: isLoadingSupplier } = useAxiosFetch({
        url: `/search/suppliers?search=${supplierSearch}`,
    });

    const debounceSelectInputChange = useDebounce((value, stateFunction) => {
        stateFunction(value);
    }, debounceInterval);

    useEffect(() => {
        if (supplierData) {
            setSupplierOptions(supplierData?.data);
        }
    }, [supplierData]);

    const debounceSearch = useDebounce((name, value) => {
        setSearchFilterValue((prev) => ({ ...prev, [name]: value, page: 1 }));
    }, debounceInterval);

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
                        case 'supplier_id':
                            searchInitialInputObj[key] = filters?.supplier;
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
                    if (key === 'supplier_id') {
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

    const pagination = {
        current_page: props?.data?.meta?.current_page || 1,
        limit: props?.data?.meta?.per_page || 50,
        last_page: props?.data?.meta?.last_page || 0,
        total: props?.data?.meta?.total || 0,
        to: props?.data?.meta?.to || 0,
        from: props?.data?.meta?.from || 0,
    };

    const handleSelectInputChange = (key, value) => {
        if (key === 'supplier_id') {
            debounceSelectInputChange(value, setSupplierSearch);
        }
    };

    const handleFilterChange = (key, value) => {
        if (key === 'search') {
            setFilterInputValue((prev) => ({ ...prev, search: value }));
            debounceSearch(key, value);
        } else if (key === 'supplier_id') {
            setFilterInputValue((prev) => ({ ...prev, [key]: value, page: 1 }));
            setSearchFilterValue((prev) => ({
                ...prev,
                [key]: value?.value,
                page: 1,
            }));
        } else {
            setFilterInputValue((prev) => ({ ...prev, [key]: value, page: 1 }));
            setSearchFilterValue((prev) => ({
                ...prev,
                [key]: value,
                page: 1,
            }));
        }
    };

    const handlePaginationChange = (key, value) => {
        if (key === 'page') {
            setFilterInputValue((prev) => ({ ...prev, page: value }));
            setSearchFilterValue((prev) => ({ ...prev, page: value }));
        } else if (key === 'limit') {
            setFilterInputValue((prev) => ({ ...prev, limit: value }));
            setSearchFilterValue((prev) => ({ ...prev, limit: value }));
        }
    };

    const handleResetFilters = () => {
        setSearchFilterValue(initialFilters);
        setFilterInputValue(initialFilterInputValue);
    };

    const handleSearch = (searchData) => {
        setLoading(true);
        const generateQueryParams = generateParams(searchData);
        if (resetBtnOnOfCheck(generateQueryParams)) {
            setResetBtnOnOf(true);
        } else {
            setResetBtnOnOf(false);
        }

        router.visit('/supplier-payments', {
            method: 'get',
            data: generateQueryParams,
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => setLoading(false),
        });
    };

    const handleDelete = async (row) => {
        const ok = await confirm({
            title: t('Delete this payment?'),
            description: `The payment <span class="bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-bold">"${row.voucher_number}"</span> and all its line items will be permanently removed. This action cannot be undone.`,
            variant: 'destructive',
            confirmText: t('Yes, Delete It'),
        });

        if (ok) {
            router.delete(`/supplier-payments/${row.id}`, {
                onSuccess: (response) => {
                    if (response?.props?.flash?.success) {
                        toast.success(response.props.flash.success);
                    }
                },
            });
        }
    };

    const tableColumns = useMemo(
        () => [
            {
                accessorKey: 'sl',
                isSkipColumn: true,
                header: t('SL'),
                cell: ({ row }) => (
                    <div className="font-medium text-muted-foreground">
                        {row?.index + 1}
                    </div>
                ),
            },
            {
                accessorKey: 'voucher_number',
                header: t('Voucher #'),
                cell: ({ row }) => (
                    <span className="font-medium text-primary">
                        {row.original.voucher_number}
                    </span>
                ),
            },
            {
                accessorKey: 'supplier_name',
                header: t('Supplier'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {row.original.supplier_name || '—'}
                    </span>
                ),
                footer: () => (
                    <span className="text-foreground">{t('Summary')}</span>
                ),
            },
            {
                accessorKey: 'amount',
                header: t('Amount'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {Number(row.original.amount).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                        })}
                    </span>
                ),
                footer: () => (
                    <span className="text-foreground">
                        {Number(summary.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                ),
            },
            {
                accessorKey: 'utilized',
                header: t('Utilized'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {Number(row.original.utilized).toLocaleString(
                            undefined,
                            {
                                minimumFractionDigits: 2,
                            },
                        )}
                    </span>
                ),
                footer: () => (
                    <span className="text-foreground">
                        {Number(summary.total_utilized).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                ),
            },
            {
                accessorKey: 'balance',
                header: t('Balance'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {Number(row.original.balance).toLocaleString(
                            undefined,
                            {
                                minimumFractionDigits: 2,
                            },
                        )}
                    </span>
                ),
                footer: () => (
                    <span className="text-foreground">
                        {Number(summary.total_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                ),
            },
            {
                accessorKey: 'bank_account_name',
                header: t('Account'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {row.original.bank_account_name || '—'}
                    </span>
                ),
            },
            {
                accessorKey: 'payment_date',
                header: t('Date'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {row.original.payment_date}
                    </span>
                ),
            },
            {
                accessorKey: 'paid_to',
                header: t('Paid To'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {row.original.paid_to || '—'}
                    </span>
                ),
            },
            {
                accessorKey: 'batch_numbers',
                header: t('GLOTs'),
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">
                        {row.original.batch_numbers || t('Advance')}
                    </span>
                ),
            },
            {
                accessorKey: 'pdf_url',
                header: t('Voucher'),
                cell: ({ row }) =>
                    row.original.pdf_url && (
                        <a
                            href={row.original.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cursor-pointer text-primary underline"
                        >
                            Voucher
                        </a>
                    ),
            },
            {
                accessorKey: 'action',
                header: t('Action'),
                cell: ({ row }) => (
                    <div className="flex items-center gap-1">
                        <Link
                            href={`/supplier-payments/${row.original.id}/edit`}
                        >
                            <button className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                                <Pencil size={15} />
                            </button>
                        </Link>
                        <button
                            onClick={() => handleDelete(row.original)}
                            className="rounded-md p-2 text-destructive transition-colors hover:bg-destructive/10"
                        >
                            <Trash2 size={15} />
                        </button>
                    </div>
                ),
            },
        ],
        [t, summary],
    );

    const filterDefinitions = useMemo(
        () => [
            {
                id: 'payment_date',
                label: t('Payment Date'),
                render: ({ values, onChange }) => (
                    <div className="space-y-3 p-1">
                        <SmartDatePicker
                            mode="range"
                            valueClass="lg:max-w-32 w-full"
                            value={parseDateRange(values?.payment_date)}
                            onChange={(value) =>
                                onChange('payment_date', formatDateRange(value))
                            }
                            includeTime={false}
                            placeholder={t('Select date')}
                        />
                    </div>
                ),
            },
            {
                id: 'supplier_id',
                label: t('Supplier'),
                render: ({ values, onChange }) => (
                    <div className="space-y-3 p-1">
                        <ServerSearchSelect
                            value={values?.supplier_id || ''}
                            onInputChange={(value) =>
                                handleSelectInputChange('supplier_id', value)
                            }
                            isLoading={isLoadingSupplier}
                            options={supplierOptions}
                            onChange={(value) => onChange('supplier_id', value)}
                            placeholder={t('Select Supplier')}
                        />
                    </div>
                ),
            },
        ],
        [t, supplierOptions, isLoadingSupplier],
    );

    const tableConfig = useMemo(
        () => ({ views: ['table'], expandable: false }),
        [],
    );

    return (
        <DashboardLayout>
            <Head title={t('Supplier Payments')} />
            <div className="relative bg-background font-sans text-foreground">
                <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {t('Supplier Payments')}
                    </h1>
                    <div className="flex flex-wrap items-end justify-end gap-2">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder={t('Global Search')}
                                className="h-9 w-full border-border pl-9 focus-visible:ring-1 focus-visible:ring-ring sm:w-64"
                                value={filterInputValue?.search}
                                onChange={(e) =>
                                    handleFilterChange('search', e.target.value)
                                }
                            />
                        </div>
                        {permissions['export excel supplier payment'] && (
                            <Button
                                onClick={() =>
                                    fileRouteHandler({
                                        url: 'supplier-payments/export-excel',
                                        data: searchFilterValue,
                                        setDownloadLoading: setExcelLoading,
                                    })
                                }
                                disabled={excelLoading}
                                variant="outline"
                            >
                                {excelLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4" />
                                )}
                                {t('Export Excel')}
                            </Button>
                        )}
                        <Link href="/supplier-payments/create">
                            <Button variant="gradient">
                                <Plus className="h-4 w-4" />
                                {t('Create')}
                            </Button>
                        </Link>
                    </div>

                    <div className="flex items-center justify-between md:hidden">
                        <span className="text-lg font-bold text-foreground">
                            {t('Supplier Payments')}
                        </span>
                        <button onClick={() => setIsMobileFilterOpen(true)}>
                            <Filter
                                size={20}
                                className="text-muted-foreground"
                            />
                        </button>
                    </div>
                </div>

                <div className="h-[calc(100vh-170px)]">
                    <DataTable
                        columns={tableColumns}
                        meta={pagination}
                        onPaginationChange={handlePaginationChange}
                        data={payments}
                        options={tableConfig}
                        loading={loading}
                        onFilterChange={handleFilterChange}
                        filterDefinitions={filterDefinitions}
                        onResetFilters={handleResetFilters}
                        resetBtnOnOf={resetBtnOnOf}
                        filterInputValue={filterInputValue}
                    />
                </div>

                <MobileFilterSheet
                    isOpen={isMobileFilterOpen}
                    onClose={() => setIsMobileFilterOpen(false)}
                    filterDefinitions={filterDefinitions}
                    filterInputValue={filterInputValue}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                    resetBtnOnOf={resetBtnOnOf}
                />
            </div>
            <ConfirmationBox />
        </DashboardLayout>
    );
}
