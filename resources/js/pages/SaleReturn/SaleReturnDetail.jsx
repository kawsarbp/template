import DetailRow from '@/components/custom-component/DetailRow';
import Status from '@/components/custom-component/Status';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/hooks/useConfirm';
import { useLanguage } from '@/hooks/useLanguage';
import { ensureLeadingSlash } from '@/lib/helper';
import { usePortal } from '@/hooks/usePortal';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, FileText, History, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import SaleReturnPaymentModal from './SaleReturnPaymentModal';

const breadcrumbs = [
    { label: 'Sale Returns', href: '/sale-returns' },
    { label: 'Return Detail' },
];

export default function SaleReturnDetail(props) {
    const { t } = useLanguage();
    const { permissions } = usePage().props;
    const returnData = props?.data?.data;
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const paymentPortal = usePortal('sale-return-payment-modal');
    const [ConfirmationBox, confirm] = useConfirm();

    const handleSubmitted = ({ responseFlashMessage }) => {
        if (responseFlashMessage?.props?.flash?.success) {
            if (responseFlashMessage?.props?.flash?.redirect_url) {
                const redirectUrl = ensureLeadingSlash(
                    responseFlashMessage?.props?.flash?.redirect_url,
                );
                window.open(redirectUrl, '_blank');
            }
            toast.success(responseFlashMessage?.props?.flash?.success);
            setIsPaymentModalOpen(false);
        } else if (responseFlashMessage?.props?.flash?.error) {
            toast.error(responseFlashMessage?.props?.flash?.error);
        }
    };

    const handleDeletePayment = async (payment) => {
        const ok = await confirm({
            title: t('Delete this payment?'),
            description: `The refund payment of <span class="bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-bold">"${Number(payment.amount).toLocaleString()}"</span> will be permanently removed.`,
            variant: 'destructive',
            confirmText: t('Yes, Delete It'),
        });

        if (ok) {
            router.delete(`/sale-return-payments/${payment.id}`, {
                onSuccess: (response) => {
                    handleSubmitted({ responseFlashMessage: response });
                },
                preserveScroll: true,
            });
        }
    };

    return (
        <DashboardLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Sale Return Detail')} />

            <div className="space-y-6 pb-10">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/sale-returns">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {returnData?.return_number}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {t('Return Date')}:{' '}
                                {returnData?.return_date_formatted}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {returnData?.history_url && (
                            <a
                                href={returnData?.history_url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button variant="info" className="text-white">
                                    <History className="h-4 w-4" />
                                    {t('History')}
                                </Button>
                            </a>
                        )}
                        {permissions['update sale return'] && (
                            <Link href={`/sale-returns/${returnData?.id}/edit`}>
                                <Button variant="outline">
                                    <Pencil className="h-4 w-4" />
                                    {t('Edit')}
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Return Info */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                        <div className="p-2">
                            <DetailRow
                                label={t('Return #')}
                                value={returnData?.return_number || t('N/A')}
                            />
                            <DetailRow
                                label={t('Customer')}
                                value={
                                    returnData?.customer_name || t('Walk-in')
                                }
                            />
                            <DetailRow
                                label={t('Return Date')}
                                value={
                                    returnData?.return_date_formatted || t('N/A')
                                }
                            />
                        </div>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                        <div className="p-2">
                            <DetailRow
                                label={t('Total Units')}
                                value={returnData?.total_units}
                            />
                            <DetailRow
                                label={t('Total Amount')}
                                value={Number(
                                    returnData?.total_amount,
                                ).toLocaleString()}
                            />
                            {parseFloat(returnData?.discount) > 0 && (
                                <DetailRow
                                    label={t('Discount')}
                                    value={Number(
                                        returnData?.discount,
                                    ).toLocaleString()}
                                />
                            )}
                            <DetailRow
                                label={t('Total Refunded')}
                                value={Number(
                                    returnData?.total_refunded,
                                ).toLocaleString()}
                            />
                            <DetailRow
                                label={t('Total Due')}
                                value={Number(
                                    returnData?.total_due,
                                ).toLocaleString()}
                            />
                            <DetailRow label={t('Payment Status')}>
                                <Status
                                    status={returnData?.payment_status_name}
                                />
                            </DetailRow>
                        </div>
                    </div>
                </div>

                {returnData?.notes && (
                    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                        <div className="p-4">
                            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                                {t('Notes')}
                            </h3>
                            <p className="text-foreground">
                                {returnData?.notes}
                            </p>
                        </div>
                    </div>
                )}

                {/* Payments Section */}
                <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                    <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3">
                        <h3 className="text-lg font-semibold text-foreground">
                            {t('Refund Payments')}
                        </h3>
                        {returnData?.total_due > 0 && permissions['create sale return'] && (
                            <Button
                                onClick={() => setIsPaymentModalOpen(true)}
                                variant="success"
                                size="sm"
                                className="text-white"
                            >
                                <Plus className="h-4 w-4" />
                                {t('Add Refund')}
                            </Button>
                        )}
                    </div>
                    {returnData?.payments && returnData.payments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/30">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            {t('Date')}
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            {t('Amount')}
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            {t('Bank Account')}
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            {t('Receipt')}
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            {t('Notes')}
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            {t('Action')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {returnData.payments.map((payment) => (
                                        <tr
                                            key={payment.id}
                                            className="border-b border-border"
                                        >
                                            <td className="px-4 py-2 text-foreground">
                                                {payment.payment_date}
                                            </td>
                                            <td className="px-4 py-2 text-foreground">
                                                {Number(
                                                    payment.amount,
                                                ).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-2 text-foreground">
                                                {payment.bank_account_name ||
                                                    'N/A'}
                                            </td>
                                            <td className="px-4 py-2 text-foreground">
                                                {payment.receipt_url ? (
                                                    <a
                                                        href={
                                                            payment.receipt_url
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            <FileText className="h-4 w-4" />
                                                            {t('View')}
                                                        </Button>
                                                    </a>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-foreground">
                                                {payment.notes || '-'}
                                            </td>
                                            <td className="px-4 py-2">
                                                {permissions['delete sale return'] && (
                                                    <Button
                                                        variant="delete"
                                                        size="icon-sm"
                                                        onClick={() =>
                                                            handleDeletePayment(
                                                                payment,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            {t('No refund payments recorded yet.')}
                        </div>
                    )}
                </div>

                {/* Return Items Table */}
                {returnData?.items &&
                    returnData.items.length > 0 &&
                    (() => {
                        const lineGroups = {};
                        returnData.items.forEach((item) => {
                            const key = item.line_number;
                            if (!lineGroups[key]) {
                                lineGroups[key] = {
                                    source_type: item.source_type || 'stock',
                                    batch_number: item.batch_number,
                                    items: [],
                                };
                            }
                            lineGroups[key].items.push(item);
                        });
                        const groupedLines = Object.keys(lineGroups)
                            .sort((a, b) => Number(a) - Number(b))
                            .map((key) => lineGroups[key]);

                        return (
                            <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                                <div className="border-b border-border bg-muted/50 px-4 py-3">
                                    <h3 className="text-lg font-semibold text-foreground">
                                        {t('Returned Items')}
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                                                    #
                                                </th>
                                                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                                                    {t('Item')}
                                                </th>
                                                <th className="px-3 py-2.5 text-center font-medium text-muted-foreground">
                                                    {t('Qty')}
                                                </th>
                                                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                                                    {t('Unit Price')}
                                                </th>
                                                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                                                    {t('Total')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groupedLines.map((group, index) =>
                                                group.source_type === 'stock' ? (
                                                    <tr
                                                        key={`stock-${group.items[0].id}`}
                                                        className="border-t border-border"
                                                    >
                                                        <td className="px-3 py-2 text-muted-foreground">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <div className="font-medium">
                                                                {group.items[0]
                                                                    .imei ||
                                                                    'N/A'}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {
                                                                    group
                                                                        .items[0]
                                                                        .product_brand
                                                                }{' '}
                                                                {
                                                                    group
                                                                        .items[0]
                                                                        .product_model
                                                                }
                                                                {group.items[0]
                                                                    .condition_name && (
                                                                    <>
                                                                        {' '}
                                                                        &middot;{' '}
                                                                        {
                                                                            group
                                                                                .items[0]
                                                                                .condition_name
                                                                        }
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2 text-center">
                                                            <span className="inline-flex h-8 w-12 items-center justify-center rounded border border-border bg-muted/30 text-sm text-muted-foreground">
                                                                1
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            {Number(
                                                                group.items[0]
                                                                    .return_price,
                                                            ).toLocaleString()}
                                                        </td>
                                                        <td className="px-3 py-2 text-right font-medium">
                                                            {Number(
                                                                group.items[0]
                                                                    .return_price,
                                                            ).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    <tr
                                                        key={`glot-${group.items[0].line_number}`}
                                                        className="border-t border-border bg-blue-50/50 dark:bg-blue-950/20"
                                                    >
                                                        <td className="px-3 py-2 text-muted-foreground">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                                                    GLOT
                                                                </span>
                                                                <span className="font-medium">
                                                                    {
                                                                        group.batch_number
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="mt-1 max-h-16 overflow-y-auto text-xs text-muted-foreground">
                                                                {group.items
                                                                    .map(
                                                                        (s) =>
                                                                            s.imei ||
                                                                            'N/A',
                                                                    )
                                                                    .join(', ')}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2 text-center">
                                                            <span className="inline-flex h-8 w-12 items-center justify-center rounded border border-border bg-muted/30 text-sm text-muted-foreground">
                                                                {
                                                                    group.items
                                                                        .length
                                                                }
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            {Number(
                                                                group.items[0]
                                                                    .return_price,
                                                            ).toLocaleString()}
                                                        </td>
                                                        <td className="px-3 py-2 text-right font-medium">
                                                            {(
                                                                Number(
                                                                    group
                                                                        .items[0]
                                                                        .return_price,
                                                                ) *
                                                                group.items
                                                                    .length
                                                            ).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })()}
            </div>

            {isPaymentModalOpen &&
                paymentPortal(
                    <SaleReturnPaymentModal
                        isOpen={isPaymentModalOpen}
                        onClose={() => setIsPaymentModalOpen(false)}
                        saleReturnId={returnData?.id}
                        totalDue={returnData?.total_due}
                        onSuccess={handleSubmitted}
                    />,
                )}
            <ConfirmationBox />
        </DashboardLayout>
    );
}
