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
import { useConfirm } from '@/hooks/useConfirm';
import useDebounce from '@/hooks/useDebounce';
import { useLanguage } from '@/hooks/useLanguage';
import { usePortal } from '@/hooks/usePortal';
import {
    fileRouteHandler,
    generateParams,
    resetBtnOnOfCheck,
} from '@/lib/helper';
import { statusOptionsForFilter } from '@/lib/options';
import { debounceInterval } from '@/lib/utils';
import { Head, router, usePage } from '@inertiajs/react';
import { Columns, Download, Filter, Loader2, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import UserActionButton from './UserActionButton';
import { UserMobileDetailSheet } from './UserMobileDetailSheet';
import { UserMobileViewCard } from './UserMobileViewCard';
import UserModal from './UserModal';
import UserPermissionModal from './UserPermissionModal';

const initialFilters = {
    search: '',
    status: '',
    role_id: '',
    page: 1,
    limit: 20,
};

const initialFilterInputValue = {
    ...initialFilters,
};

export default function Users(props) {
    const data = props?.data?.data ?? [];
    const permissions = props?.permissions ?? {};
    const filters = props?.data?.filters ?? {};
    const { t } = useLanguage();
    const { url } = usePage();
    // Core State
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [permissionId, setPermissionId] = useState(null);
    const [editData, setEditData] = useState({});
    const [searchFilterValue, setSearchFilterValue] = useState(initialFilters);
    const [filterInputValue, setFilterInputValue] = useState(initialFilters);
    const [selectedMobileItem, setSelectedMobileItem] = useState(null);
    const [ConfirmationBox, confirm] = useConfirm();
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const firstRenderRef = useRef(false);
    const [resetBtnOnOf, setResetBtnOnOf] = useState(false);
    const [excelLoading, setExcelLoading] = useState(false);
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const portal = usePortal('user-modal');

    // role state
    const [roleOptions, setRoleOptions] = useState([]);
    const [roleSearch, setRoleSearch] = useState('');

    const { data: rolesData, loading: isLoadingRoles } = useAxiosFetch({
        url: `/search/roles?search=${roleSearch}`,
    });

    const debounceSelectInputChange = useDebounce((value, stateFunction) => {
        stateFunction(value);
    }, debounceInterval);

    useEffect(() => {
        if (rolesData) {
            setRoleOptions(rolesData?.data);
        }
    }, [rolesData]);

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
                        case 'role_id':
                            searchInitialInputObj[key] = filters?.role;
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
                    if (key === 'role_id') {
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
                    <span className="font-medium text-muted-foreground">
                        {row.original.name}
                    </span>
                ),
            },

            {
                accessorKey: 'email',
                header: t('Email'),
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {row.original.email}
                    </span>
                ),
            },
            {
                accessorKey: 'role_name',
                header: t('Role Name'),
                footerClassName: 'text-right text-success',
                cell: ({ row }) => (
                    <span className="font-medium text-muted-foreground">
                        {row.original.role_name}
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

            {
                accessorKey: 'action',
                header: t('Action'),
                cell: ({ row }) => (
                    <UserActionButton
                        rowItemData={row.original}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        handlePermission={handlePermission}
                    />
                ),
                cellMobileView: (mobileViewData) => (
                    <DetailRow label="Action">
                        <UserActionButton
                            rowItemData={mobileViewData}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                            handlePermission={handlePermission}
                        />
                    </DetailRow>
                ),
            },
        ],
        [t],
    );
    const myCustomFilters = useMemo(
        () => [
            {
                id: 'data_group',
                label: t('Status'),
                render: ({ values, onChange }) => {
                    return (
                        <div className="space-y-3 p-1">
                            <BasicSelect
                                options={statusOptionsForFilter}
                                value={values?.status}
                                onChange={(val) => onChange('status', val)}
                                placeholder={t('Select Status')}
                            />
                        </div>
                    );
                },
            },
            {
                id: 'role',
                label: t('Role'),
                render: ({ values, onChange }) => {
                    return (
                        <div className="space-y-3 p-1">
                            <ServerSearchSelect
                                value={values?.role_id || ''}
                                onInputChange={(value) =>
                                    handleSelectInputChange('role_id', value)
                                }
                                isLoading={isLoadingRoles}
                                options={roleOptions}
                                onChange={(value) => onChange('role_id', value)}
                                placeholder="Select Role"
                            />
                        </div>
                    );
                },
            },
        ],
        [t, filterInputValue, isLoadingRoles, roleOptions],
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
            <UserMobileViewCard
                key={item.id}
                data={item}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handlePermission={handlePermission}
                onClick={() => setSelectedMobileItem(item)}
            />
        ));
    };

    const mobileViewDetailSheet = () => {
        return (
            <UserMobileDetailSheet
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

    const handlePermission = (data) => {
        setPermissionId(data.id);
        setIsPermissionModalOpen(true);
    };

    // handle select input change
    const handleSelectInputChange = (key, value) => {
        if (key === 'role_id') {
            debounceSelectInputChange(value, setRoleSearch);
        }
    };

    const handleFilterChange = (key, value) => {
        if (key === 'search') {
            setFilterInputValue((prev) => ({ ...prev, search: value }));
            debounceSearch(key, value);
        } else if (key === 'role_id') {
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

        router.visit('/users', {
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
                    status: updateData?.status == 1 ? 'Active' : 'Inactive',
                }));
            }
            toast.success(responseFlashMessage?.props?.flash?.success);
            setIsOpen(false);
            setIsPermissionModalOpen(false);
        } else if (responseFlashMessage?.props?.flash?.error) {
            toast.error(responseFlashMessage?.props?.flash?.error);
        }
    };

    // delete function
    const handleDelete = async (data) => {
        const ok = await confirm({
            title: 'Delete this user?',
            description: `The user <span class="bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-bold">"${data.name}"</span> will be permanently removed. This action cannot be undone.`,
            variant: 'destructive',
            confirmText: 'Yes, Delete It',
        });

        if (ok) {
            router.delete(`/users/${data.id}`, {
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
            <Head title="Users" />
            <div className="relative bg-background font-sans text-foreground">
                <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {t('Users')}
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

                        {permissions['export excel customer'] && (
                            <Button
                                onClick={() =>
                                    fileRouteHandler({
                                        url: `users/export-excel`,
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

                        {permissions['create user'] && (
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
                    <UserModal
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        handleSubmitted={handleSubmitted}
                        editData={editData}
                    />,
                )}
            {isPermissionModalOpen &&
                portal(
                    <UserPermissionModal
                        isOpen={isPermissionModalOpen}
                        onClose={() => setIsPermissionModalOpen(false)}
                        handleSubmitted={handleSubmitted}
                        permissionsUserId={permissionId}
                    />,
                )}
            <ConfirmationBox />
        </DashboardLayout>
    );
}
