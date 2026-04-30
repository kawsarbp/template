import DetailRow from '@/components/custom-component/DetailRow';
import Status from '@/components/custom-component/Status';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import {
    BasicSelect,
    ServerSearchSelect,
} from '@/components/ui/advanced-select';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/DataTable';
import { Input } from '@/components/ui/input';
import useAxiosFetch from '@/hooks/useAxiosFetch';
import { useConfirm } from '@/hooks/useConfirm';
import useDebounce from '@/hooks/useDebounce';
import { useLanguage } from '@/hooks/useLanguage';
import { generateParams, resetBtnOnOfCheck } from '@/lib/helper';
import { paymentStatusOptions } from '@/lib/options';
import { debounceInterval } from '@/lib/utils';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

const initialFilters = {
    search: '',
    payment_status: '',
    customer_id: '',
    page: 1,
    limit: 20,
};

export default function SaleReturns(props) {
    const data = props?.data?.data ?? [];
    const filters = props?.data?.filters ?? {};
    const summary = props?.data?.summary ?? {
        total_amount: 0,
        total_refunded: 0,
        total_due: 0,
    };
    const { t } = useLanguage();
    const { url, props: pageProps } = usePage();
    const permissions = pageProps?.permissions ?? {};
    const [loading, setLoading] = useState(false);
    const [searchFilterValue, setSearchFilterValue] = useState(initialFilters);
    const [filterInputValue, setFilterInputValue] = useState(initialFilters);
    const [ConfirmationBox, confirm] = useConfirm();
    const firstRenderRef = useRef(false);
    const [resetBtnOnOf, setResetBtnOnOf] = useState(false);
    const queryParams = new URLSearchParams(url.split('?')[1]);

    const [customerOptions, setCustomerOptions] = useState([]);
    const [customerSearch, setCustomerSearch] = useState('');

    const { data: customerData, loading: isLoadingCustomer } = useAxiosFetch({
        url: `/search/customers?search=${customerSearch}`,
    });

    const debounceSelectInputChange = useDebounce((value, stateFunction) => {
        stateFunction(value);
    }, debounceInterval);

    useEffect(() => {
        if (customerData) {
            setCustomerOptions(customerData?.data);
        }
    }, [customerData]);

    const debounceSearch = useDebounce((name, value) => {
        setSearchFilterValue({ ...searchFilterValue, [name]: value, page: 1 });
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
                        case 'customer_id':
                            searchInitialInputObj[key] = filters?.customer;
                            break;
                        default:
                            searchInitialInputObj[key] = paramsValue;
                    }
                }
            }
            if (flagSetSearchQueryAndSearchInput) {
                const searchInitialInputObjCopy = { ...searchInitialInputObj };
                for (let [key, value] of Object.entries(searchInitialInputObj)) {
                    if (key === 'customer_id') {
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
        limit: props?.data?.meta?.per_page || 20,
        last_page: props?.data?.meta?.last_page || 0,
        total: props?.data?.meta?.total || 0,
        to: props?.data?.meta?.to || 0,
        from: props?.data?.meta?.from || 0,
    };

    const tableColumnsDefinitions = useMemo(
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
                accessorKey: 'return_number',
                header: t('Return #'),
                cell: ({ row }) => (
                    <Link
                        href={`/sale-returns/${row.original.id}`}
                        className="font-medium text-primary hover:underline"
                    >
                        {row.original.return_number}
                    </Link>
                ),
            },
            {
                accessorKey: 'customer_name',
                header: t('Customer'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {row.original.customer_name || t('Walk-in')}
                    </span>
                ),
                footer: () => (
                    <span className="text-foreground">{t('Summary')}</span>
                ),
            },
            {
                accessorKey: 'total_units',
                header: t('Units'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {row.original.total_units}
                    </span>
                ),
            },
            {
                accessorKey: 'total_amount',
                header: t('Amount'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {Number(row.original.total_amount).toLocaleString()}
                    </span>
                ),
                footer: () => (
                    <span className="text-foreground">
                        {Number(summary.total_amount).toLocaleString()}
                    </span>
                ),
            },
            {
                accessorKey: 'total_refunded',
                header: t('Refunded'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {Number(row.original.total_refunded).toLocaleString()}
                    </span>
                ),
                footer: () => (
                    <span className="text-foreground">
                        {Number(summary.total_refunded).toLocaleString()}
                    </span>
                ),
            },
            {
                accessorKey: 'total_due',
                header: t('Due'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {Number(row.original.total_due).toLocaleString()}
                    </span>
                ),
                footer: () => (
                    <span className="text-foreground">
                        {Number(summary.total_due).toLocaleString()}
                    </span>
                ),
            },
            {
                accessorKey: 'payment_status',
                header: t('Status'),
                cell: ({ row }) => (
                    <Status status={row.original.payment_status_name} />
                ),
                cellMobileView: (mobileViewData) => (
                    <DetailRow label="Status">
                        <Status status={mobileViewData.payment_status_name} />
                    </DetailRow>
                ),
            },
            {
                accessorKey: 'return_date',
                header: t('Date'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {row.original.return_date}
                    </span>
                ),
            },
            {
                accessorKey: 'action',
                header: t('Action'),
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <Link href={`/sale-returns/${row.original.id}`}>
                            <Button variant="outline" size="sm">
                                {t('View')}
                            </Button>
                        </Link>
                        {permissions['update sale return'] && (
                            <Link href={`/sale-returns/${row.original.id}/edit`}>
                                <Button variant="outline" size="sm">
                                    {t('Edit')}
                                </Button>
                            </Link>
                        )}
                        {permissions['delete sale return'] && (
                            <Button
                                variant="delete"
                                size="sm"
                                onClick={() => handleDelete(row.original)}
                            >
                                {t('Delete')}
                            </Button>
                        )}
                    </div>
                ),
            },
        ],
        [t, data, summary],
    );

    const myCustomFilters = useMemo(
        () => [
            {
                id: 'payment_status',
                label: t('Payment Status'),
                render: ({ values, onChange }) => (
                    <div className="space-y-3 p-1">
                        <BasicSelect
                            options={paymentStatusOptions}
                            value={values?.payment_status}
                            onChange={(val) => onChange('payment_status', val)}
                            placeholder={t('Select Payment Status')}
                        />
                    </div>
                ),
            },
            {
                id: 'customer_id',
                label: t('Customer'),
                render: ({ values, onChange }) => (
                    <div className="space-y-3 p-1">
                        <ServerSearchSelect
                            value={values?.customer_id || ''}
                            onInputChange={(value) =>
                                debounceSelectInputChange(
                                    value,
                                    setCustomerSearch,
                                )
                            }
                            isLoading={isLoadingCustomer}
                            options={customerOptions}
                            onChange={(value) => onChange('customer_id', value)}
                            placeholder={t('Select Customer')}
                        />
                    </div>
                ),
            },
        ],
        [t, filterInputValue, customerOptions, isLoadingCustomer],
    );

    const handleFilterChange = (key, value) => {
        if (key === 'search') {
            setFilterInputValue((prev) => ({ ...prev, search: value }));
            debounceSearch(key, value);
        } else if (key === 'customer_id') {
            setFilterInputValue((prev) => ({ ...prev, [key]: value, page: 1 }));
            setSearchFilterValue((prev) => ({
                ...prev,
                [key]: value?.value,
                page: 1,
            }));
        } else {
            setFilterInputValue((prev) => ({ ...prev, [key]: value, page: 1 }));
            setSearchFilterValue((prev) => ({ ...prev, [key]: value, page: 1 }));
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
        setFilterInputValue(initialFilters);
    };

    const handleSearch = (searchData) => {
        setLoading(true);
        const generateQueryParams = generateParams(searchData);
        if (resetBtnOnOfCheck(generateQueryParams)) {
            setResetBtnOnOf(true);
        } else {
            setResetBtnOnOf(false);
        }

        router.visit('/sale-returns', {
            method: 'get',
            data: generateQueryParams,
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setLoading(false);
            },
        });
    };

    const handleDelete = async (data) => {
        const ok = await confirm({
            title: t('Delete this return?'),
            description: `The return <span class="bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-bold">"${data.return_number}"</span> will be permanently removed. This action cannot be undone.`,
            variant: 'destructive',
            confirmText: t('Yes, Delete It'),
        });

        if (ok) {
            router.delete(`/sale-returns/${data.id}`, {
                onSuccess: (response) => {
                    if (response?.props?.flash?.success) {
                        toast.success(response.props.flash.success);
                    } else if (response?.props?.flash?.error) {
                        toast.error(response.props.flash.error);
                    }
                },
            });
        }
    };

    return (
        <DashboardLayout>
            <Head title={t('Sale Returns')} />
            <div className="relative bg-background font-sans text-foreground">
                <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {t('Sale Returns')}
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

                        {permissions['create sale return'] && (
                            <Link href="/sale-returns/create">
                                <Button variant="gradient" size="sm">
                                    <Plus className="h-4 w-4" />
                                    {t('New Return')}
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="h-[calc(100vh-170px)]">
                    <DataTable
                        data={data}
                        columns={tableColumnsDefinitions}
                        customFilters={myCustomFilters}
                        filterInputValue={filterInputValue}
                        onFilterChange={handleFilterChange}
                        onPaginationChange={handlePaginationChange}
                        meta={pagination}
                        isLoading={loading}
                        resetFilters={handleResetFilters}
                        showResetButton={resetBtnOnOf}
                    />
                </div>
            </div>
            <ConfirmationBox />
        </DashboardLayout>
    );
}
