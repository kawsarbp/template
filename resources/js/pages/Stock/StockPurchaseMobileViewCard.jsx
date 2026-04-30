import StockPurchaseActionButton from './StockPurchaseActionButton';

export const StockPurchaseMobileViewCard = ({
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
            <div className="w-full">
                <div className="font-medium">{data?.batch_number}</div>
                <div className="text-sm text-muted-foreground">
                    {data?.supplier_name || 'No Supplier'} -{' '}
                    {data?.purchase_date}
                </div>
            </div>
            <div className="flex w-full justify-end">
                <StockPurchaseActionButton
                    rowItemData={data}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                />
            </div>
        </div>
    );
};
