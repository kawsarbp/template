import DetailRow from '@/components/custom-component/DetailRow';
import { IconInput } from '@/components/custom-component/IconInput';
import Status from '@/components/custom-component/Status';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { MobileFilterSheet } from '@/components/MobileFilterSheet';
import {
    BasicSelect,
    ServerSearchSelect,
} from '@/components/ui/advanced-select';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/DataTable';
import { SmartDatePicker } from '@/components/ui/date-picker/DatePicker';
import { Input } from '@/components/ui/input';
import useAxiosFetch from '@/hooks/useAxiosFetch';
import { useConfirm } from '@/hooks/useConfirm';
import useDebounce from '@/hooks/useDebounce';
import { useLanguage } from '@/hooks/useLanguage';
import {
    formatDateRange,
    generateParams,
    parseDateRange,
    resetBtnOnOfCheck,
} from '@/lib/helper';
import { paymentStatusOptions, saleTypeOptions } from '@/lib/options';
import { debounceInterval } from '@/lib/utils';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Columns, Filter, Plus, Search, Upload } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import SaleActionButton from './SaleActionButton';
import SaleImportModal from './SaleImportModal';
import { SaleMobileDetailSheet } from './SaleMobileDetailSheet';
import { SaleMobileViewCard } from './SaleMobileViewCard';

const initialFilters = {
    search: '',
    payment_status: '',
    sale_type: '',
    customer_id: '',
    sale_date: '',
    batch_number: '',
    imei: '',
    page: 1,
    limit: 20,
};

const initialFilterInputValue = {
    ...initialFilters,
};

