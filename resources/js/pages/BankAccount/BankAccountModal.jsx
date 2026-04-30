import InputField from '@/components/custom-component/InputField';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import useAxiosFetch from '@/hooks/useAxiosFetch';
import { useLanguage } from '@/hooks/useLanguage';
import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const initialInputField = {
    holder_name: '',
    name: '',
    account_number: '',
    opening_balance: '',
};

const BankAccountModal = ({
    isOpen,
    onClose,
    handleSubmitted,
    editData = {},
}) => {
    const { t } = useLanguage();
    const { loading: isLoading, data: bankAccountsData } = useAxiosFetch({
        url: `/bank-accounts/${editData?.id}`,
        skip: editData?.id ? false : true,
    });
    const {
        data: initialData,
        setData: setInitialData,
        put,
        post,
        processing,
        errors,
    } = useForm(initialInputField);

    // set update data fetching
    useEffect(() => {
        if (bankAccountsData) {
            setInitialData(bankAccountsData?.data);
        }
    }, [bankAccountsData]);

    // handle input field change
    const handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setInitialData({ ...initialData, [name]: value });
    };

    // handle edit and create submit forms
    const handleSubmit = (e) => {
        e.preventDefault();
        if (editData?.id) {
            put(`/bank-accounts/${editData?.id}`, {
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
            post('/bank-accounts', {
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
            <DialogContent className="custom-scrollbar max-h-[calc(100vh-20rem)] overflow-y-auto rounded-xl border-border shadow-lg sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                        {editData?.id
                            ? t('Update Bank Account')
                            : t('Add Bank Account')}
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
                            <InputField
                                label={t('Bank Holder Name')}
                                name="holder_name"
                                isRequired={true}
                                placeholder={t('Enter bank holder name')}
                                value={initialData?.holder_name}
                                onChange={handleChange}
                                error={errors?.holder_name}
                            />

                            <InputField
                                label={t('Name')}
                                name="name"
                                placeholder={t('Enter bank name')}
                                value={initialData?.name}
                                onChange={handleChange}
                                error={errors?.name}
                            />

                            <InputField
                                label={t('Account Number')}
                                name="account_number"
                                placeholder={t('Enter bank account number')}
                                value={initialData?.account_number}
                                onChange={handleChange}
                                error={errors?.account_number}
                            />

                            <InputField
                                type="number"
                                label={t('Opening Balance')}
                                name="opening_balance"
                                placeholder={t('Enter opening balance')}
                                value={initialData?.opening_balance}
                                onChange={handleChange}
                                error={errors?.opening_balance}
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

export default BankAccountModal;
