import DetailRow from '@/components/custom-component/DetailRow';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { MobileFilterSheet } from '@/components/MobileFilterSheet';
import { ServerSearchSelect } from '@/components/ui/advanced-select';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/DataTable';
import useAxiosFetch from '@/hooks/useAxiosFetch';
import { useConfirm } from '@/hooks/useConfirm';
import useDebounce from '@/hooks/useDebounce';
import { useLanguage } from '@/hooks/useLanguage';
import { usePortal } from '@/hooks/usePortal';
import {
    fileRouteHandler,
    generateParams,
    objectToQueryParams,
    resetBtnOnOfCheck,
} from '@/lib/helper';
import { debounceInterval } from '@/lib/utils';
import { Head, router, usePage } from '@inertiajs/react';
import { Columns, Download, Filter, Loader2, Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import CustomerAdvanceActionButton from './CustomerAdvanceActionButton';
import { CustomerAdvanceMobileDetailSheet } from './CustomerAdvanceMobileDetailSheet';
import { CustomerAdvanceMobileViewCard } from './CustomerAdvanceMobileViewCard';
import CustomerAdvanceModal from './CustomerAdvanceModal';

const breadcrumbs = [{ label: 'Customer Advance' }];

const initialFilters = {
    customer_id: '',
    page: 1,
    limit: 20,
};

const initialFilterInputValue = {
    ...initialFilters,
};

export default function CustomerAdvance(props) {
    const data = props?.data?.data ?? [];
    const permissions = props?.permissions ?? {};
    const filters = props?.data?.filters ?? {};
    const { t } = useLanguage();
    const { url } = usePage();
    // Core State
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [editData, setEditData] = useState({});
    const [advanceType, setAdvanceType] = useState(null);
    const [searchFilterValue, setSearchFilterValue] = useState(initialFilters);
    const [filterInputValue, setFilterInputValue] = useState(initialFilters);
    const [selectedMobileItem, setSelectedMobileItem] = useState(null);
    const [ConfirmationBox, confirm] = useConfirm();
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const firstRenderRef = useRef(false);
    const [resetBtnOnOf, setResetBtnOnOf] = useState(false);
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const portal = usePortal('customer-advance-modal');
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
                accessorKey: 'name',
                header: t('Name'),
                cell: ({ row }) => (
                    <div className="font-medium text-muted-foreground">
                        {row.original.name}
                    </div>
                ),
            },

            {
                accessorKey: 'advance_payment_balance',
                header: t('Amount'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {row.original.advance_payment_balance}
                    </span>
                ),
            },

            {
                accessorKey: 'action',
                header: t('Action'),
                cell: ({ row }) => (
                    <CustomerAdvanceActionButton rowItemData={row.original} />
                ),
                cellMobileView: (mobileViewData) => (
                    <DetailRow label="Action">
                        <CustomerAdvanceActionButton
                            rowItemData={mobileViewData}
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
                id: 'customer_id',
                label: t('Customer'),
                render: ({ values, onChange }) => {
                    return (
                        <div className="space-y-3 p-1">
                            <ServerSearchSelect
                                value={values?.customer_id || ''}
                                onInputChange={(value) =>
                                    handleSelectInputChange(
                                        'customer_id',
                                        value,
                                    )
                                }
                                isLoading={isLoadingCustomer}
                                options={customerOptions}
                                onChange={(value) =>
                                    onChange('customer_id', value)
                                }
                                placeholder="Select Customer"
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
            <CustomerAdvanceMobileViewCard
                key={item.id}
                data={item}
                onClick={() => setSelectedMobileItem(item)}
            />
        ));
    };

    const mobileViewDetailSheet = () => {
        return (
            <CustomerAdvanceMobileDetailSheet
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

        router.visit('/advanced-accounts', {
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
                }));
            }
            toast.success(responseFlashMessage?.props?.flash?.success);
            if (responseFlashMessage?.props?.flash?.redirect_url) {
                window.open(
                    responseFlashMessage?.props?.flash?.redirect_url,
                    '_blank',
                );
            }
            setIsOpen(false);
            setAdvanceType(null);
        } else if (responseFlashMessage?.props?.flash?.error) {
            toast.error(responseFlashMessage?.props?.flash?.error);
        }
    };

    return (
        <DashboardLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Advance" />
            <div className="relative bg-background font-sans text-foreground">
                <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {t('Customer Advance')}
                    </h1>
                    <div className="flex flex-wrap items-end justify-end gap-2">
                        {permissions['export pdf advance account'] && (
                            <a
                                href={`advanced-accounts/export-pdf?${objectToQueryParams(searchFilterValue)}`}
                                target="_blank"
                            >
                                <Button variant="outline-accent">PDF</Button>
                            </a>
                        )}

                        {permissions['export excel advance account'] && (
                            <Button
                                onClick={() =>
                                    fileRouteHandler({
                                        url: 'advanced-accounts/export-excel',
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

                        {permissions['create advance account'] && (
                            <Button
                                onClick={() => {
                                    setAdvanceType('withdraw');
                                    setIsOpen(true);
                                    setEditData(null);
                                }}
                                variant="gradient-destructive"
                            >
                                <Plus className="h-4 w-4" />
                                {t('Withdraw')}
                            </Button>
                        )}
                        {permissions['create advance account'] && (
                            <Button
                                onClick={() => {
                                    setAdvanceType('deposit');
                                    setIsOpen(true);
                                    setEditData(null);
                                }}
                                variant="gradient"
                            >
                                <Plus className="h-4 w-4" />
                                {t('Deposit')}
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center justify-between md:hidden">
                        <span className="text-lg font-bold text-foreground">
                            {t('Name')}
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
                    <CustomerAdvanceModal
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        handleSubmitted={handleSubmitted}
                        editData={editData}
                        advanceType={advanceType}
                    />,
                )}
            <ConfirmationBox />
        </DashboardLayout>
    );
}
