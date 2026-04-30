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
import { Input } from '@/components/ui/input';
import useAxiosFetch from '@/hooks/useAxiosFetch';
import useDebounce from '@/hooks/useDebounce';
import { useLanguage } from '@/hooks/useLanguage';
import {
    fileRouteHandler,
    generateParams,
    resetBtnOnOfCheck,
} from '@/lib/helper';
import { stockStatusOptions } from '@/lib/options';
import { debounceInterval } from '@/lib/utils';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Columns,
    Download,
    Filter,
    Loader2,
    RefreshCw,
    Search,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import ImeiReplaceImportModal from './ImeiReplaceImportModal';
import { StockMobileViewCard } from './StockMobileViewCard';

const initialFilters = {
    search: '',
    status: '',
    condition_id: '',
    product_id: '',
    brand_id: '',
    page: 1,
    limit: 20,
};

const initialFilterInputValue = {
    ...initialFilters,
};

export default function Stocks(props) {
    const data = props?.data?.data ?? [];
    const filters = props?.data?.filters ?? {};
    const permissions = props?.permissions ?? {};
    const summary = props?.data?.summary ?? {
        total_purchase_price: 0,
        total_sale_price: 0,
    };
    const { t } = useLanguage();
    const { url } = usePage();
    const [loading, setLoading] = useState(false);
    const [excelLoading, setExcelLoading] = useState(false);
    const [isImeiReplaceModalOpen, setIsImeiReplaceModalOpen] = useState(false);
    const [searchFilterValue, setSearchFilterValue] = useState(initialFilters);
    const [filterInputValue, setFilterInputValue] = useState(initialFilters);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const firstRenderRef = useRef(false);
    const [resetBtnOnOf, setResetBtnOnOf] = useState(false);
    const queryParams = new URLSearchParams(url.split('?')[1]);

    const [productOptions, setProductOptions] = useState([]);
    const [productSearch, setProductSearch] = useState('');

    const [conditionOptions, setConditionOptions] = useState([]);
    const [conditionSearch, setConditionSearch] = useState('');

    const [brandOptions, setBrandOptions] = useState([]);
    const [brandSearch, setBrandSearch] = useState('');

    const { data: productData, loading: isLoadingProduct } = useAxiosFetch({
        url: `/search/products?search=${productSearch}`,
    });
    const { data: conditionData, loading: isLoadingCondition } = useAxiosFetch({
        url: `/search/conditions?search=${conditionSearch}`,
    });

    const { data: brandData, loading: isLoadingBrand } = useAxiosFetch({
        url: `/search/brands?search=${brandSearch}`,
    });

    const debounceSelectInputChange = useDebounce((value, stateFunction) => {
        stateFunction(value);
    }, debounceInterval);

    const debounceSearch = useDebounce((name, value) => {
        setSearchFilterValue({ ...searchFilterValue, [name]: value, page: 1 });
    }, debounceInterval);

    useEffect(() => {
        if (productData) {
            setProductOptions(productData?.data);
        }
    }, [productData]);

    useEffect(() => {
        if (conditionData) {
            setConditionOptions(conditionData?.data);
        }
    }, [conditionData]);

    // set brand options
    useEffect(() => {
        if (brandData) {
            setBrandOptions(brandData?.data);
        }
    }, [brandData]);

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
                        case 'product_id':
                            searchInitialInputObj[key] = filters?.product;
                            break;
                        case 'condition_id':
                            searchInitialInputObj[key] = filters?.condition;
                            break;
                        case 'brand_id':
                            searchInitialInputObj[key] = filters?.brand;
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
                    if (
                        key === 'product_id' ||
                        key === 'condition_id' ||
                        key === 'brand_id'
                    ) {
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
                accessorKey: 'imei',
                header: t('IMEI'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {row.original.imei || 'N/A'}
                    </span>
                ),
                footer: () => (
                    <span className="text-foreground">{t('Summary')}</span>
                ),
            },
            {
                accessorKey: 'batch_number',
                header: t('GLOT #'),
                cell: ({ row }) => (
                    <Link
                        href={`/stock-purchases/${row.original?.stock_purchase_id}`}
                        className="text-primary hover:underline"
                    >
                        {row.original.batch_number}
                    </Link>
                ),
            },
            {
                accessorKey: 'product',
                header: t('Product'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {row.original.product_brand}{' '}
                        {row.original.product_model}
                    </span>
                ),
            },
            {
                accessorKey: 'condition',
                header: t('Condition'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {row.original.condition}
                    </span>
                ),
            },
            {
                accessorKey: 'purchase_price',
                header: t('Purchase Price'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {Number(row.original.purchase_price).toLocaleString()}
                    </span>
                ),
                footer: () => (
                    <span className="text-foreground">
                        {Number(summary.total_purchase_price).toLocaleString()}
                    </span>
                ),
            },
            {
                accessorKey: 'sale_price',
                header: t('Sale Price'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {row.original.sale_price
                            ? Number(row.original.sale_price).toLocaleString()
                            : 'N/A'}
                    </span>
                ),
                footer: () => (
                    <span className="text-foreground">
                        {Number(summary.total_sale_price).toLocaleString()}
                    </span>
                ),
            },
            {
                accessorKey: 'status',
                header: t('Status'),
                cell: ({ row }) => <Status status={row.original.status_name} />,
                cellMobileView: (mobileViewData) => (
                    <DetailRow label="Status">
                        <Status status={mobileViewData.status_name} />
                    </DetailRow>
                ),
            },
        ],
        [t, data],
    );

    const myCustomFilters = useMemo(
        () => [
            {
                id: 'data_group',
                label: t('Filters'),
                render: ({ values, onChange }) => (
                    <div className="space-y-3 p-1">
                        <BasicSelect
                            options={stockStatusOptions}
                            value={values?.status}
                            onChange={(val) => onChange('status', val)}
                            placeholder={t('Select Status')}
                        />
                    </div>
                ),
            },
            {
                id: 'condition_id',
                label: t('Condition'),
                render: ({ values, onChange }) => {
                    return (
                        <div className="space-y-3 p-1">
                            <ServerSearchSelect
                                value={values?.condition_id || ''}
                                onInputChange={(value) =>
                                    handleSelectInputChange(
                                        'condition_id',
                                        value,
                                    )
                                }
                                isLoading={isLoadingCondition}
                                options={conditionOptions}
                                onChange={(value) =>
                                    onChange('condition_id', value)
                                }
                                placeholder={t('Select Condition')}
                            />
                        </div>
                    );
                },
            },

            {
                id: 'product_id',
                label: t('Product'),
                render: ({ values, onChange }) => {
                    return (
                        <div className="space-y-3 p-1">
                            <ServerSearchSelect
                                isToolTip={true}
                                value={values?.product_id || ''}
                                onInputChange={(value) =>
                                    handleSelectInputChange('product_id', value)
                                }
                                isLoading={isLoadingProduct}
                                options={productOptions}
                                onChange={(value) =>
                                    onChange('product_id', value)
                                }
                                placeholder="Select Product"
                            />
                        </div>
                    );
                },
            },

            // brand
            {
                id: 'brand_id',
                label: t('Brand'),
                render: ({ values, onChange }) => {
                    return (
                        <div className="space-y-3 p-1">
                            <ServerSearchSelect
                                value={values?.brand_id || ''}
                                onInputChange={(value) =>
                                    handleSelectInputChange('brand_id', value)
                                }
                                isLoading={isLoadingBrand}
                                options={brandOptions}
                                onChange={(value) =>
                                    onChange('brand_id', value)
                                }
                                placeholder="Select Brand"
                            />
                        </div>
                    );
                },
            },
        ],
        [
            t,
            filterInputValue,
            productOptions,
            isLoadingProduct,
            conditionOptions,
            isLoadingCondition,
            brandOptions,
            isLoadingBrand,
        ],
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
            <StockMobileViewCard key={item.id} data={item} />
        ));
    };

    // handle select input change
    const handleSelectInputChange = (key, value) => {
        if (key === 'product_id') {
            debounceSelectInputChange(value, setProductSearch);
        } else if (key === 'condition_id') {
            debounceSelectInputChange(value, setConditionSearch);
        } else if (key === 'brand_id') {
            debounceSelectInputChange(value, setBrandSearch);
        }
    };

    const handleFilterChange = (key, value) => {
        if (key === 'search') {
            setFilterInputValue((prev) => ({ ...prev, search: value }));
            debounceSearch(key, value);
        } else if (
            key === 'product_id' ||
            key === 'condition_id' ||
            key === 'brand_id'
        ) {
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

        router.visit('/stocks', {
            method: 'get',
            data: generateQueryParams,
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setLoading(false);
            },
        });
    };

    return (
        <DashboardLayout>
            <Head title="Stock Inventory" />
            <div className="relative bg-background font-sans text-foreground">
                <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {t('Stock Inventory')}
                    </h1>
                    <div className="flex flex-wrap items-end justify-end gap-2">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder={t('Search IMEI / Product')}
                                className="h-9 w-full border-border pl-9 focus-visible:ring-1 focus-visible:ring-ring sm:w-64"
                                value={filterInputValue?.search}
                                onChange={(e) =>
                                    handleFilterChange('search', e.target.value)
                                }
                            />
                        </div>

                        {permissions['update stock'] && (
                            <Button
                                onClick={() => setIsImeiReplaceModalOpen(true)}
                                variant="outline"
                            >
                                <RefreshCw className="h-4 w-4" />
                                {t('Replace IMEI')}
                            </Button>
                        )}

                        {permissions['export excel stock'] && (
                            <Button
                                onClick={() =>
                                    fileRouteHandler({
                                        url: 'stocks/export-excel',
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
                    </div>

                    <div className="flex items-center justify-between md:hidden">
                        <span className="text-lg font-bold text-foreground">
                            {t('IMEI')}
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

                <ImeiReplaceImportModal
                    isOpen={isImeiReplaceModalOpen}
                    onClose={() => setIsImeiReplaceModalOpen(false)}
                    handleSubmitted={({ responseFlashMessage }) => {
                        setIsImeiReplaceModalOpen(false);
                        if (responseFlashMessage?.props?.flash?.success) {
                            toast.success(
                                responseFlashMessage.props.flash.success,
                            );
                        }
                    }}
                />
            </div>
        </DashboardLayout>
    );
}
