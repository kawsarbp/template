import InputField from '@/components/custom-component/InputField';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import useAxiosFetch from '@/hooks/useAxiosFetch';
import { useLanguage } from '@/hooks/useLanguage';
import { formSubmitErrorMessage } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const initialInputField = {
    name: '',
    permissions: [],
};

const RoleModal = ({ isOpen, onClose, handleSubmitted, editData = {} }) => {
    const { t } = useLanguage();
    const getUrl = editData?.id
        ? `/roles/${editData?.id}`
        : `/roles/module-permissions`;

    const { loading: isLoading, data } = useAxiosFetch({
        url: getUrl,
    });

    const [rolesData, setRolesData] = useState([]);
    const [allSelect, setAllSelect] = useState(false);

    const {
        data: initialData,
        setData: setInitialData,
        put,
        post,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm(initialInputField);

    // error message shoe
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            toast.error(formSubmitErrorMessage);
        }
    }, [JSON.stringify(errors)]);

    // Initial permissions ID extractor
    const initialPermissionsId = (permissionsDatas) => {
        const filterPermissionsIds = [];
        permissionsDatas.forEach((items) => {
            if (items.is_checked) {
                filterPermissionsIds.push(items?.id);
            }
        });
        return filterPermissionsIds;
    };

    // Set data for editing or initial permissions load
    useEffect(() => {
        if (data) {
            if (editData?.id) {
                let permArray = [];
                data?.data?.modules.forEach((module) => {
                    const permissionsChecked = initialPermissionsId(
                        module.permissions,
                    );
                    permArray = [...permArray, ...permissionsChecked];
                });

                setInitialData({
                    ...initialData,
                    name: data?.data.name,
                    permissions: permArray,
                });
                setRolesData(data?.data?.modules);
            } else {
                setRolesData(data?.data || data); // Handle both wrapped and unwrapped data
            }
        }
    }, [data, editData?.id]);

    // Check if all modules are selected
    useEffect(() => {
        if (rolesData.length > 0) {
            let allModuleSelectCheck = 0;
            rolesData.forEach((item) => {
                if (item.is_checked) {
                    allModuleSelectCheck++;
                }
            });
            if (allModuleSelectCheck === rolesData.length) {
                setAllSelect(true);
            } else {
                setAllSelect(false);
            }
        }
    }, [rolesData]);

    // Handle input field change
    const handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setInitialData({ ...initialData, [name]: value });
    };

    // Handle module-level checkbox change
    const handleModuleChange = ({
        id,
        moduleData,
        isAllSelect = undefined,
    }) => {
        let newModuleData = { ...moduleData };
        const checked = isAllSelect ?? !newModuleData.is_checked;

        const permissionsChecked = () => {
            return moduleData.permissions.map((items) => ({
                ...items,
                is_checked: checked,
            }));
        };

        newModuleData = {
            ...newModuleData,
            is_checked: checked,
            permissions: permissionsChecked(),
        };

        const findModuleIndex = rolesData.findIndex(
            (items) => items.module_id === id,
        );

        const updatedRolesData = [...rolesData];
        updatedRolesData[findModuleIndex] = newModuleData;

        if (newModuleData.is_checked) {
            const permissionsIds = newModuleData.permissions.map((items) => {
                return items.id;
            });

            // Combine existing and new permissions, ensuring uniqueness
            const newPermissions = Array.from(
                new Set([...initialData.permissions, ...permissionsIds]),
            );
            setInitialData((prev) => ({
                ...prev,
                permissions: newPermissions,
            }));
        } else {
            let deletePermissionsIds = [...initialData.permissions];

            newModuleData.permissions.forEach((items) => {
                deletePermissionsIds = deletePermissionsIds.filter(
                    (id) => id !== items.id,
                );
            });

            setInitialData((prev) => ({
                ...prev,
                permissions: deletePermissionsIds,
            }));
        }
        setRolesData(updatedRolesData);
    };

    // Handle individual permission checkbox change
    const handlePemissionsChange = ({
        permissionsId,
        moduleData,
        permissionsData,
    }) => {
        let newPrmissionsData = { ...permissionsData };
        const checked = !newPrmissionsData.is_checked;
        newPrmissionsData = { ...newPrmissionsData, is_checked: checked };

        const findPermissionsIndex = moduleData.permissions.findIndex(
            (items) => items.id === permissionsId,
        );

        const updatedModulePermissions = [...moduleData.permissions];
        updatedModulePermissions[findPermissionsIndex] = newPrmissionsData;

        const updatedModuleData = {
            ...moduleData,
            permissions: updatedModulePermissions,
        };

        const allCheckedPermissions = updatedModulePermissions.filter(
            (items) => items.is_checked,
        );
        updatedModuleData.is_checked =
            allCheckedPermissions.length === updatedModulePermissions.length;

        const findModuleIndex = rolesData.findIndex(
            (items) => items.module_id === moduleData.module_id,
        );

        const updatedRolesData = [...rolesData];
        updatedRolesData[findModuleIndex] = updatedModuleData;

        if (newPrmissionsData.is_checked) {
            setInitialData((prev) => ({
                ...prev,
                permissions: [...prev.permissions, permissionsId],
            }));
        } else {
            const deletePermissionsId = initialData.permissions.filter(
                (id) => id !== permissionsId,
            );
            setInitialData((prev) => ({
                ...prev,
                permissions: deletePermissionsId,
            }));
        }
        setRolesData(updatedRolesData);
    };

    // Handle "Select All" master checkbox change
    const handleAllSelect = () => {
        const checked = !allSelect;
        const permissionsId = [];

        const allSelectData = rolesData.map((item) => {
            const updatedPermissions = item.permissions.map((p) => {
                if (checked) permissionsId.push(p.id);
                return { ...p, is_checked: checked };
            });

            return {
                ...item,
                is_checked: checked,
                permissions: updatedPermissions,
            };
        });

        if (checked) {
            setInitialData((prev) => ({
                ...prev,
                permissions: permissionsId,
            }));
        } else {
            setInitialData((prev) => ({ ...prev, permissions: [] }));
        }
        setAllSelect(checked);
        setRolesData(allSelectData);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();
        const action = editData?.id ? put : post;
        const url = editData?.id ? `/roles/${editData?.id}` : '/roles';

        action(url, {
            data: initialData,
            onSuccess: (response) => {
                reset();
                handleSubmitted({
                    responseFlashMessage: response,
                    updateData: initialData,
                });
            },

            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(_, event) => {
                if (event.reason === 'outside-press') return;
                onClose();
            }}
        >
            <DialogContent className="custom-scrollbar max-h-[90vh] overflow-y-auto rounded-xl border-border shadow-lg sm:max-w-[1000px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                        {editData?.id ? t('Update Role') : t('Add Role')}
                        <hr className="mt-2.5 border-border" />
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        <div className="grid grid-cols-1 gap-4">
                            <InputField
                                label={t('Role Name')}
                                name="name"
                                isRequired={true}
                                placeholder={t('Enter role name')}
                                value={initialData?.name}
                                onChange={handleChange}
                                error={errors?.name}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-foreground">
                                    {t('Assign Permissions')}
                                </h3>
                                <div className="flex items-center space-x-2 rounded-lg bg-muted/50 px-3 py-1.5">
                                    <Checkbox
                                        id="all-select"
                                        checked={allSelect}
                                        onCheckedChange={handleAllSelect}
                                    />
                                    <label
                                        htmlFor="all-select"
                                        className="cursor-pointer text-sm font-medium"
                                    >
                                        {t('Select All')}
                                    </label>
                                </div>
                            </div>

                            {errors?.permissions && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors?.permissions}
                                </p>
                            )}

                            <div className="overflow-hidden rounded-xl border border-muted/60 shadow-sm">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow className="border-b border-primary/20 hover:bg-transparent">
                                            <TableHead className="w-[180px] py-4 pl-6 text-sm font-bold tracking-wider text-muted-foreground/80 uppercase">
                                                {t('Module')}
                                            </TableHead>
                                            <TableHead className="py-4 text-sm font-bold tracking-wider text-muted-foreground/80 uppercase">
                                                {t('Permissions')}
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rolesData.map((module) => (
                                            <TableRow
                                                key={module.module_id}
                                                className="border-muted/40 transition-colors hover:bg-muted/5"
                                            >
                                                <TableCell className="py-4 pl-6 align-top whitespace-normal">
                                                    <div className="mt-1 flex items-center space-x-3">
                                                        <Checkbox
                                                            id={`module-${module.module_id}`}
                                                            checked={
                                                                module.is_checked
                                                            }
                                                            onCheckedChange={() =>
                                                                handleModuleChange(
                                                                    {
                                                                        id: module.module_id,
                                                                        moduleData:
                                                                            module,
                                                                    },
                                                                )
                                                            }
                                                            className="h-5 w-5 rounded-md border-muted-foreground/30 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                                                        />
                                                        <label
                                                            htmlFor={`module-${module.module_id}`}
                                                            className="cursor-pointer text-sm font-semibold text-foreground/90 select-none"
                                                        >
                                                            {module.module_name}
                                                        </label>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 pr-6 whitespace-normal">
                                                    <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                                                        {module.permissions.map(
                                                            (permission) => (
                                                                <div
                                                                    key={
                                                                        permission.id
                                                                    }
                                                                    className="flex items-center space-x-2.5"
                                                                >
                                                                    <Checkbox
                                                                        id={`perm-${permission.id}`}
                                                                        checked={
                                                                            permission.is_checked
                                                                        }
                                                                        onCheckedChange={() =>
                                                                            handlePemissionsChange(
                                                                                {
                                                                                    permissionsId:
                                                                                        permission.id,
                                                                                    moduleData:
                                                                                        module,
                                                                                    permissionsData:
                                                                                        permission,
                                                                                },
                                                                            )
                                                                        }
                                                                        className="h-4.5 w-4.5 rounded border-muted-foreground/30 data-[state=checked]:border-primary data-[state=checked]:bg-primary/90"
                                                                    />
                                                                    <label
                                                                        htmlFor={`perm-${permission.id}`}
                                                                        className="cursor-pointer text-xs leading-relaxed font-medium text-muted-foreground/90 transition-colors select-none hover:text-foreground"
                                                                    >
                                                                        {
                                                                            permission.name
                                                                        }
                                                                    </label>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
                            <Button
                                variant="accent"
                                type="button"
                                onClick={onClose}
                            >
                                {t('Cancel')}
                            </Button>
                            <Button
                                variant="gradient"
                                type="submit"
                                disabled={processing}
                                className="min-w-[120px]"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t('Submitting...')}
                                    </>
                                ) : (
                                    t(editData?.id ? 'Update' : 'Submit')
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default RoleModal;
