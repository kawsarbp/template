import SaleActionButton from './SaleActionButton';

export const SaleMobileViewCard = ({
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
                <div className="font-medium">{data?.sale_number}</div>
                <div className="text-sm text-muted-foreground">
                    {data?.customer_name || 'Walk-in'} - {data?.sale_date}
                </div>
            </div>
            <div className="flex w-full justify-end">
                <SaleActionButton
                    rowItemData={data}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                />
            </div>
        </div>
    );
};