export default function Sales(props) {
    const data = props?.data?.data ?? [];
    const permissions = props?.permissions ?? {};
    const filters = props?.data?.filters ?? {};
    const summary = props?.data?.summary ?? {
        total_amount: 0,
        total_paid: 0,
        total_due: 0,
    };
    const { t } = useLanguage();
    const { url } = usePage();
    const [loading, setLoading] = useState(false);
    const [searchFilterValue, setSearchFilterValue] = useState(initialFilters);
    const [filterInputValue, setFilterInputValue] = useState(initialFilters);
    const [selectedMobileItem, setSelectedMobileItem] = useState(null);
    const [ConfirmationBox, confirm] = useConfirm();
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const firstRenderRef = useRef(false);
    const [resetBtnOnOf, setResetBtnOnOf] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
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
            searchFilterValue?.customer_id && {
                accessorKey: 'select',
                header: t('#'),
                isSkipColumn: true,
                cell: ({ row }) => (
                    <input
                        type="checkbox"
                        checked={selectedRows.includes(row.original.id)}
                        onChange={() => handleRowSelect(row.original.id)}
                        className="h-4 w-4 rounded border-border"
                    />
                ),
            },
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
                accessorKey: 'sale_number',
                header: t('Sale #'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {row.original.sale_number}
                    </span>
                ),
            },
            {
                accessorKey: 'customer_name',
                header: t('Customer'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {row.original.customer_name || 'Walk-in'}
                    </span>
                ),
                footer: () => (
                    <span className="text-foreground">{t('Summary')}</span>
                ),
            },
            {
                accessorKey: 'sale_type_name',
                header: t('Type'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {row.original.sale_type_name}
                    </span>
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
                accessorKey: 'total_paid',
                header: t('Paid'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {Number(row.original.total_paid).toLocaleString()}
                    </span>
                ),
                footer: () => (
                    <span className="text-foreground">
                        {Number(summary.total_paid).toLocaleString()}
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
                header: t('Payment'),
                cell: ({ row }) => (
                    <Status status={row.original.payment_status_name} />
                ),
                cellMobileView: (mobileViewData) => (
                    <DetailRow label="Payment">
                        <Status status={mobileViewData.payment_status_name} />
                    </DetailRow>
                ),
            },
            {
                accessorKey: 'sale_date',
                header: t('Date'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {row.original.sale_date}
                    </span>
                ),
            },
            {
                accessorKey: 'action',
                header: t('Action'),
                cell: ({ row }) => (
                    <SaleActionButton
                        rowItemData={row.original}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                    />
                ),
                cellMobileView: (mobileViewData) => (
                    <DetailRow label="Action">
                        <SaleActionButton
                            rowItemData={mobileViewData}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                        />
                    </DetailRow>
                ),
            },
        ],
        [t, data, selectedRows, searchFilterValue?.customer_id, summary],
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
                id: 'sale_type',
                label: t('Sale Type'),
                render: ({ values, onChange }) => (
                    <div className="space-y-3 p-1">
                        <BasicSelect
                            options={saleTypeOptions}
                            value={values?.sale_type}
                            onChange={(val) => onChange('sale_type', val)}
                            placeholder={t('Select Sale Type')}
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
                                handleSelectInputChange('customer_id', value)
                            }
                            isLoading={isLoadingCustomer}
                            options={customerOptions}
                            onChange={(value) => onChange('customer_id', value)}
                            placeholder="Select Customer"
                        />
                    </div>
                ),
            },

            {
                id: 'imei',
                label: t('IMEI'),
                render: ({ values, onChange }) => {
                    return (
                        <div className="space-y-3 p-1">
                            <IconInput
                                value={values?.imei || ''}
                                onChange={(e) =>
                                    onChange('imei', e.target.value)
                                }
                                placeholder="Enter IMEI"
                            />
                        </div>
                    );
                },
            },

            // batch number
            {
                id: 'batch_number',
                label: t('GLOT #'),
                render: ({ values, onChange }) => {
                    return (
                        <div className="space-y-3 p-1">
                            <IconInput
                                value={values?.batch_number || ''}
                                onChange={(e) =>
                                    onChange('batch_number', e.target.value)
                                }
                                placeholder="Enter Batch Number"
                            />
                        </div>
                    );
                },
            },

            {
                id: 'sale_date',
                label: t('Date'),
                render: ({ values, onChange }) => {
                    return (
                        <div className="space-y-3 p-1">
                            <SmartDatePicker
                                mode="range"
                                valueClass="lg:max-w-32 w-full"
                                value={parseDateRange(values?.sale_date)}
                                onChange={(value) => {
                                    onChange(
                                        'sale_date',
                                        formatDateRange(value),
                                    );
                                }}
                                includeTime={false}
                                placeholder="Select date"
                            />
                        </div>
                    );
                },
            },
        ],
        [t, filterInputValue, customerOptions, isLoadingCustomer],
    );

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
            <SaleMobileViewCard
                key={item.id}
                data={item}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                onClick={() => setSelectedMobileItem(item)}
            />
        ));
    };

    const mobileViewDetailSheet = () => {
        return (
            <SaleMobileDetailSheet
                isOpen={!!selectedMobileItem}
                onClose={() => setSelectedMobileItem(null)}
                data={selectedMobileItem}
                tableColumnsDefinitions={tableColumnsDefinitions}
            />
        );
    };

    const handleRowSelect = (id) => {
        setSelectedRows((prev) =>
            prev.includes(id)
                ? prev.filter((rowId) => rowId !== id)
                : [...prev, id],
        );
    };

    const handleEdit = (data) => {
        router.visit(`/sales/${data.id}/edit`);
    };

    const handleSelectInputChange = (key, value) => {
        if (key === 'customer_id') {
            debounceSelectInputChange(value, setCustomerSearch);
        }
    };

    const handleFilterChange = (key, value) => {
        if (key === 'search') {
            setFilterInputValue((prev) => ({ ...prev, search: value }));
            debounceSearch(key, value);
        } else if (key === 'customer_id') {
            setFilterInputValue((prev) => ({
                ...prev,
                [key]: value,
                page: 1,
            }));
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

    const handleSearch = (searchData) => {
        setLoading(true);
        const generateQueryParams = generateParams(searchData);
        if (resetBtnOnOfCheck(generateQueryParams)) {
            setResetBtnOnOf(true);
        } else {
            setResetBtnOnOf(false);
        }

        router.visit('/sales', {
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
            title: 'Delete this sale?',
            description: `The sale <span class="bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-bold">"${data.sale_number}"</span> will be permanently removed. This action cannot be undone.`,
            variant: 'destructive',
            confirmText: 'Yes, Delete It',
        });

        if (ok) {
            router.delete(`/sales/${data.id}`, {
                onSuccess: (response) => {
                    if (response?.props?.flash?.success) {
                        toast.success(response.props.flash.success);
                    } else if (response?.props?.flash?.error) {
                        toast.error(response.props.flash.error);
                    }
                    if (selectedMobileItem) {
                        setSelectedMobileItem(null);
                    }
                },
            });
        }
    };

    return (
        <DashboardLayout>
            <Head title="Sales" />
            <div className="relative bg-background font-sans text-foreground">
                <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {t('Sales')}
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

                        {selectedRows.length > 0 &&
                            permissions['create sale'] && (
                                <Button
                                    onClick={() =>
                                        router.get('/sales/multiple-payment', {
                                            ids: selectedRows,
                                            customer_id:
                                                searchFilterValue?.customer_id,
                                        })
                                    }
                                    variant="success"
                                    className="text-white"
                                >
                                    <Plus className="h-4 w-4" />
                                    {t('Add Multiple Payment')} (
                                    {selectedRows.length})
                                </Button>
                            )}

                        {permissions['create sale'] && (
                            <Button
                                variant="accent"
                                onClick={() => setIsImportModalOpen(true)}
                            >
                                <Upload className="h-4 w-4" />
                                {t('Import CSV')}
                            </Button>
                        )}

                        {permissions['create sale'] && (
                            <Link href="/sales/create">
                                <Button variant="gradient">
                                    <Plus className="h-4 w-4" />
                                    {t('Create Sale')}
                                </Button>
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center justify-between md:hidden">
                        <span className="text-lg font-bold text-foreground">
                            {t('Sale #')}
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
                            </button>
                        </div>
                    </div>
                </div>

                <div className="h-[calc(100vh-170px)]">
                    <DataTable
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
            <ConfirmationBox />

            <SaleImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                handleSubmitted={({ responseFlashMessage }) => {
                    setIsImportModalOpen(false);
                    if (responseFlashMessage?.props?.flash?.success) {
                        toast.success(responseFlashMessage.props.flash.success);
                    }
                }}
            />
        </DashboardLayout>
    );
}
