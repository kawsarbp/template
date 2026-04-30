import InputField from '@/components/custom-component/InputField';
import RadioGroupField from '@/components/custom-component/RadioGroupField';
import TextAreaField from '@/components/custom-component/TextAreaField';
import { FileUpload } from '@/components/FileUpload';
import { ServerSearchSelect } from '@/components/ui/advanced-select';
import { Button } from '@/components/ui/button';
import { SmartDatePicker } from '@/components/ui/date-picker/DatePicker';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import useAxiosFetch from '@/hooks/useAxiosFetch';
import useDebounce from '@/hooks/useDebounce';
import { useLanguage } from '@/hooks/useLanguage';
import { formatDateToYMD } from '@/lib/helper';
import { cashFlowType } from '@/lib/options';
import { debounceInterval, formSubmitErrorMessage } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const today = new Date();

const initialInputField = {
    name: '',
    date: formatDateToYMD(today),
    bank_account_id: '',
    type: 1,
    amount: '',
    description: '',
    attachment: [],
};

const CashFlowModal = ({ isOpen, onClose, handleSubmitted, editData = {} }) => {
    const { t } = useLanguage();
    const [bankAccountOptions, setBankAccountOptions] = useState([]);
    const [bankAccountSearch, setBankAccountSearch] = useState('');
    const [bankAccountChange, setBankAccountChange] = useState(null);

    const [files, setFiles] = useState([]);

    const { data: bankAccountsData, loading: isLoadingBankAccounts } =
        useAxiosFetch({
            url: `/search/bank-accounts?search=${bankAccountSearch}`,
        });

    const { loading: isLoading, data: cashFlowsData } = useAxiosFetch({
        url: `/cashflow-transactions/${editData?.id}`,
        skip: editData?.id ? false : true,
    });

    const debounceSelectInputChange = useDebounce((value, stateFunction) => {
        stateFunction(value);
    }, debounceInterval);

    useEffect(() => {
        if (bankAccountsData) {
            setBankAccountOptions(bankAccountsData?.data);
        }
    }, [bankAccountsData]);

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
        if (cashFlowsData) {
            setInitialData(cashFlowsData?.data);
            setBankAccountChange({
                value: cashFlowsData?.data?.bank_account_id,
                label: cashFlowsData?.data?.bank_account_name,
            });
            if (
                cashFlowsData?.data?.attachment &&
                Array.isArray(cashFlowsData?.data?.attachment)
            ) {
                const existingFiles = cashFlowsData.data.attachment.map(
                    (url) => ({
                        id: url,
                        name: url.split('/').pop(),
                        preview: url,
                        status: 'success',
                        serverUrl: url,
                        size: 0, // We don't know the size
                        type: 'image/jpeg', // Assumption or generic
                    }),
                );
                setFiles(existingFiles);
            }
        }
    }, [cashFlowsData]);

    // handle input field change
    const handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setInitialData({ ...initialData, [name]: value });
    };

    // handle select input change
    const handleSelectInputChange = (key, value) => {
        if (key === 'bank_account_id') {
            debounceSelectInputChange(value, setBankAccountSearch);
        }
    };

    // handle select change
    const handleSelectChange = (key, value) => {
        if (key === 'bank_account_id') {
            setBankAccountChange(value);
        }
        setInitialData((prev) => ({ ...prev, [key]: value?.value }));
    };

    // Sync files to initialData.attachment
    useEffect(() => {
        const uploadedUrls = files
            .filter((f) => f.status === 'success' && f.serverUrl)
            .map((f) => f.serverUrl);
        setInitialData((prev) => ({ ...prev, attachment: uploadedUrls }));
    }, [files]);

    // handle edit and create submit forms
    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();
        if (editData?.id) {
            put(`/cashflow-transactions/${editData?.id}`, {
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
            post('/cashflow-transactions', {
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
            <DialogContent className="custom-scrollbar max-h-[calc(100vh-5rem)] overflow-y-auto rounded-xl border-border shadow-lg sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                        {editData?.id
                            ? t('Update Cashflow Transaction')
                            : t('Create Cashflow Transaction')}
                        <hr className="mt-2.5 border-border" />
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* payment mode */}
                            <ServerSearchSelect
                                isRequired={true}
                                label={t('Payment Mode')}
                                value={bankAccountChange}
                                onInputChange={(value) =>
                                    handleSelectInputChange(
                                        'bank_account_id',
                                        value,
                                    )
                                }
                                isLoading={isLoadingBankAccounts}
                                options={bankAccountOptions}
                                onChange={(value) =>
                                    handleSelectChange('bank_account_id', value)
                                }
                                placeholder={t('Select Payment Mode')}
                                error={errors?.bank_account_id}
                            />

                            {/* name */}
                            <InputField
                                label={t('Name')}
                                name="name"
                                isRequired={true}
                                placeholder={t('Enter name')}
                                value={initialData?.name}
                                onChange={handleChange}
                                error={errors?.name}
                            />

                            {/* amount */}
                            <InputField
                                label={t('Amount')}
                                name="amount"
                                type="number"
                                isRequired={true}
                                placeholder={t('Enter amount')}
                                value={initialData?.amount}
                                onChange={handleChange}
                                error={errors?.amount}
                            />

                            {/* date */}
                            <SmartDatePicker
                                isRequired={true}
                                label={t('Date')}
                                name="date"
                                mode="single"
                                error={errors?.date}
                                value={initialData?.date || ''}
                                onChange={(value) =>
                                    handleChange({
                                        target: {
                                            name: 'date',
                                            value: formatDateToYMD(value),
                                        },
                                    })
                                }
                                includeTime={false}
                                placeholder="Select date"
                            />

                            {/* description */}
                            <TextAreaField
                                label={t('Description')}
                                name="description"
                                placeholder={t('Enter description')}
                                className="min-h-28"
                                value={initialData?.description}
                                onChange={handleChange}
                                error={errors?.description}
                            />

                            {/* type */}
                            <RadioGroupField
                                label={t('Type')}
                                name="type"
                                options={cashFlowType}
                                value={initialData?.type}
                                onChange={handleChange}
                                error={errors?.type}
                            />
                        </div>
                        <div>
                            <FileUpload
                                files={files}
                                setFiles={setFiles}
                                accept="image/*"
                                endpoint="/cashflow-transactions/upload-attachment"
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

export default CashFlowModal;
