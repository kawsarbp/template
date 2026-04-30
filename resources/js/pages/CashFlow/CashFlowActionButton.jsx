import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { usePage } from '@inertiajs/react';
import { CircleArrowOutUpRight, Pencil, Trash2 } from 'lucide-react';

export default function CashFlowActionButton({
    rowItemData,
    handleEdit,
    handleDelete,
}) {
    const { t } = useLanguage();
    const { permissions } = usePage().props;
    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Edit Button */}
            {permissions['update cashflow'] && (
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(rowItemData);
                    }}
                    variant="edit"
                    size="icon-sm"
                >
                    <Pencil className="h-2 w-2" />
                </Button>
            )}

            {/* Delete Button */}
            {permissions['delete cashflow'] && (
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (handleDelete) {
                            handleDelete(rowItemData);
                        }
                    }}
                    variant="delete"
                    size="icon-sm"
                    className="p-0"
                >
                    <Trash2 className="h-2 w-2" />
                </Button>
            )}

            {permissions['update cashflow'] && rowItemData?.receipt_pdf && (
                <a
                    onClick={(e) => e.stopPropagation()}
                    href={rowItemData?.receipt_pdf}
                    target="_blank"
                >
                    <Button variant="soft">
                        {t('Receipt')}
                        <CircleArrowOutUpRight className="h-2 w-2" />
                    </Button>
                </a>
            )}
        </div>
    );
}
