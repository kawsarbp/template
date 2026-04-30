import DetailRow from '@/components/custom-component/DetailRow';
import Status from '@/components/custom-component/Status';
import ThumbnailViewer from '@/components/custom-component/ThumbnailViewer';
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
import { useConfirm } from '@/hooks/useConfirm';
import useDebounce from '@/hooks/useDebounce';
import { useLanguage } from '@/hooks/useLanguage';
import { usePortal } from '@/hooks/usePortal';
import {
    fileRouteHandler,
    generateParams,
    resetBtnOnOfCheck,
} from '@/lib/helper';
import { debounceInterval } from '@/lib/utils';
import { Head, Link, router, usePage } from '@inertiajs/react';
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
import ProductActionButton from './ProductActionButton';
import ProductImportModal from './ProductImportModal';
import { ProductMobileDetailSheet } from './ProductMobileDetailSheet';
import { ProductMobileViewCard } from './ProductMobileViewCard';
import ProductModal from './ProductModal';

const breadcrumbs = [{ label: 'Product' }];

const initialFilters = {
    search: '',
    stock_status: '',
    brand_id: '',
    page: 1,
    limit: 20,
};

const initialFilterInputValue = {
    ...initialFilters,
};

export default function Products(props) {
    const data = props?.data?.data ?? [];
    const permissions = props?.permissions ?? {};
    const filters = props?.data?.filters ?? {};
    const { t } = useLanguage();
    const { url } = usePage();
    // Core State
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [editData, setEditData] = useState({});
    const [searchFilterValue, setSearchFilterValue] = useState(initialFilters);
    const [filterInputValue, setFilterInputValue] = useState(initialFilters);
    const [selectedMobileItem, setSelectedMobileItem] = useState(null);
    const [ConfirmationBox, confirm] = useConfirm();
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [excelLoading, setExcelLoading] = useState(false);
    const firstRenderRef = useRef(false);
    const [resetBtnOnOf, setResetBtnOnOf] = useState(false);
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const portal = usePortal('product-modal');
    const importPortal = usePortal('product-import-modal');

    const [brandsOptions, setBrandsOptions] = useState([]);
    const [brandsSearch, setBrandsSearch] = useState('');

    const { data: brandsData, loading: isLoadingBrands } = useAxiosFetch({
        url: `/search/brands?search=${brandsSearch}`,
    });

    const debounceSelectInputChange = useDebounce((value, stateFunction) => {
        stateFunction(value);
    }, debounceInterval);

    // search filter debounce
    const debounceSearch = useDebounce((name, value) => {
        setSearchFilterValue({ ...searchFilterValue, [name]: value, page: 1 });
    }, debounceInterval);

    useEffect(() => {
        if (brandsData) {
            setBrandsOptions(brandsData?.data);
        }
    }, [brandsData]);

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
                    if (key === 'brand_id') {
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
                accessorKey: 'thumbnail',
                header: t('Thumbnail'),
                cell: ({ row }) => (
                    <div className="font-medium text-muted-foreground">
                        {row?.original?.thumbnail && (
                            <ThumbnailViewer
                                imageUrl={row.original.thumbnail}
                            />
                        )}
                    </div>
                ),
                cellMobileView: (mobileViewData) => (
                    <DetailRow label="Thumbnail">
                        {mobileViewData?.thumbnail && (
                            <ThumbnailViewer
                                imageUrl={mobileViewData.thumbnail}
                            />
                        )}
                    </DetailRow>
                ),
            },

            {
                accessorKey: 'title',
                header: t('Title'),
                cell: ({ row }) => (
                    <div className="font-medium text-muted-foreground">
                        {row.original.title}
                    </div>
                ),
            },
            {
                accessorKey: 'sku',
                header: t('Sku'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {row.original.sku}
                    </span>
                ),
            },

            {
                accessorKey: 'brand',
                header: t('Brand'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {row.original.brand}
                    </span>
                ),
            },

            {
                accessorKey: 'model',
                header: t('Model'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {row.original.model}
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
                accessorKey: 'stock_status',
                header: t('Stock Status'),
                cell: ({ row }) => (
                    <div className="flex items-center gap-1.5">
                        <Status status={row.original.stock_status} />
                        {row.original.available_stock_count > 0 && (
                            <Link
                                href={`/stocks?product_id=${row?.original.id}&status=1`}
                                className="text-primary underline"
                            >
                                <span className="text-xs font-medium">
                                    ({row.original.available_stock_count})
                                </span>
                            </Link>
                        )}
                    </div>
                ),
                cellMobileView: (mobileViewData) => (
                    <DetailRow label="Stock Status">
                        <div className="flex items-center gap-1.5">
                            <Status status={mobileViewData?.stock_status} />
                            {mobileViewData?.available_stock_count > 0 && (
                                <span className="text-xs font-medium text-muted-foreground">
                                    ({mobileViewData.available_stock_count})
                                </span>
                            )}
                        </div>
                    </DetailRow>
                ),
            },

            {
                accessorKey: 'is_active_name',
                header: t('Active'),
                cell: ({ row }) => (
                    <Status status={row.original.is_active_name} />
                ),
                cellMobileView: (mobileViewData) => (
                    <DetailRow label="Active">
                        <Status status={mobileViewData?.is_active_name} />
                    </DetailRow>
                ),
            },

            {
                accessorKey: 'action',
                header: t('Action'),
                cell: ({ row }) => (
                    <ProductActionButton
                        rowItemData={row.original}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                    />
                ),
                cellMobileView: (mobileViewData) => (
                    <DetailRow label="Action">
                        <ProductActionButton
                            rowItemData={mobileViewData}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                        />
                    </DetailRow>
                ),
            },
        ],
        [t, data],
    );
    const myCustomFilters = useMemo(
        () => [
            {
                id: 'stock_status',
                label: t('Stock Status'),
                render: ({ values, onChange }) => {
                    return (
                        <div className="space-y-3 p-1">
                            <BasicSelect
                                options={[
                                    { value: '', label: t('All') },
                                    { value: 'in_stock', label: t('In Stock') },
                                    {
                                        value: 'out_of_stock',
                                        label: t('Out of Stock'),
                                    },
                                ]}
                                value={values?.stock_status}
                                onChange={(val) =>
                                    onChange('stock_status', val)
                                }
                                placeholder={t('Select Stock Status')}
                            />
                        </div>
                    );
                },
            },
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
                                isLoading={isLoadingBrands}
                                options={brandsOptions}
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
        [t, filterInputValue, brandsOptions, isLoadingBrands],
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
            <ProductMobileViewCard
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
            <ProductMobileDetailSheet
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
        if (key === 'brand_id') {
            debounceSelectInputChange(value, setBrandsSearch);
        }
    };

    const handleFilterChange = (key, value) => {
        if (key === 'search') {
            setFilterInputValue((prev) => ({ ...prev, [key]: value }));
            debounceSearch(key, value);
        } else if (key === 'brand_id') {
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

        router.visit('/products', {
            method: 'get',
            data: generateQueryParams,
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setLoading(false);
            },
        });
    };

    // response flash message
    const handleSubmitted = ({ responseFlashMessage, updateData }) => {
        if (responseFlashMessage?.props?.flash?.success) {
            if (updateData && selectedMobileItem) {
                setSelectedMobileItem((prev) => ({
                    ...prev,
                    ...updateData,
                    status: productStatusOptions.find(
                        (option) => option.value == updateData.status,
                    )?.label,
                    is_active_name: updateData.is_active == 1 ? 'YES' : 'NO',
                    is_featured_name:
                        updateData.is_featured == 1 ? 'YES' : 'NO',
                }));
            }
            toast.success(responseFlashMessage?.props?.flash?.success);
            setIsImportOpen(false);
            if (responseFlashMessage?.props?.flash?.redirect_url) {
                window.open(
                    responseFlashMessage?.props?.flash?.redirect_url,
                    '_blank',
                );
            }
            setIsOpen(false);
        } else if (responseFlashMessage?.props?.flash?.error) {
            toast.error(responseFlashMessage?.props?.flash?.error);
        }
    };

    // delete function
    const handleDelete = async (data) => {
        const ok = await confirm({
            title: 'Delete this product?',
            description: `The product <span class="bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-bold">"${data.title}"</span> will be permanently removed. This action cannot be undone.`,
            variant: 'destructive',
            confirmText: 'Yes, Delete It',
        });

        if (ok) {
            router.delete(`/products/${data.id}`, {
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
        <DashboardLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <div className="relative bg-background font-sans text-foreground">
                <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {t('Products')}
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

                        {permissions['export excel product'] && (
                            <Button
                                onClick={() =>
                                    fileRouteHandler({
                                        url: 'products/export-excel',
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

                        {permissions['create product'] && (
                            <Button
                                onClick={() => setIsImportOpen(true)}
                                variant="outline"
                            >
                                <Upload className="h-4 w-4" />
                                {t('Import')}
                            </Button>
                        )}

                        {permissions['create product'] && (
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
                            {t('Title')}
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
                    <ProductModal
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        handleSubmitted={handleSubmitted}
                        editData={editData}
                    />,
                )}
            {isImportOpen &&
                importPortal(
                    <ProductImportModal
                        isOpen={isImportOpen}
                        onClose={() => setIsImportOpen(false)}
                        handleSubmitted={handleSubmitted}
                    />,
                )}
            <ConfirmationBox />
        </DashboardLayout>
    );
}
