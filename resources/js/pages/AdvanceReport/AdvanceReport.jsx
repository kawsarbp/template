import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { MobileFilterSheet } from '@/components/MobileFilterSheet';
import { ServerSearchSelect } from '@/components/ui/advanced-select';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/DataTable';
import useAxiosFetch from '@/hooks/useAxiosFetch';
import useDebounce from '@/hooks/useDebounce';
import { useLanguage } from '@/hooks/useLanguage';
import {
    fileRouteHandler,
    generateParams,
    objectToQueryParams,
    resetBtnOnOfCheck,
} from '@/lib/helper';
import { debounceInterval } from '@/lib/utils';
import { Head, router, usePage } from '@inertiajs/react';
import { Columns, Download, Filter, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AdvanceReportMobileDetailSheet } from './AdvanceReportMobileDetailSheet';
import { AdvanceReportMobileViewCard } from './AdvanceReportMobileViewCard';

const breadcrumbs = [{ label: 'Advance Report' }];

const initialFilters = {
    search: '',
    customer_id: '',
    page: 1,
    limit: 20,
};

const initialFilterInputValue = {
    ...initialFilters,
};

export default function AdvanceReport(props) {
    const data = props?.customerReport?.data ?? [];
    const summary = props?.summary ?? {};
    const permissions = props?.permissions ?? {};
    const filters = props?.data?.filters ?? {};
    const { t } = useLanguage();
    const { url } = usePage();
    // Core State
    const [loading, setLoading] = useState(false);
    const [searchFilterValue, setSearchFilterValue] = useState(initialFilters);
    const [filterInputValue, setFilterInputValue] = useState(initialFilters);
    const [selectedMobileItem, setSelectedMobileItem] = useState(null);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const firstRenderRef = useRef(false);
    const [resetBtnOnOf, setResetBtnOnOf] = useState(false);
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const [excelLoading, setExcelLoading] = useState(false);

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

    // search filter debounce
    const debounceSearch = useDebounce((name, value) => {
        setSearchFilterValue({ ...searchFilterValue, [name]: value, page: 1 });
    }, debounceInterval);

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
                for (let [key, value] of Object.entries(
                    searchInitialInputObj,
                )) {
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
                cell: ({ row }) => {
                    return (
                        <div className="font-medium text-muted-foreground">
                            {row?.index + 1}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'date',
                header: t('Date'),
                cell: ({ row }) => (
                    <div className="font-medium text-muted-foreground">
                        {row.original.date}
                    </div>
                ),
            },

            {
                accessorKey: 'voucher_number',
                header: t('Voucher Number'),
                cell: ({ row }) => (
                    <div className="font-medium text-muted-foreground">
                        {row.original.voucher_number}
                    </div>
                ),
            },

            {
                accessorKey: 'note',
                header: t('Note'),
                cell: ({ row }) => (
                    <div className="font-medium text-muted-foreground">
                        {row.original.note}
                    </div>
                ),
            },

            {
                accessorKey: 'bank_account',
                header: t('Mode Of Payment'),
                footerClassName: 'text-right text-success',
                cell: ({ row }) => (
                    <div className="font-medium text-muted-foreground">
                        {row.original.bank_account}
                    </div>
                ),
                footer: () => (
                    <span className="text-right font-bold">Total:</span>
                ),
            },

            {
                accessorKey: 'amount_received',
                header: t('Amount Received'),
                className: 'text-right',
                footerClassName: 'text-right text-success',
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {row.original.amount_received}
                    </span>
                ),
                footer: () => (
                    <span className="font-bold">{summary.total_received}</span>
                ),
            },
            {
                accessorKey: 'advance_utilized',
                header: t('Advance Utilized'),
                className: 'text-right',
                footerClassName: 'text-right text-success',
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {row.original.advance_utilized}
                    </span>
                ),
                footer: () => (
                    <span className="font-bold">
                        {summary.advance_utilized}
                    </span>
                ),
            },
            {
                accessorKey: 'balance',
                header: t('Balance'),
                className: 'text-right',
                footerClassName: 'text-right text-success',
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {row.original.balance}
                    </span>
                ),
                footer: () => (
                    <span className="font-bold">{summary.total_balance}</span>
                ),
            },
        ],
        [t, data],
    );

    const myCustomFilters = useMemo(() => [], [t]);

    const currentColumns = useMemo(
        () => tableColumnsDefinitions,
        [tableColumnsDefinitions],
    );
    const tableConfig = useMemo(
        () => ({ views: ['table'], expandable: false }),
        [],
    );

    const mobileViewCard = (data) => {
        return data.map((item) => (
            <AdvanceReportMobileViewCard
                key={item.id}
                data={item}
                onClick={() => setSelectedMobileItem(item)}
            />
        ));
    };

    const mobileViewDetailSheet = () => {
        return (
            <AdvanceReportMobileDetailSheet
                isOpen={!!selectedMobileItem}
                onClose={() => setSelectedMobileItem(null)}
                data={selectedMobileItem}
                tableColumnsDefinitions={tableColumnsDefinitions}
            />
        );
    };

    // handle select input change
    const handleSelectInputChange = (key, value) => {
        if (key === 'customer_id') {
            debounceSelectInputChange(value, setCustomerSearch);
        }
    };

    const handleFilterChange = (key, value) => {
        if (key === 'search' || key === 'voucher_number') {
            setFilterInputValue((prev) => ({ ...prev, [key]: value }));
            debounceSearch(key, value);
        } else if (key === 'customer_id') {
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

    // handle searching
    const handleSearch = (searchData) => {
        setLoading(true);
        const generateQueryParams = generateParams(searchData);
        if (resetBtnOnOfCheck(generateQueryParams)) {
            setResetBtnOnOf(true);
        } else {
            setResetBtnOnOf(false);
        }

        router.visit('/reports/customer-advance', {
            method: 'get',
            data: generateQueryParams,
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setLoading(false);
            },
        });
    };

    const tableHeaderTitleRow = (
        <tr>
            <th
                colSpan={tableColumnsDefinitions.length}
                className="text-center"
            >
                <div className="py-3">
                    <div className="text-lg font-semibold">
                        Zaaag POS Accounting
                    </div>
                    <div className="text-sm">
                        Customer Advance Detail Report
                    </div>
                    <div className="text-sm">{props?.customerName}</div>
                </div>
            </th>
        </tr>
    );

    return (
        <DashboardLayout breadcrumbs={breadcrumbs}>
            <Head title="Advance Report" />
            <div className="relative bg-background font-sans text-foreground">
                <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {t('Advance Report')}
                    </h1>
                </div>

                <div className="bg-card pt-4">
                    <div className="flex flex-wrap justify-end gap-2 p-4 md:justify-between">
                        <div className="">
                            <ServerSearchSelect
                                value={filterInputValue?.customer_id || ''}
                                onInputChange={(value) =>
                                    handleSelectInputChange(
                                        'customer_id',
                                        value,
                                    )
                                }
                                isLoading={isLoadingCustomer}
                                options={customerOptions}
                                onChange={(value) =>
                                    handleFilterChange('customer_id', value)
                                }
                                placeholder="Select Customer"
                            />
                        </div>

                        {filterInputValue?.customer_id && (
                            <div className="flex items-center gap-2">
                                {permissions['export pdf advance report'] && (
                                    <a
                                        href={`/reports/customer-advance-pdf?${objectToQueryParams(searchFilterValue)}`}
                                        target="_blank"
                                    >
                                        <Button variant="outline-accent">
                                            PDF
                                        </Button>
                                    </a>
                                )}

                                {permissions['export excel advance report'] && (
                                    <Button
                                        onClick={() =>
                                            fileRouteHandler({
                                                url: '/reports/customer-advance-export',
                                                data: searchFilterValue,
                                                setDownloadLoading:
                                                    setExcelLoading,
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
                                        Export
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div className="flex items-center justify-between md:hidden">
                            <span className="text-lg font-bold text-foreground">
                                {t('Date')}
                            </span>
                            <div className="flex items-center gap-4">
                                <Columns
                                    size={20}
                                    className="text-muted-foreground"
                                />
                                <button
                                    onClick={() => setIsMobileFilterOpen(true)}
                                    className="relative"
                                >
                                    <Filter
                                        size={20}
                                        className="text-muted-foreground"
                                    />
                                    {Object.keys(filterInputValue).length >
                                        0 && (
                                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-card bg-green-500"></span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="h-[calc(100vh-170px)]">
                        {filterInputValue?.customer_id && (
                            <DataTable
                                tableHeaderTitleRow={tableHeaderTitleRow}
                                columns={currentColumns}
                                meta={pagination}
                                onPaginationChange={handlePaginationChange}
                                data={data}
                                options={tableConfig}
                                loading={loading}
                                onFilterChange={handleFilterChange}
                                filterDefinitions={myCustomFilters}
                                onResetFilters={handleResetFilters}
                                resetBtnOnOf={resetBtnOnOf}
                                mobileViewCard={mobileViewCard}
                                mobileViewDetailSheet={mobileViewDetailSheet}
                                filterInputValue={filterInputValue}
                            />
                        )}
                    </div>
                </div>

                <MobileFilterSheet
                    isOpen={isMobileFilterOpen}
                    onClose={() => setIsMobileFilterOpen(false)}
                    filterDefinitions={myCustomFilters}
                    filterInputValue={filterInputValue}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                    resetBtnOnOf={resetBtnOnOf}
                />
            </div>
        </DashboardLayout>
    );
}
