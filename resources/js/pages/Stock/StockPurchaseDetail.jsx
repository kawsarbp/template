import DetailRow from '@/components/custom-component/DetailRow';
import Status from '@/components/custom-component/Status';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/hooks/useConfirm';
import { useLanguage } from '@/hooks/useLanguage';
import { usePortal } from '@/hooks/usePortal';
import { ensureLeadingSlash } from '@/lib/helper';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    File,
    FileText,
    History,
    Pencil,
    Plus,
    Trash2,
    SquarePen,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import StockPurchaseModal from './StockPurchaseModal';
import StockPurchasePaymentModal from './StockPurchasePaymentModal';

const fmtAmt = (n, currency) =>
    `${Number(n).toLocaleString()} ${currency}`;

const breadcrumbs = [
    { label: 'Stock Purchases', href: '/stock-purchases' },
    { label: 'Purchase Detail' },
];

export default function StockPurchaseDetail(props) {
    const { t } = useLanguage();
    const permissions = props?.permissions;
    const purchaseData = props?.data?.data;
    const currency = purchaseData?.currency ?? 'AED';
    const [isOpen, setIsOpen] = useState(false);
    const [editData, setEditData] = useState({});
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [editPayment, setEditPayment] = useState(null);
    const portal = usePortal('stock-purchase-modal');
    const paymentPortal = usePortal('stock-purchase-payment-modal');
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
            setIsOpen(false);
            setIsPaymentModalOpen(false);
        } else if (responseFlashMessage?.props?.flash?.error) {
            toast.error(responseFlashMessage?.props?.flash?.error);
        }
    };

    const handleDeletePayment = async (payment) => {
        const ok = await confirm({
            title: 'Delete this payment?',
            description: `The payment of <span class="bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-bold">"${Number(payment.amount).toLocaleString()}"</span> will be permanently removed.`,
            variant: 'destructive',
            confirmText: 'Yes, Delete It',
        });

        if (ok) {
            router.delete(`/stock-purchase-payments/${payment.id}`, {
                onSuccess: (response) => {
                    handleSubmitted({ responseFlashMessage: response });
                },
                preserveScroll: true,
            });
        }
    };

    return (
        <DashboardLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Stock Purchase Detail')} />

            <div className="space-y-6 pb-10">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/stock-purchases">
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
                                {purchaseData?.batch_number}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {t('Purchase Date')}:{' '}
                                {purchaseData?.purchase_date_formatted}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {purchaseData?.history_url && (
                            <a
                                href={purchaseData?.history_url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button variant="info" className="text-white">
                                    <History className="h-4 w-4" />
                                    {t('History')}
                                </Button>
                            </a>
                        )}
                        {purchaseData?.pdf_url && (
                            <a
                                href={purchaseData?.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button
                                    variant="success"
                                    className="text-white"
                                >
                                    <File className="h-4 w-4" />
                                    {t('PDF')}
                                </Button>
                            </a>
                        )}
                        <Button
                            onClick={() => {
                                setIsOpen(true);
                                setEditData({ id: purchaseData?.id });
                            }}
                            variant="gradient"
                        >
                            <Pencil className="h-4 w-4" />
                            {t('Update')}
                        </Button>
                    </div>
                </div>

                {/* Purchase Info */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                        <div className="p-2">
                            <DetailRow
                                label={t('GLOT #')}
                                value={purchaseData?.batch_number || t('N/A')}
                            />
                            <DetailRow
                                label={t('Supplier')}
                                value={purchaseData?.supplier_name || t('N/A')}
                            />
                            <DetailRow
                                label={t('Purchase Date')}
                                value={
                                    purchaseData?.purchase_date_formatted ||
                                    t('N/A')
                                }
                            />
                        </div>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                        <div className="p-2">
                            <DetailRow
                                label={t('Total Units')}
                                value={purchaseData?.total_units}
                            />
                            <DetailRow
                                label={t('Total Amount')}
                                value={fmtAmt(purchaseData?.total_amount, currency)}
                            />
                            {parseFloat(purchaseData?.discount) > 0 && (
                                <DetailRow
                                    label={t('Discount')}
                                    value={fmtAmt(purchaseData?.discount, currency)}
                                />
                            )}
                            <DetailRow
                                label={t('Total Paid')}
                                value={fmtAmt(purchaseData?.total_paid, currency)}
                            />
                            <DetailRow
                                label={t('Total Due')}
                                value={fmtAmt(purchaseData?.total_due, currency)}
                            />
                            <DetailRow label={t('Payment Status')}>
                                <Status
                                    status={purchaseData?.payment_status_name}
                                />
                            </DetailRow>
                        </div>
                    </div>
                </div>

                {purchaseData?.notes && (
                    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                        <div className="p-4">
                            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                                {t('Notes')}
                            </h3>
                            <p className="text-foreground">
                                {purchaseData?.notes}
                            </p>
                        </div>
                    </div>
                )}

                {/* Payments Section */}
                <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                    <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3">
                        <h3 className="text-lg font-semibold text-foreground">
                            {t('Payments')}
                        </h3>
                        {purchaseData?.total_due > 0 && (
                            <Button
                                onClick={() => {
                                    setEditPayment(null);
                                    setIsPaymentModalOpen(true);
                                }}
                                variant="success"
                                size="sm"
                                className="text-white"
                            >
                                <Plus className="h-4 w-4" />
                                {t('Add Payment')}
                            </Button>
                        )}
                    </div>
                    {purchaseData?.payments &&
                    purchaseData.payments.length > 0 ? (
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
                                    {purchaseData.payments.map((payment) => (
                                        <tr
                                            key={payment.id}
                                            className="border-b border-border"
                                        >
                                            <td className="px-4 py-2 text-foreground">
                                                {payment.payment_date}
                                            </td>
                                            <td className="px-4 py-2 text-foreground">
                                                {fmtAmt(payment.amount, currency)}
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
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="icon-sm"
                                                        onClick={() => {
                                                            setEditPayment(payment);
                                                            setIsPaymentModalOpen(true);
                                                        }}
                                                    >
                                                        <SquarePen className="h-4 w-4" />
                                                    </Button>
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
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            {t('No payments recorded yet.')}
                        </div>
                    )}
                </div>

                {/* Items Table */}
                {purchaseData?.items && purchaseData.items.length > 0 && (
                    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                        <div className="border-b border-border bg-muted/50 px-4 py-3">
                            <h3 className="text-lg font-semibold text-foreground">
                                {t('Purchase Items')}
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/30">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            {t('Product')}
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            {t('Qty')}
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            {t('Unit Price')}
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            {t('Condition')}
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            {t('Subtotal')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {purchaseData.items.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-border"
                                        >
                                            <td className="px-4 py-2 text-foreground">
                                                {item.product_brand}{' '}
                                                {item.product_model} -{' '}
                                                {item.product_title}
                                            </td>
                                            <td className="px-4 py-2 text-foreground">
                                                {item.quantity}
                                            </td>
                                            <td className="px-4 py-2 text-foreground">
                                                {fmtAmt(item.unit_price, currency)}
                                            </td>
                                            <td className="px-4 py-2 text-foreground">
                                                {item.condition_name}
                                            </td>
                                            <td className="px-4 py-2 text-foreground">
                                                {fmtAmt(item.quantity * item.unit_price, currency)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Stocks Table */}
                {purchaseData?.stocks && purchaseData.stocks.length > 0 && (
                    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                        <div className="border-b border-border bg-muted/50 px-4 py-3">
                            <h3 className="text-lg font-semibold text-foreground">
                                {t('Individual Stock Units')}
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/30">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            {t('IMEI')}
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            {t('Product')}
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            {t('Condition')}
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            {t('Purchase Price')}
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            {t('Sale Price')}
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            {t('Status')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {purchaseData.stocks.map((stock) => (
                                        <tr
                                            key={stock.id}
                                            className="border-b border-border"
                                        >
                                            <td className="px-4 py-2 text-foreground">
                                                {stock.imei || 'N/A'}
                                            </td>
                                            <td className="px-4 py-2 text-foreground">
                                                {stock.product_brand}{' '}
                                                {stock.product_model}
                                            </td>
                                            <td className="px-4 py-2 text-foreground">
                                                {stock.condition}
                                            </td>
                                            <td className="px-4 py-2 text-foreground">
                                                {fmtAmt(stock.purchase_price, currency)}
                                            </td>
                                            <td className="px-4 py-2 text-foreground">
                                                {stock.sale_price
                                                    ? fmtAmt(stock.sale_price, 'AED')
                                                    : 'N/A'}
                                            </td>
                                            <td className="px-4 py-2">
                                                <Status
                                                    status={stock.status_name}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            {isOpen &&
                portal(
                    <StockPurchaseModal
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        handleSubmitted={handleSubmitted}
                        editData={editData}
                    />,
                )}
            {isPaymentModalOpen &&
                paymentPortal(
                    <StockPurchasePaymentModal
                        isOpen={isPaymentModalOpen}
                        onClose={() => {
                            setIsPaymentModalOpen(false);
                            setEditPayment(null);
                        }}
                        purchaseId={purchaseData?.id}
                        totalDue={purchaseData?.total_due}
                        onSuccess={handleSubmitted}
                        editPayment={editPayment}
                    />,
                )}
            <ConfirmationBox />
        </DashboardLayout>
    );
}
