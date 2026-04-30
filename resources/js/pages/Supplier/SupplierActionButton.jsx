import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';

export default function SupplierActionButton({
    rowItemData,
    handleEdit,
    handleDelete,
}) {
    const { permissions } = usePage().props;
    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* view button */}
            {permissions['view supplier'] && (
                <Link href={`/suppliers/${rowItemData.id}`}>
                    <Button variant="view" size="icon-sm">
                        <Eye className="h-2 w-2" />
                    </Button>
                </Link>
            )}
            {/* Edit Button */}
            {permissions['update supplier'] && (
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
            {permissions['delete supplier'] && (
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
