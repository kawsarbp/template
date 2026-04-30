import InputField from '@/components/custom-component/InputField';
import TextAreaField from '@/components/custom-component/TextAreaField';
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
import { formatDateToYMD, parseLocalDate } from '@/lib/helper';
import { debounceInterval, formSubmitErrorMessage } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const SaleReturnPaymentModal = ({
    isOpen,
    onClose,
    saleReturnId,
    totalDue,
    onSuccess,
}) => {
    const { t } = useLanguage();

    const [bankAccountOptions, setBankAccountOptions] = useState([]);
    const [bankAccountSearch, setBankAccountSearch] = useState('');
    const [bankAccountChange, setBankAccountChange] = useState(null);

    const { data: bankAccountsData, loading: isLoadingBankAccounts } =
        useAxiosFetch({
            url: `/search/bank-accounts?search=${bankAccountSearch}`,
        });

    const debounceSelectInputChange = useDebounce((value, stateFunction) => {
        stateFunction(value);
    }, debounceInterval);

    useEffect(() => {
        if (bankAccountsData) {
            setBankAccountOptions(bankAccountsData?.data);
        }
    }, [bankAccountsData]);

    const { data, setData, post, processing, errors, clearErrors, reset } =
        useForm({
            amount: totalDue || '',
            payment_date: formatDateToYMD(new Date()),
            bank_account_id: '',
            notes: '',
        });

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            toast.error(formSubmitErrorMessage);
        }
    }, [JSON.stringify(errors)]);

    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();

        post(`/sale-returns/${saleReturnId}/payments`, {
            onSuccess: (response) => {
                reset();
                onSuccess?.({ responseFlashMessage: response });
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
            <DialogContent className="rounded-xl border-border shadow-lg sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                        {t('Add Refund Payment')}
                        {totalDue !== undefined && (
                            <span className="ml-2 text-base font-normal text-muted-foreground">
                                ({t('Due')}: {Number(totalDue).toLocaleString()})
                            </span>
                        )}
                        <hr className="mt-2.5 border-border" />
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <InputField
                        label={t('Amount')}
                        type="number"
                        isRequired={true}
                        value={data.amount}
                        onChange={(e) => setData('amount', e.target.value)}
                        error={errors?.amount}
                        step="0.01"
                    />

                    <SmartDatePicker
                        label={t('Payment Date')}
                        isRequired={true}
                        value={parseLocalDate(data.payment_date)}
                        onChange={(val) => setData('payment_date', val ? formatDateToYMD(val) : '')}
                        error={errors?.payment_date}
                    />

                    <ServerSearchSelect
                        label={t('Bank Account')}
                        isRequired={true}
                        value={bankAccountChange}
                        onInputChange={(value) =>
                            debounceSelectInputChange(
                                value,
                                setBankAccountSearch,
                            )
                        }
                        isLoading={isLoadingBankAccounts}
                        options={bankAccountOptions}
                        onChange={(value) => {
                            setBankAccountChange(value);
                            setData('bank_account_id', value?.value || '');
                        }}
                        placeholder={t('Select Bank Account')}
                        error={errors?.bank_account_id}
                    />

                    <TextAreaField
                        label={t('Notes')}
                        className="min-h-16"
                        name="notes"
                        placeholder={t('Enter notes')}
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        error={errors?.notes}
                    />

                    <div className="flex items-center justify-end gap-3 pt-4">
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
            </DialogContent>
        </Dialog>
    );
};

export default SaleReturnPaymentModal;
