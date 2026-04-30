import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { Link, usePage } from '@inertiajs/react';

export default function CustomerAdvanceActionButton({
    rowItemData,
    handleEdit,
    handleDelete,
}) {
    const { t } = useLanguage();
    const { permissions } = usePage().props;
    return (
        <div className="flex flex-wrap items-center gap-3">
            {permissions['view advance account'] && (
                <Link href={`/advanced-accounts-list/${rowItemData?.id}`}>
                    <Button variant="soft">{t('Transaction')}</Button>
                </Link>
            )}
        </div>
    );
}
