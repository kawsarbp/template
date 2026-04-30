import DetailRow from '@/components/custom-component/DetailRow';
import GalleryViewer from '@/components/custom-component/GalleryViewer';
import Status from '@/components/custom-component/Status';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { usePortal } from '@/hooks/usePortal';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, History, Pencil } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ProductModal from './ProductModal';

const breadcrumbs = [
    { label: 'Products', href: '/products' },
    { label: 'Product Detail' },
];

export default function ProductDetail(props) {
    const { t } = useLanguage();
    const permissions = props?.permissions;
    const productData = props?.data?.data;
    const [isOpen, setIsOpen] = useState(false);
    const [editData, setEditData] = useState({});
    const portal = usePortal('product-modal');

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
            <Head title={t('Product Detail')} />

            <div className="space-y-6 pb-10">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/products">
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
                                {productData?.title}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {t('SKU')}: {productData?.sku}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {permissions['manage product'] &&
                            productData?.history_url && (
                                <a
                                    href={productData?.history_url}
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
                        {permissions['update product'] && (
                            <Button
                                onClick={() => {
                                    setIsOpen(true);
                                    setEditData({ id: productData?.id });
                                }}
                                variant="gradient"
                            >
                                <Pencil className="h-4 w-4" />
                                {t('Update')}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* General Information */}
                    <div className="flex flex-col gap-6">
                        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                            <div className="border-b border-border bg-muted/30 px-4 py-3">
                                <h3 className="font-semibold text-foreground">
                                    {t('General Information')}
                                </h3>
                            </div>
                            <div className="p-2">
                                <DetailRow
                                    label={t('Title')}
                                    value={productData?.title || t('N/A')}
                                />
                                <DetailRow
                                    label={t('SKU')}
                                    value={productData?.sku || t('N/A')}
                                />
                                <DetailRow
                                    label={t('Brand')}
                                    value={productData?.brand || t('N/A')}
                                />
                                <DetailRow
                                    label={t('Model')}
                                    value={productData?.model || t('N/A')}
                                />
                                <DetailRow
                                    label={t('Color')}
                                    value={productData?.color || t('N/A')}
                                />
                                <DetailRow
                                    label={t('Storage Capacity')}
                                    value={
                                        productData?.storage_capacity ||
                                        t('N/A')
                                    }
                                />
                                <DetailRow
                                    label={t('RAM')}
                                    value={productData?.ram || t('N/A')}
                                />
                                <DetailRow
                                    label={t('Condition')}
                                    value={
                                        productData?.condition_name || t('N/A')
                                    }
                                />
                                <DetailRow
                                    label={t('Operating System')}
                                    value={
                                        productData?.operating_system ||
                                        t('N/A')
                                    }
                                />
                                <DetailRow label={t('Active')}>
                                    <Status
                                        status={productData?.is_active_name}
                                    />
                                </DetailRow>
                                <DetailRow label={t('Stock Status')}>
                                    <div className="flex items-center gap-1.5">
                                        <Status
                                            status={productData?.stock_status}
                                        />
                                        {productData?.available_stock_count >
                                            0 && (
                                            <Link
                                                href={`/stocks?product_id=${productData?.id}&status=1`}
                                                className="text-primary underline"
                                            >
                                                <span className="text-xs font-medium">
                                                    (
                                                    {
                                                        productData.available_stock_count
                                                    }{' '}
                                                    available)
                                                </span>
                                            </Link>
                                        )}
                                    </div>
                                </DetailRow>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* Photos Section */}
                        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                            <div className="border-b border-border bg-muted/30 px-4 py-3">
                                <h3 className="font-semibold text-foreground">
                                    {t('Photos')}
                                </h3>
                            </div>
                            <div className="p-4">
                                <GalleryViewer images={productData?.photos} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Details */}
                {productData?.description && (
                    <div className="grid grid-cols-1 gap-6">
                        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                            <div className="border-b border-border bg-muted/30 px-4 py-3">
                                <h3 className="font-semibold text-foreground">
                                    {t('Additional Details')}
                                </h3>
                            </div>
                            <div className="space-y-4 p-4">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
                                        {t('Description')}
                                    </h4>
                                    <p className="leading-relaxed whitespace-pre-wrap text-foreground">
                                        {productData.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isOpen &&
                portal(
                    <ProductModal
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        handleSubmitted={handleSubmitted}
                        editData={editData}
                    />,
                )}
        </DashboardLayout>
    );
}
