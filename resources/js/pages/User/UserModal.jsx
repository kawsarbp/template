import InputField from '@/components/custom-component/InputField';
import RadioGroupField from '@/components/custom-component/RadioGroupField';
import { ServerSearchSelect } from '@/components/ui/advanced-select';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import useAxiosFetch from '@/hooks/useAxiosFetch';
import useDebounce from '@/hooks/useDebounce';
import { useLanguage } from '@/hooks/useLanguage';
import { statusOptions } from '@/lib/options';
import { debounceInterval, formSubmitErrorMessage } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const initialInputField = {
    name: '',
    role_id: '',
    email: '',
    password: '',
    status: 1,
};

const UserModal = ({ isOpen, onClose, handleSubmitted, editData = {} }) => {
    const [roleOptions, setRoleOptions] = useState([]);
    const [roleSearch, setRoleSearch] = useState('');
    const [roleChange, setRoleChange] = useState(null);

    const { t } = useLanguage();
    const { loading: isLoading, data: usersData } = useAxiosFetch({
        url: `/users/${editData?.id}`,
        skip: editData?.id ? false : true,
    });

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

    const {
        data: initialData,
        setData: setInitialData,
        put,
        post,
        processing,
        errors,
        clearErrors,
    } = useForm(initialInputField);

    // error message shoe
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            toast.error(formSubmitErrorMessage);
        }
    }, [JSON.stringify(errors)]);

    // set update data fetching
    useEffect(() => {
        if (usersData) {
            setInitialData(usersData?.data);
            setRoleChange({
                value: usersData?.data?.role,
                label: usersData?.data?.role_name,
            });
        }
    }, [usersData]);

    // handle input field change
    const handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setInitialData({ ...initialData, [name]: value });
    };

    // handle select input change
    const handleSelectInputChange = (key, value) => {
        if (key === 'role_id') {
            debounceSelectInputChange(value, setRoleSearch);
        }
    };

    // handle select change
    const handleSelectChange = (key, value) => {
        if (key === 'role_id') {
            setRoleChange(value);
        }
        setInitialData((prev) => ({ ...prev, [key]: value?.value }));
    };

    // handle edit and create submit forms
    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();
        if (editData?.id) {
            put(`/users/${editData?.id}`, {
                data: initialData,
                onSuccess: (response) => {
                    handleSubmitted({
                        responseFlashMessage: response,
                        updateData: initialData,
                    });
                },

                preserveScroll: true,
                preserveState: true,
            });
        } else {
            post('/users', {
                data: initialData,
                onSuccess: (response) => {
                    handleSubmitted({ responseFlashMessage: response });
                },

                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(_, event) => {
                if (event.reason === 'outside-press') return;
                onClose();
            }}
        >
            <DialogContent className="custom-scrollbar max-h-[calc(100vh-5rem)] overflow-y-auto rounded-xl border-border shadow-lg sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                        {editData?.id ? t('Update User') : t('Create User')}
                        <hr className="mt-2.5 border-border" />
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        {/* Basic Info */}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <InputField
                                label={t('Name')}
                                name="name"
                                isRequired={true}
                                placeholder={t('Enter name')}
                                value={initialData?.name}
                                onChange={handleChange}
                                error={errors?.name}
                            />

                            <InputField
                                label={t('Email')}
                                isRequired={true}
                                name="email"
                                type="email"
                                placeholder={t('Enter email')}
                                value={initialData?.email}
                                onChange={handleChange}
                                error={errors?.email}
                            />

                            <ServerSearchSelect
                                isRequired={true}
                                label={t('Role')}
                                value={roleChange}
                                onInputChange={(value) =>
                                    handleSelectInputChange('role_id', value)
                                }
                                isLoading={isLoadingRoles}
                                options={roleOptions}
                                onChange={(value) =>
                                    handleSelectChange('role_id', value)
                                }
                                placeholder={t('Select Role')}
                                error={errors?.role_id}
                            />

                            <InputField
                                label={t('Password')}
                                isRequired={true}
                                name="password"
                                type="password"
                                placeholder={t('Enter password')}
                                value={initialData?.password}
                                onChange={handleChange}
                                error={errors?.password}
                            />

                            <RadioGroupField
                                label={t('Status')}
                                name="status"
                                options={statusOptions}
                                value={initialData?.status}
                                onChange={handleChange}
                                error={errors?.status}
                            />
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
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
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t('Submitting...')}
                                    </>
                                ) : (
                                    t('Submit')
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default UserModal;
