import DetailRow from '@/components/custom-component/DetailRow';
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
import { usePortal } from '@/hooks/usePortal';
import {
    fileRouteHandler,
    formatDateRange,
    generateParams,
    parseDateRange,
    resetBtnOnOfCheck,
} from '@/lib/helper';
import { paymentStatusOptions } from '@/lib/options';
import { debounceInterval } from '@/lib/utils';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Columns,
    Download,
    Filter,
    Loader2,
    Plus,
    Search,
    Upload,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import StockPurchaseActionButton from './StockPurchaseActionButton';
import StockPurchaseImportModal from './StockPurchaseImportModal';
import { StockPurchaseMobileDetailSheet } from './StockPurchaseMobileDetailSheet';
import { StockPurchaseMobileViewCard } from './StockPurchaseMobileViewCard';
import StockPurchaseModal from './StockPurchaseModal';

const fmtAmt = (n, currency) =>
    `${Number(n).toLocaleString()} ${currency}`;

const initialFilters = {
    search: '',
    payment_status: '',
    supplier_id: '',
    purchase_date: '',
    page: 1,
    limit: 20,
};

const initialFilterInputValue = {
    ...initialFilters,
};

export default function StockPurchases(props) {
    const data = props?.data?.data ?? [];
    const permissions = props?.permissions ?? {};
    const filters = props?.data?.filters ?? {};
    const summary = props?.data?.summary ?? { total_amount: 0, total_paid: 0, total_due: 0 };
    const { t } = useLanguage();
    const { url } = usePage();
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [editData, setEditData] = useState({});
    const [searchFilterValue, setSearchFilterValue] = useState(initialFilters);
    const [filterInputValue, setFilterInputValue] = useState(initialFilters);
    const [selectedMobileItem, setSelectedMobileItem] = useState(null);
    const [ConfirmationBox, confirm] = useConfirm();
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const firstRenderRef = useRef(false);
    const [resetBtnOnOf, setResetBtnOnOf] = useState(false);
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const [excelLoading, setExcelLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const portal = usePortal('stock-purchase-modal');
    const importPortal = usePortal('stock-purchase-import-modal');

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
        limit: props?.data?.meta?.per_page || 20,
        last_page: props?.data?.meta?.last_page || 0,
        total: props?.data?.meta?.total || 0,
        to: props?.data?.meta?.to || 0,
        from: props?.data?.meta?.from || 0,
    };

    const handleRowSelect = (id) => {
        setSelectedRows((prev) =>
            prev.includes(id)
                ? prev.filter((rowId) => rowId !== id)
                : [...prev, id],
        );
    };

    const tableColumnsDefinitions = useMemo(
        () =>
            [
                searchFilterValue?.supplier_id && {
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
                    accessorKey: 'batch_number',
                    header: t('GLOT #'),
                    cell: ({ row }) => (
                        <span className="font-medium text-muted-foreground">
                            {row.original.batch_number}
                        </span>
                    ),
                },
                {
                    accessorKey: 'supplier_name',
                    header: t('Supplier'),
                    cell: ({ row }) => (
                        <span className="font-medium text-muted-foreground">
                            {row.original.supplier_name || 'N/A'}
                        </span>
                    ),
                    footer: () => (
                        <span className="text-foreground">{t('Summary')}</span>
                    ),
                },
                {
                    accessorKey: 'total_units',
                    header: t('Total Units'),
                    cell: ({ row }) => (
                        <span className="font-medium text-muted-foreground">
                            {row.original.total_units}
                        </span>
                    ),
                },
                {
                    accessorKey: 'total_amount',
                    header: t('Total Amount'),
                    cell: ({ row }) => (
                        <span className="font-medium text-muted-foreground">
                            {fmtAmt(row.original.total_amount, 'AED')}
                        </span>
                    ),
                    footer: () => (
                        <span className="text-foreground">
                            {fmtAmt(summary.total_amount, 'AED')}
                        </span>
                    ),
                },
                {
                    accessorKey: 'total_paid',
                    header: t('Total Paid'),
                    cell: ({ row }) => (
                        <span className="font-medium text-muted-foreground">
                            {fmtAmt(row.original.total_paid, 'AED')}
                        </span>
                    ),
                    footer: () => (
                        <span className="text-foreground">
                            {fmtAmt(summary.total_paid, 'AED')}
                        </span>
                    ),
                },
                {
                    accessorKey: 'total_due',
                    header: t('Total Due'),
                    cell: ({ row }) => (
                        <span className="font-medium text-muted-foreground">
                            {fmtAmt(row.original.total_due, 'AED')}
                        </span>
                    ),
                    footer: () => (
                        <span className="text-foreground">
                            {fmtAmt(summary.total_due, 'AED')}
                        </span>
                    ),
                },
                {
                    accessorKey: 'payment_status',
                    header: t('Payment Status'),
                    cell: ({ row }) => (
                        <Status status={row.original.payment_status_name} />
                    ),
                    cellMobileView: (mobileViewData) => (
                        <DetailRow label="Payment Status">
                            <Status
                                status={mobileViewData.payment_status_name}
                            />
                        </DetailRow>
                    ),
                },
                {
                    accessorKey: 'purchase_date',
                    header: t('Purchase Date'),
                    cell: ({ row }) => (
                        <span className="font-medium text-muted-foreground">
                            {row.original.purchase_date}
                        </span>
                    ),
                },
                {
                    accessorKey: 'action',
                    header: t('Action'),
                    cell: ({ row }) => (
                        <StockPurchaseActionButton
                            rowItemData={row.original}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                        />
                    ),
                    cellMobileView: (mobileViewData) => (
                        <DetailRow label="Action">
                            <StockPurchaseActionButton
                                rowItemData={mobileViewData}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                            />
                        </DetailRow>
                    ),
                },
            ].filter(Boolean),
        [t, data, selectedRows, searchFilterValue?.supplier_id, summary],
    );

    const myCustomFilters = useMemo(
        () => [
            {
                id: 'data_group',
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
                id: 'purchase_date',
                label: t('Purchase Date'),
                render: ({ values, onChange }) => {
                    return (
                        <div className="space-y-3 p-1">
                            <SmartDatePicker
                                mode="range"
                                valueClass="lg:max-w-32 w-full"
                                value={parseDateRange(values?.purchase_date)}
                                onChange={(value) => {
                                    console.log(value);
                                    onChange(
                                        'purchase_date',
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

            {
                id: 'supplier_id',
                label: t('Supplier'),
                render: ({ values, onChange }) => {
                    return (
                        <div className="space-y-3 p-1">
                            <ServerSearchSelect
                                value={values?.supplier_id || ''}
                                onInputChange={(value) =>
                                    handleSelectInputChange(
                                        'supplier_id',
                                        value,
                                    )
                                }
                                isLoading={isLoadingSupplier}
                                options={supplierOptions}
                                onChange={(value) =>
                                    onChange('supplier_id', value)
                                }
                                placeholder="Select Supplier"
                            />
                        </div>
                    );
                },
            },
        ],
        [t, filterInputValue, supplierOptions, isLoadingSupplier],
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
            <StockPurchaseMobileViewCard
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
            <StockPurchaseMobileDetailSheet
                isOpen={!!selectedMobileItem}
                onClose={() => setSelectedMobileItem(null)}
                data={selectedMobileItem}
                handleEdit={handleEdit}
                tableColumnsDefinitions={tableColumnsDefinitions}
            />
        );
    };

    const handleEdit = (data) => {
        setEditData({ id: data.id });
        setIsOpen(true);
    };

    // handle select input change
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

        router.visit('/stock-purchases', {
            method: 'get',
            data: generateQueryParams,
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setLoading(false);
            },
        });
    };

    const handleSubmitted = ({ responseFlashMessage, updateData }) => {
        if (responseFlashMessage?.props?.flash?.success) {
            if (updateData && selectedMobileItem) {
                setSelectedMobileItem((prev) => ({
                    ...prev,
                    ...updateData,
                }));
            }
            toast.success(responseFlashMessage?.props?.flash?.success);
            setIsOpen(false);
            setIsImportOpen(false);
            setSelectedRows([]);
        } else if (responseFlashMessage?.props?.flash?.error) {
            toast.error(responseFlashMessage?.props?.flash?.error);
        }
    };

    const handleDelete = async (data) => {
        const ok = await confirm({
            title: 'Delete this stock purchase?',
            description: `The batch <span class="bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-bold">"${data.batch_number}"</span> will be permanently removed. This action cannot be undone.`,
            variant: 'destructive',
            confirmText: 'Yes, Delete It',
        });

        if (ok) {
            router.delete(`/stock-purchases/${data.id}`, {
                onSuccess: (response) => {
                    handleSubmitted({ responseFlashMessage: response });
                    if (selectedMobileItem) {
                        setSelectedMobileItem(null);
                    }
                },
            });
        }
    };

    return (
        <DashboardLayout>
            <Head title="Stock Purchases" />
            <div className="relative bg-background font-sans text-foreground">
                <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {t('Stock Purchases')}
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

                        {permissions['export excel stock'] && (
                            <Button
                                onClick={() =>
                                    fileRouteHandler({
                                        url: 'stock-purchases/export-excel',
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
                                Export
                            </Button>
                        )}

                        {permissions['create stock'] && (
                            <Button
                                onClick={() => setIsImportOpen(true)}
                                variant="outline"
                            >
                                <Upload className="h-4 w-4" />
                                {t('Import')}
                            </Button>
                        )}

                        {selectedRows.length > 0 &&
                            permissions['create stock'] && (
                                <Button
                                    onClick={() =>
                                        router.get(
                                            '/stock-purchases/multiple-payment',
                                            {
                                                ids: selectedRows,
                                                supplier_id:
                                                    searchFilterValue?.supplier_id,
                                            },
                                        )
                                    }
                                    variant="success"
                                    className="text-white"
                                >
                                    <Plus className="h-4 w-4" />
                                    {t('Add Multiple Payment')} (
                                    {selectedRows.length})
                                </Button>
                            )}

                        {permissions['create stock'] && (
                            <Button
                                onClick={() => {
                                    setIsOpen(true);
                                    setEditData(null);
                                }}
                                variant="gradient"
                            >
                                <Plus className="h-4 w-4" />
                                Create
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center justify-between md:hidden">
                        <span className="text-lg font-bold text-foreground">
                            {t('GLOT #')}
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
                                {Object.keys(filterInputValue).length > 0 && (
                                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-card bg-green-500"></span>
                                )}
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
            {isOpen &&
                portal(
                    <StockPurchaseModal
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        handleSubmitted={handleSubmitted}
                        editData={editData}
                    />,
                )}
            {isImportOpen &&
                importPortal(
                    <StockPurchaseImportModal
                        isOpen={isImportOpen}
                        onClose={() => setIsImportOpen(false)}
                        handleSubmitted={handleSubmitted}
                    />,
                )}
            <ConfirmationBox />
        </DashboardLayout>
    );
}
