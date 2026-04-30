import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';

export default function SaleActionButton({
    rowItemData,
    handleEdit,
    handleDelete,
}) {
    const { permissions } = usePage().props;
    return (
        <div className="flex flex-wrap items-center gap-3">
            {permissions['view sale'] && (
                <Link href={`/sales/${rowItemData.id}`}>
                    <Button variant="view" size="icon-sm">
                        <Eye className="h-2 w-2" />
                    </Button>
                </Link>
            )}
            {permissions['update sale'] && (
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
            {permissions['delete sale'] && (
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
        </div>
    );
}
