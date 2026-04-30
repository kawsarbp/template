import InputField from '@/components/custom-component/InputField';
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
import { debounceInterval, formSubmitErrorMessage } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const today = new Date();

const initialInputField = {
    date: formatDateToYMD(today),
    bank_account_id: '',
    amount: '',
    note: '',
    attachment: [],
};

const CustomerAdvanceModal = ({
    isOpen,
    onClose,
    handleSubmitted,
    editData = {},
    advanceType,
}) => {
    const { t } = useLanguage();
    // bank account state
    const [bankAccountOptions, setBankAccountOptions] = useState([]);
    const [bankAccountSearch, setBankAccountSearch] = useState('');
    const [bankAccountChange, setBankAccountChange] = useState(null);

    // customer state
    const [customerOptions, setCustomerOptions] = useState([]);
    const [customerSearch, setCustomerSearch] = useState('');
    const [customerChange, setCustomerChange] = useState(null);

    const [files, setFiles] = useState([]);

    const { data: bankAccountsData, loading: isLoadingBankAccounts } =
        useAxiosFetch({
            url: `/search/bank-accounts?search=${bankAccountSearch}`,
        });

    const { data: customersData, loading: isLoadingCustomers } = useAxiosFetch({
        url: `/search/customers?search=${customerSearch}`,
    });

    const { loading: isLoading, data: customerAdvanceData } = useAxiosFetch({
        url: `/advanced-accounts/${editData?.id}`,
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

    useEffect(() => {
        if (customersData) {
            setCustomerOptions(customersData?.data);
        }
    }, [customersData]);

    const {
        data: initialData,
        setData: setInitialData,
        put,
        post,
        processing,
        errors,
        clearErrors,
    } = useForm({
        ...initialInputField,
        type: advanceType === 'withdraw' ? 2 : 1,
    });

    // error message shoe
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            toast.error(formSubmitErrorMessage);
        }
    }, [JSON.stringify(errors)]);

    // set update data fetching
    useEffect(() => {
        if (customerAdvanceData) {
            setInitialData(customerAdvanceData?.data);
            setBankAccountChange({
                value: customerAdvanceData?.data?.bank_account_id,
                label: customerAdvanceData?.data?.bank_account_name,
            });
            setCustomerChange({
                value: customerAdvanceData?.data?.customer_id,
                label: customerAdvanceData?.data?.customer_name,
            });
            if (
                customerAdvanceData?.data?.attachment &&
                Array.isArray(customerAdvanceData?.data?.attachment)
            ) {
                const existingFiles = customerAdvanceData.data.attachment.map(
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
    }, [customerAdvanceData]);

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
        if (key === 'customer_id') {
            debounceSelectInputChange(value, setCustomerSearch);
        }
    };

    // handle select change
    const handleSelectChange = (key, value) => {
        if (key === 'bank_account_id') {
            setBankAccountChange(value);
        }
        if (key === 'customer_id') {
            setCustomerChange(value);
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
            put(`/advanced-accounts/${editData?.id}`, {
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
            post('/advanced-accounts', {
                data: initialData,
                onSuccess: (response) => {
                    handleSubmitted({ responseFlashMessage: response });
                },

                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    let title = null;
    if (editData?.id) {
        if (advanceType === 'deposit') {
            title = 'Update Customer Advance';
        } else {
            title = 'Update Customer Withdraw';
        }
    } else {
        if (advanceType === 'deposit') {
            title = 'Add Customer Advance';
        } else {
            title = 'Add Customer Withdraw';
        }
    }

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
                        {title}
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
                            {/* customer */}
                            <ServerSearchSelect
                                isRequired={true}
                                label={t('Customer')}
                                value={customerChange}
                                onInputChange={(value) =>
                                    handleSelectInputChange(
                                        'customer_id',
                                        value,
                                    )
                                }
                                onChange={(value) =>
                                    handleSelectChange('customer_id', value)
                                }
                                options={customerOptions}
                                isLoading={isLoadingCustomers}
                                placeholder={t('Select Customer')}
                                error={errors.customer_id}
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

                            {/* description */}
                            <TextAreaField
                                label={t('Note')}
                                name="note"
                                placeholder={t('Enter Note')}
                                className="min-h-28"
                                value={initialData?.note}
                                onChange={handleChange}
                                error={errors?.note}
                            />
                        </div>
                        <div>
                            <FileUpload
                                files={files}
                                setFiles={setFiles}
                                accept="image/*"
                                endpoint="/advanced-accounts/upload-attachment"
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

export default CustomerAdvanceModal;
