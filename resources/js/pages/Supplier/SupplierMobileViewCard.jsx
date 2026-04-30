import SupplierActionButton from './SupplierActionButton';

export const SupplierMobileViewCard = ({
    data,
    onClick,
    handleEdit,
    handleDelete,
}) => {
    return (
        <div
            onClick={onClick}
            className="flex w-full cursor-pointer justify-between gap-3 border-b border-border bg-card px-2 py-4 transition-colors active:bg-muted/50"
        >
            <div className="w-full">{data?.name}</div>
            <div className="flex w-full justify-end">
                <SupplierActionButton
                    rowItemData={data}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                />
            </div>
        </div>
    );
};
