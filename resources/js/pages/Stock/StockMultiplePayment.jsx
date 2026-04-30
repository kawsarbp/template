import InputField from '@/components/custom-component/InputField';
import Status from '@/components/custom-component/Status';
import TextAreaField from '@/components/custom-component/TextAreaField';
import { FileUpload } from '@/components/FileUpload';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { ServerSearchSelect } from '@/components/ui/advanced-select';
import { Button } from '@/components/ui/button';
import { SmartDatePicker } from '@/components/ui/date-picker/DatePicker';
import { Input } from '@/components/ui/input';
import useAxiosFetch from '@/hooks/useAxiosFetch';
import useDebounce from '@/hooks/useDebounce';
import { useLanguage } from '@/hooks/useLanguage';
import { formatDateToYMD } from '@/lib/helper';
import { debounceInterval } from '@/lib/utils';
import { Head, router, useForm } from '@inertiajs/react';
import { Loader2, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const today = new Date();

export default function StockMultiplePayment(props) {
    const { t } = useLanguage();
    const purchases = props?.data?.data || [];
    const supplier = props?.supplier?.data || {};

    // State to manage payment amounts for each row
    const [rowPayments, setRowPayments] = useState(
        purchases.reduce((acc, curr) => {
            acc[curr.id] = {
                amount: Number(curr.total_due) || 0,
                selected: true,
                total_paid: Number(curr.total_paid) || 0,
                total_due: Number(curr.total_due) || 0,
                total_amount: Number(curr.total_amount) || 0,
                discount: Number(curr.discount) || 0,
            };
            return acc;
        }, {}),
    );

    const [bankAccountOptions, setBankAccountOptions] = useState([]);
    const [bankAccountSearch, setBankAccountSearch] = useState('');
    const [bankAccountChange, setBankAccountChange] = useState(null);
    const [files, setFiles] = useState([]);

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

    const totalPaymentAmount = useMemo(() => {
        return Object.values(rowPayments).reduce(
            (sum, row) => sum + (Number(row.amount) || 0),
            0,
        );
    }, [rowPayments]);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        amount: 0,
        payment_date: formatDateToYMD(today),
        bank_account_id: '',
        notes: '',
        paid_to: '',
        paid_amount: {},
        stock_purchase_ids: [],
        attachment: [],
    });

    useEffect(() => {
        const selectedIds = Object.keys(rowPayments).filter(
            (id) => Number(rowPayments[id].amount) > 0,
        );

        const paidAmounts = selectedIds.reduce((acc, id) => {
            acc[id] = rowPayments[id].amount;
            return acc;
        }, {});

        const uploadedAttachments = files
            .filter((f) => f.status === 'success')
            .map((f) => f.serverUrl);

        setData((prev) => ({
            ...prev,
            amount: totalPaymentAmount,
            stock_purchase_ids: selectedIds,
            paid_amount: paidAmounts,
            attachment: uploadedAttachments,
        }));
    }, [totalPaymentAmount, rowPayments, files]);

    const handleCheckboxChange = (id) => {
        setRowPayments((prev) => {
            const isSelected = !prev[id].selected;
            return {
                ...prev,
                [id]: {
                    ...prev[id],
                    selected: isSelected,
                    amount: isSelected ? prev[id].total_due : 0,
                },
            };
        });
    };

    const handleAmountChange = (id, value) => {
        const numValue = value === '' || value === null ? 0 : Number(value);
        setRowPayments((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                amount: value,
                selected: numValue === prev[id].total_due && numValue !== 0,
            },
        }));
    };

    const handleRemoveRow = (id) => {
        setRowPayments((prev) => {
            const newState = { ...prev };
            delete newState[id];
            return newState;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (totalPaymentAmount <= 0) {
            toast.error(t('Total payment amount must be greater than 0'));
            return;
        }

        clearErrors();
        post('/stock-purchases/bulk-payment', {
            onSuccess: (response) => {
                if (response?.props?.flash?.success) {
                    toast.success(t(response?.props?.flash?.success));
                    if (response?.props?.flash?.redirect_url) {
                        window.open(
                            response?.props?.flash?.redirect_url,
                            '_blank',
                        );
                    }
                    router.visit('/stock-purchases');
                } else {
                    toast.error(t(response?.props?.flash?.error));
                }
            },
            preserveScroll: true,
        });
    };

    const tableTotals = useMemo(() => {
        const visibleIds = Object.keys(rowPayments);
        return visibleIds.reduce(
            (acc, id) => {
                acc.total_amount += rowPayments[id].total_amount;
                acc.total_due += rowPayments[id].total_due;
                acc.total_paid += rowPayments[id].total_paid;
                acc.payment_amount += Number(rowPayments[id].amount || 0);
                return acc;
            },
            { total_amount: 0, total_due: 0, total_paid: 0, payment_amount: 0 },
        );
    }, [rowPayments]);

    return (
        <DashboardLayout>
            <Head title="Multiple Payment" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">
                        {t('Multiple Payment')}
                    </h1>
                </div>

                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase">
                                    <th className="w-10 border-b border-border p-4">
                                        {t('#')}
                                    </th>
                                    <th className="border-b border-border p-4">
                                        {t('GLOT #')}
                                    </th>
                                    <th className="border-b border-border p-4">
                                        {t('Name')}
                                    </th>
                                    <th className="border-b border-border p-4">
                                        {t('Purchase Date')}
                                    </th>
                                    <th className="border-b border-border p-4">
                                        {t('Total Units')}
                                    </th>
                                    <th className="border-b border-border p-4">
                                        {t('Total Amount')}
                                    </th>
                                    <th className="border-b border-border p-4">
                                        {t('Total Paid')}
                                    </th>

                                    <th className="border-b border-border p-4">
                                        {t('Total Due')}
                                    </th>
                                    <th className="border-b border-border p-4">
                                        {t('Payment Amount')}
                                    </th>
                                    <th className="border-b border-border p-4">
                                        {t('Status')}
                                    </th>
                                    <th className="border-b border-border p-4 text-center">
                                        {t('Action')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchases
                                    .filter((p) => rowPayments[p.id])
                                    .map((purchase) => (
                                        <tr
                                            key={purchase.id}
                                            className="transition-colors hover:bg-muted/30"
                                        >
                                            <td className="border-b border-border p-4">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                                    checked={
                                                        rowPayments[purchase.id]
                                                            ?.selected
                                                    }
                                                    onChange={() =>
                                                        handleCheckboxChange(
                                                            purchase.id,
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="border-b border-border p-4 text-sm font-medium">
                                                {purchase.batch_number}
                                            </td>
                                            <td className="border-b border-border p-4 text-sm text-muted-foreground">
                                                {purchase.supplier_name ||
                                                    'N/A'}
                                            </td>
                                            <td className="border-b border-border p-4 text-sm text-muted-foreground">
                                                {purchase.purchase_date ||
                                                    'N/A'}
                                            </td>
                                            <td className="border-b border-border p-4 text-sm text-muted-foreground">
                                                {purchase.total_units}
                                            </td>
                                            <td className="border-b border-border p-4 text-sm font-medium">
                                                {Number(
                                                    purchase.total_amount,
                                                ).toLocaleString()}
                                            </td>
                                            <td className="border-b border-border p-4 text-sm font-medium">
                                                {Number(
                                                    purchase.total_paid,
                                                ).toLocaleString()}
                                            </td>
                                            <td className="border-b border-border p-4 text-sm text-muted-foreground">
                                                {purchase.total_due}
                                            </td>
                                            <td className="border-b border-border p-4">
                                                <Input
                                                    type="number"
                                                    disabled={
                                                        rowPayments[purchase.id]
                                                            ?.selected
                                                    }
                                                    value={
                                                        rowPayments[purchase.id]
                                                            ?.amount || ''
                                                    }
                                                    onChange={(e) =>
                                                        handleAmountChange(
                                                            purchase.id,
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-9 w-32 border-border focus:ring-1 focus:ring-primary"
                                                    placeholder="0"
                                                />
                                                {errors[
                                                    `paid_amount.${purchase.id}`
                                                ] && (
                                                    <p className="text-xs text-destructive">
                                                        {
                                                            errors[
                                                                `paid_amount.${purchase.id}`
                                                            ]
                                                        }
                                                    </p>
                                                )}
                                            </td>
                                            <td className="border-b border-border p-4">
                                                <Status
                                                    status={
                                                        purchase.payment_status_name
                                                    }
                                                />
                                            </td>
                                            <td className="border-b border-border p-4 text-center">
                                                <button
                                                    onClick={() =>
                                                        handleRemoveRow(
                                                            purchase.id,
                                                        )
                                                    }
                                                    className="rounded-md p-2 text-destructive transition-colors hover:bg-destructive/10"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                <tr className="bg-muted/20 font-bold">
                                    <td
                                        colSpan={4}
                                        className="p-4 text-right text-sm"
                                    >
                                        {t('Total Due Balance')}
                                    </td>
                                    <td></td>
                                    <td className="p-4 text-sm">
                                        {tableTotals.total_amount.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-sm">
                                        {tableTotals?.total_paid.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-sm">
                                        {tableTotals?.total_due.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-sm text-primary">
                                        {tableTotals.payment_amount.toLocaleString()}
                                    </td>
                                    <td colSpan={2} className="p-4"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-1">
                        <h2 className="mb-4 text-lg font-bold">
                            {t('Supplier Details')}
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <span className="text-xs font-semibold text-muted-foreground uppercase">
                                    {t('Name')} :
                                </span>
                                <p className="text-sm font-medium">
                                    {supplier?.name || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-muted-foreground uppercase">
                                    {t('Email')} :
                                </span>
                                <p className="text-sm font-medium">
                                    {supplier.email || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-muted-foreground uppercase">
                                    {t('Phone')} :
                                </span>
                                <p className="text-sm font-medium">
                                    {supplier.phone || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6 lg:col-span-2"
                    >
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <SmartDatePicker
                                label={t('Date')}
                                isRequired={true}
                                value={data.payment_date}
                                onChange={(val) =>
                                    setData(
                                        'payment_date',
                                        formatDateToYMD(val),
                                    )
                                }
                                error={errors?.payment_date}
                            />
                            <ServerSearchSelect
                                label={t('Account Name')}
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
                                    setData(
                                        'bank_account_id',
                                        value?.value || '',
                                    );
                                }}
                                placeholder={t('Select Bank Account')}
                                error={errors?.bank_account_id}
                            />
                            <InputField
                                label={t('Amount')}
                                disabled
                                value={data.amount?.toFixed(2)}
                                error={errors?.amount}
                                className="bg-muted/50 font-bold text-primary"
                            />
                            <InputField
                                label={t('Paid To')}
                                value={data.paid_to}
                                onChange={(e) =>
                                    setData('paid_to', e.target.value)
                                }
                                placeholder={t('Paid To')}
                            />
                        </div>

                        <TextAreaField
                            label={t('Description')}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder={t('Description')}
                            className="min-h-[100px]"
                        />

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('Upload Files')}
                            </label>
                            <FileUpload
                                files={files}
                                setFiles={setFiles}
                                endpoint="/stocks/upload-attachment"
                                allowMultiple={true}
                                onFilesSelected={(updatedFiles) => {
                                    // Handle file upload success if needed
                                }}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button
                                variant="gradient"
                                type="submit"
                                disabled={processing}
                                className="px-8 py-6 text-lg font-bold"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        {t('Submitting...')}
                                    </>
                                ) : (
                                    t('Submit')
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
