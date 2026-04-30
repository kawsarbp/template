import DetailRow from '@/components/custom-component/DetailRow';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { MobileFilterSheet } from '@/components/MobileFilterSheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/DataTable';
import { Input } from '@/components/ui/input';
import { useConfirm } from '@/hooks/useConfirm';
import useDebounce from '@/hooks/useDebounce';
import { useLanguage } from '@/hooks/useLanguage';
import { usePortal } from '@/hooks/usePortal';
import { generateParams, resetBtnOnOfCheck } from '@/lib/helper';
import { debounceInterval } from '@/lib/utils';
import { Head, router, usePage } from '@inertiajs/react';
import { Columns, Filter, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import RoleActionButton from './RoleActionButton';
import { RoleMobileDetailSheet } from './RoleMobileDetailSheet';
import { RoleMobileViewCard } from './RoleMobileViewCard';
import RoleModal from './RoleModal';

const initialFilters = {
    search: '',
    page: 1,
    limit: 20,
};

const initialFilterInputValue = {
    ...initialFilters,
};

export default function Roles(props) {
    const data = props?.data?.data ?? [];
    const permissions = props?.permissions ?? {};
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
    const firstRenderRef = useRef(false);
    const [resetBtnOnOf, setResetBtnOnOf] = useState(false);
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const portal = usePortal('role-modal');

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
                        default:
                            searchInitialInputObj[key] = paramsValue;
                    }
                }
            }
            if (flagSetSearchQueryAndSearchInput) {
                setSearchFilterValue(searchInitialInputObj);
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
                accessorKey: 'name',
                header: t('Name'),
                cell: ({ row }) => (
                    <div className="font-medium text-muted-foreground">
                        {row.original.name}
                    </div>
                ),
            },

            {
                accessorKey: 'permission',
                header: t('Permission'),
                size: 850,
                cell: ({ row }) => (
                    <div className="flex flex-wrap gap-2">
                        {row.original.permissions.map((permission) => (
                            <Badge key={permission}>{permission}</Badge>
                        ))}
                    </div>
                ),
                cellMobileView: (mobileViewData) => (
                    <DetailRow label="Permission">
                        <div className="flex flex-wrap gap-2 pl-1">
                            {mobileViewData.permissions.map((permission) => (
                                <Badge
                                    key={permission}
                                    className="bg-primary/10 text-[8px] text-primary"
                                >
                                    {permission}
                                </Badge>
                            ))}
                        </div>
                    </DetailRow>
                ),
            },

            {
                accessorKey: 'action',
                header: t('Action'),
                cell: ({ row }) => (
                    <RoleActionButton
                        rowItemData={row.original}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                    />
                ),
                cellMobileView: (mobileViewData) => (
                    <DetailRow label="Action">
                        <RoleActionButton
                            rowItemData={mobileViewData}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                        />
                    </DetailRow>
                ),
            },
        ],
        [t],
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
            <RoleMobileViewCard
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
            <RoleMobileDetailSheet
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

    const handleFilterChange = (key, value) => {
        if (key === 'search') {
            setFilterInputValue((prev) => ({ ...prev, search: value }));
            debounceSearch(key, value);
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

        router.visit('/roles', {
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
            setIsOpen(false);
        } else if (responseFlashMessage?.props?.flash?.error) {
            toast.error(responseFlashMessage?.props?.flash?.error);
        }
    };

    // delete function
    const handleDelete = async (data) => {
        const ok = await confirm({
            title: 'Delete this role?',
            description: `The role <span class="bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-bold">"${data.name}"</span> will be permanently removed. This action cannot be undone.`,
            variant: 'destructive',
            confirmText: 'Yes, Delete It',
        });

        if (ok) {
            router.delete(`/roles/${data.id}`, {
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
            <Head title="Roles" />
            <div className="relative bg-background font-sans text-foreground">
                <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {t('Roles')}
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

                        {permissions['create role'] && (
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
                    filterInputValue={filterInputValue}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                    resetBtnOnOf={resetBtnOnOf}
                />
            </div>
            {isOpen &&
                portal(
                    <RoleModal
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        handleSubmitted={handleSubmitted}
                        editData={editData}
                    />,
                )}
            <ConfirmationBox />
        </DashboardLayout>
    );
}
