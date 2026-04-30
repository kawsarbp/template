import DetailRow from '@/components/custom-component/DetailRow';
import Status from '@/components/custom-component/Status';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { usePortal } from '@/hooks/usePortal';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, History, Pencil } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import CustomerModal from './CustomerModal';

const breadcrumbs = [
    { label: 'Customers', href: '/customers' },
    { label: 'Customer Detail' },
];

export default function CustomerDetail(props) {
    const { t } = useLanguage();
    const permissions = props?.permissions;
    const customerData = props?.data?.data;
    const [isOpen, setIsOpen] = useState(false);
    const [editData, setEditData] = useState({});
    const portal = usePortal('customer-modal');

    // response flash message
    const handleSubmitted = ({ responseFlashMessage }) => {
        if (responseFlashMessage?.props?.flash?.success) {
            toast.success(responseFlashMessage?.props?.flash?.success);
            setIsOpen(false);
        } else if (responseFlashMessage?.props?.flash?.error) {
            toast.error(responseFlashMessage?.props?.flash?.error);
        }
    };

    return (
        <DashboardLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Customer Detail')} />

            <div className="space-y-6 pb-10">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/customers">
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
                                {customerData?.name}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {t('Customer ID')}: {customerData?.customer_id}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {permissions['manage customer'] &&
                            customerData?.history_url && (
                                <a
                                    href={customerData?.history_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button
                                        variant="info"
                                        className="text-white"
                                    >
                                        <History className="h-4 w-4" />
                                        {t('History')}
                                    </Button>
                                </a>
                            )}
                        {permissions['update customer'] && (
                            <Button
                                onClick={() => {
                                    setIsOpen(true);
                                    setEditData({ id: customerData?.id });
                                }}
                                variant="gradient"
                            >
                                <Pencil className="h-4 w-4" />
                                {t('Update')}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* left side */}
                    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                        <div className="p-2">
                            <DetailRow
                                label={t('Name')}
                                value={customerData?.name || t('N/A')}
                            />
                            <DetailRow
                                label={t('Company')}
                                value={customerData?.company_name || t('N/A')}
                            />
                            <DetailRow
                                label={t('Customer ID')}
                                value={customerData?.customer_id || t('N/A')}
                            />

                            <DetailRow
                                label={t('Email')}
                                value={customerData?.email || t('N/A')}
                            />
                            <DetailRow
                                label={t('Phone')}
                                value={customerData?.phone || t('N/A')}
                            />
                            <DetailRow label={t('Status')}>
                                <Status status={customerData?.status_name} />
                            </DetailRow>
                        </div>
                    </div>

                    {/* right side */}
                    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                        <div className="p-2">
                            <DetailRow
                                label={t('Country')}
                                value={customerData?.country || t('N/A')}
                            />
                            <DetailRow
                                label={t('State')}
                                value={customerData?.state || t('N/A')}
                            />
                            <DetailRow
                                label={t('City')}
                                value={customerData?.city || t('N/A')}
                            />
                            <DetailRow
                                label={t('Address')}
                                value={customerData?.address || t('N/A')}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {isOpen &&
                portal(
                    <CustomerModal
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        handleSubmitted={handleSubmitted}
                        editData={editData}
                    />,
                )}
        </DashboardLayout>
    );
}
