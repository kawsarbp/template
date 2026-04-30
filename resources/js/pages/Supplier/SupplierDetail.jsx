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
import SupplierModal from './SupplierModal';

const breadcrumbs = [
    { label: 'Suppliers', href: '/suppliers' },
    { label: 'Supplier Detail' },
];

export default function SupplierDetail(props) {
    const { t } = useLanguage();
    const permissions = props?.permissions;
    const supplierData = props?.data?.data;
    const [isOpen, setIsOpen] = useState(false);
    const [editData, setEditData] = useState({});
    const portal = usePortal('supplier-modal');

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
            <Head title={t('Supplier Detail')} />

            <div className="space-y-6 pb-10">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/suppliers">
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
                                {supplierData?.name}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {t('Supplier ID')}: {supplierData?.supplier_id}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {permissions['manage supplier'] &&
                            supplierData?.history_url && (
                                <a
                                    href={supplierData?.history_url}
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
                        {permissions['update supplier'] && (
                            <Button
                                onClick={() => {
                                    setIsOpen(true);
                                    setEditData({ id: supplierData?.id });
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
                                value={supplierData?.name || t('N/A')}
                            />
                            <DetailRow
                                label={t('Company')}
                                value={supplierData?.company_name || t('N/A')}
                            />
                            <DetailRow
                                label={t('Supplier ID')}
                                value={supplierData?.supplier_id || t('N/A')}
                            />

                            <DetailRow
                                label={t('Email')}
                                value={supplierData?.email || t('N/A')}
                            />
                        </div>
                    </div>

                    {/* right side */}
                    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                        <div className="p-2">
                            <DetailRow
                                label={t('Phone')}
                                value={supplierData?.phone || t('N/A')}
                            />
                            <DetailRow
                                label={t('Address')}
                                value={supplierData?.address || t('N/A')}
                            />
                            <DetailRow
                                label={t('Balance')}
                                value={supplierData?.balance || t('N/A')}
                            />
                            <DetailRow label={t('Status')}>
                                <Status status={supplierData?.status_name} />
                            </DetailRow>
                        </div>
                    </div>
                </div>
            </div>
            {isOpen &&
                portal(
                    <SupplierModal
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        handleSubmitted={handleSubmitted}
                        editData={editData}
                    />,
                )}
        </DashboardLayout>
    );
}
