import InputField from '@/components/custom-component/InputField';
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
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export default function Edit({ payment }) {
    const { t } = useLanguage();

    const [bankAccountSearch, setBankAccountSearch] = useState('');
    const [bankAccountChange, setBankAccountChange] = useState(
        payment.bank_account || null,
    );
    const [bankAccountOptions, setBankAccountOptions] = useState(
        payment.bank_account ? [payment.bank_account] : [],
    );

    // Each line item: { key, id (existing), purchase_id, batch_number, total_amount, total_due, pay_now }
    const [lineItems, setLineItems] = useState(
        (payment.line_items || []).map((item) => ({
            key: item.id,
            id: item.id,
            purchase_id: item.stock_purchase_id,
            batch_number: item.batch_number,
            total_amount: item.total_amount,
            total_due: item.total_due,
            total_paid: item.total_paid,
            pay_now: item.pay_now,
        })),
    );
    const [lineItemSearches, setLineItemSearches] = useState({});
    const [lineItemOptions, setLineItemOptions] = useState({});
    const [files, setFiles] = useState(
        payment?.attachment?.length > 0
            ? payment.attachment.map((url) => ({
                  id: url,
                  name: url.split('/').pop(),
                  preview: url,
                  status: 'success',
                  serverUrl: url,
                  size: 0, // We don't know the size
                  type: 'image/jpeg', // Assumption or generic
              }))
            : [],
    );

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

    const { data, setData, put, processing, errors, clearErrors } = useForm({
        amount: payment.amount,
        payment_date: payment.payment_date,
        bank_account_id: payment.bank_account_id,
        paid_to: payment.paid_to || '',
        notes: payment.notes || '',
        attachment: payment.attachment || [],
        line_items: [],
    });

    const lineItemsTotal = useMemo(
        () =>
            lineItems.reduce(
                (sum, item) => sum + (Number(item.pay_now) || 0),
                0,
            ),
        [lineItems],
    );

    useEffect(() => {
        const uploadedAttachments = files
            .filter((f) => f.status === 'success')
            .map((f) => f.serverUrl);

        const validLineItems = lineItems
            .filter((item) => item.purchase_id && Number(item.pay_now) > 0)
            .map((item) => ({
                ...(item.id ? { id: item.id } : {}),
                stock_purchase_id: item.purchase_id,
                pay_now: Number(item.pay_now),
            }));

        setData((prev) => ({
            ...prev,
            attachment:
                uploadedAttachments.length > 0
                    ? uploadedAttachments
                    : prev.attachment,
            line_items: validLineItems,
        }));
    }, [lineItems, files]);

    const handleAddLineItem = () => {
        const key = Date.now();
        setLineItems((prev) => [
            ...prev,
            {
                key,
                id: null,
                purchase_id: '',
                batch_number: '',
                total_amount: 0,
                total_due: 0,
                total_paid: 0,
                pay_now: 0,
            },
        ]);
        setLineItemSearches((prev) => ({ ...prev, [key]: '' }));
        setLineItemOptions((prev) => ({ ...prev, [key]: [] }));
    };

    const handleRemoveLineItem = (key) => {
        setLineItems((prev) => prev.filter((item) => item.key !== key));
        setLineItemSearches((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
        setLineItemOptions((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const handleLineItemPurchaseChange = (key, option) => {
        setLineItems((prev) =>
            prev.map((item) =>
                item.key === key
                    ? {
                          ...item,
                          purchase_id: option?.value || '',
                          batch_number: option?.label || '',
                          total_amount: Number(option?.total_amount) || 0,
                          total_due: Number(option?.total_due) || 0,
                          total_paid: Number(option?.total_paid) || 0,
                          pay_now: Number(option?.total_due) || 0,
                      }
                    : item,
            ),
        );
    };

    const handleLineItemPayNowChange = (key, value) => {
        setLineItems((prev) =>
            prev.map((item) =>
                item.key === key ? { ...item, pay_now: value } : item,
            ),
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!data.amount || Number(data.amount) <= 0) {
            toast.error(t('Amount must be greater than 0'));
            return;
        }

        if (lineItemsTotal > 0 && Number(data.amount) < lineItemsTotal) {
            toast.error(
                t('Amount cannot be less than the line items subtotal') +
                    ` (${lineItemsTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })})`,
            );
            return;
        }

        clearErrors();
        put(`/supplier-payments/${payment.id}`, {
            onSuccess: (response) => {
                if (response?.props?.flash?.success) {
                    toast.success(t(response?.props?.flash?.success));
                }
            },
            preserveScroll: true,
        });
    };

    return (
        <DashboardLayout>
            <Head title={t('Edit Supplier Payment')} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {t('Edit Supplier Payment')}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {payment.voucher_number}
                            {payment.supplier?.label && (
                                <span> &mdash; {payment.supplier.label}</span>
                            )}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.visit('/supplier-payments')}
                    >
                        {t('Back')}
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <InputField
                                label={t('Supplier')}
                                value={payment.supplier?.label || '—'}
                                disabled
                                className="bg-muted/50"
                            />
                            <InputField
                                label={t('Amount')}
                                isRequired={true}
                                type="number"
                                step="0.01"
                                value={data.amount}
                                onChange={(e) =>
                                    setData('amount', e.target.value)
                                }
                                placeholder="0.00"
                                error={errors?.amount}
                            />
                            <ServerSearchSelect
                                label={t('Account')}
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
                                placeholder={t('Select Account')}
                                error={errors?.bank_account_id}
                            />
                            <SmartDatePicker
                                label={t('Payment Date')}
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
                            <InputField
                                label={t('Paid To')}
                                value={data.paid_to}
                                onChange={(e) =>
                                    setData('paid_to', e.target.value)
                                }
                                placeholder={t('Enter name')}
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold">
                                {t('Stock Purchases')}
                            </h2>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddLineItem}
                            >
                                <Plus className="mr-1 h-4 w-4" />
                                {t('Add Item')}
                            </Button>
                        </div>

                        {lineItems.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                {t(
                                    'No line items. This is an advance payment.',
                                )}
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase">
                                            <th className="border-b border-border p-3">
                                                {t('Stock Purchase')}
                                            </th>
                                            <th className="border-b border-border p-3 text-right">
                                                {t('Total Amount')}
                                            </th>
                                            <th className="border-b border-border p-3 text-right">
                                                {t('Current Due')}
                                            </th>
                                            <th className="border-b border-border p-3">
                                                {t('Pay Now')}
                                            </th>
                                            <th className="border-b border-border p-3 text-center">
                                                {t('Action')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lineItems.map((item, index) => (
                                            <LineItemRow
                                                key={item.key}
                                                item={item}
                                                supplierId={payment.supplier_id}
                                                excludeIds={lineItems
                                                    .filter(
                                                        (i) =>
                                                            i.key !==
                                                                item.key &&
                                                            i.purchase_id,
                                                    )
                                                    .map((i) => i.purchase_id)}
                                                search={
                                                    lineItemSearches[
                                                        item.key
                                                    ] || ''
                                                }
                                                options={
                                                    lineItemOptions[item.key] ||
                                                    []
                                                }
                                                onSearchChange={(value) => {
                                                    debounceSelectInputChange(
                                                        value,
                                                        (v) =>
                                                            setLineItemSearches(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [item.key]:
                                                                        v,
                                                                }),
                                                            ),
                                                    );
                                                }}
                                                onOptionsLoad={(opts) =>
                                                    setLineItemOptions(
                                                        (prev) => ({
                                                            ...prev,
                                                            [item.key]: opts,
                                                        }),
                                                    )
                                                }
                                                onPurchaseChange={(option) =>
                                                    handleLineItemPurchaseChange(
                                                        item.key,
                                                        option,
                                                    )
                                                }
                                                onPayNowChange={(value) =>
                                                    handleLineItemPayNowChange(
                                                        item.key,
                                                        value,
                                                    )
                                                }
                                                onRemove={() =>
                                                    handleRemoveLineItem(
                                                        item.key,
                                                    )
                                                }
                                                error={
                                                    errors?.[
                                                        `line_items.${index}.stock_purchase_id`
                                                    ]
                                                }
                                                payNowError={
                                                    errors?.[
                                                        `line_items.${index}.pay_now`
                                                    ]
                                                }
                                                t={t}
                                            />
                                        ))}
                                        <tr className="bg-muted/20 font-bold">
                                            <td
                                                colSpan={3}
                                                className="p-3 text-right text-sm"
                                            >
                                                {t('Total')}
                                            </td>
                                            <td className="p-3 text-sm text-primary">
                                                {lineItemsTotal.toLocaleString(
                                                    undefined,
                                                    {
                                                        minimumFractionDigits: 2,
                                                    },
                                                )}
                                            </td>
                                            <td />
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <TextAreaField
                                label={t('Notes')}
                                value={data.notes}
                                onChange={(e) =>
                                    setData('notes', e.target.value)
                                }
                                placeholder={t('Enter notes')}
                                className="min-h-[100px]"
                            />
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {t('Payment Receipt')}
                                </label>
                                <FileUpload
                                    files={files}
                                    setFiles={setFiles}
                                    endpoint="/stocks/upload-attachment"
                                    allowMultiple={true}
                                />
                            </div>
                        </div>
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
                                    {t('Updating...')}
                                </>
                            ) : (
                                t('Update Payment')
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

function LineItemRow({
    item,
    supplierId,
    excludeIds = [],
    search,
    options,
    onSearchChange,
    onOptionsLoad,
    onPurchaseChange,
    onPayNowChange,
    onRemove,
    error,
    payNowError,
    t,
}) {
    const isExisting = Boolean(item.id);
    const [selectedPurchase, setSelectedPurchase] = useState(null);

    const excludeIdsQuery = excludeIds.length
        ? `&exclude_ids=${excludeIds.join(',')}`
        : '';

    const { data: purchasesData, loading: isLoading } = useAxiosFetch({
        url: `/search/supplier-purchases?supplier_id=${supplierId}&search=${search}${excludeIdsQuery}`,
        skip: isExisting,
    });

    useEffect(() => {
        if (purchasesData) {
            onOptionsLoad(purchasesData?.data || []);
        }
    }, [purchasesData]);

    const handleChange = (option) => {
        setSelectedPurchase(option);
        onPurchaseChange(option);
    };

    return (
        <tr className="transition-colors hover:bg-muted/30">
            <td className="border-b border-border p-3">
                <div className="min-w-[200px]">
                    {isExisting ? (
                        <span className="text-sm font-medium text-foreground">
                            {item.batch_number || '—'}
                        </span>
                    ) : (
                        <ServerSearchSelect
                            value={selectedPurchase}
                            onInputChange={onSearchChange}
                            isLoading={isLoading}
                            options={options}
                            onChange={handleChange}
                            placeholder={t('Select purchase')}
                            error={error}
                        />
                    )}
                </div>
            </td>
            <td className="border-b border-border p-3 text-right text-sm text-muted-foreground">
                {Number(item.total_amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                })}
            </td>
            <td className="border-b border-border p-3 text-right text-sm text-muted-foreground">
                {Number(item.total_due).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                })}
            </td>
            <td className="border-b border-border p-3">
                <div className="min-w-[130px]">
                    <Input
                        type="number"
                        step="0.01"
                        value={item.pay_now}
                        onChange={(e) => onPayNowChange(e.target.value)}
                        className="h-9 w-32 border-border focus:ring-1 focus:ring-primary"
                        placeholder="0.00"
                    />
                    {payNowError && (
                        <p className="mt-1 text-xs text-destructive">
                            {payNowError}
                        </p>
                    )}
                </div>
            </td>
            <td className="border-b border-border p-3 text-center">
                <button
                    type="button"
                    onClick={onRemove}
                    className="rounded-md p-2 text-destructive transition-colors hover:bg-destructive/10"
                >
                    <Trash2 size={16} />
                </button>
            </td>
        </tr>
    );
}
