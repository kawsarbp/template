import ProductActionButton from './ProductActionButton';

export const ProductMobileViewCard = ({
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
            <div className="w-full">{data?.title}</div>
            <div className="flex w-full justify-end">
                <ProductActionButton
                    rowItemData={data}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                />
            </div>
        </div>
    );
};
