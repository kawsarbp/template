import { Button } from '@/components/ui/button';
import { usePage } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';

export default function UserActionButton({
    rowItemData,
    handleEdit,
    handleDelete,
    handlePermission,
}) {
    const { permissions } = usePage().props;
    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Edit Button */}
            {permissions['update user'] && (
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
            {permissions['delete user'] && (
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

            {/* Permission Button */}
            {permissions['update user'] && (
                <Button
                    variant="soft"
                    onClick={(e) => {
                        e.stopPropagation();
                        handlePermission(rowItemData);
                    }}
                >
                    Permission
                </Button>
            )}
        </div>
    );
}
