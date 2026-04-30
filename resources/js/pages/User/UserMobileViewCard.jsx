import UserActionButton from './UserActionButton';

export const UserMobileViewCard = ({
    data,
    onClick,
    handleEdit,
    handleDelete,
    handlePermission,
}) => {
    return (
        <div
            onClick={onClick}
            className="flex w-full cursor-pointer justify-between gap-3 border-b border-border bg-card px-2 py-4 transition-colors active:bg-muted/50"
        >
            <td className="w-full">{data?.name}</td>
            <td className="flex w-full justify-end">
                <UserActionButton
                    rowItemData={data}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    handlePermission={handlePermission}
                />
            </td>
        </div>
    );
};
