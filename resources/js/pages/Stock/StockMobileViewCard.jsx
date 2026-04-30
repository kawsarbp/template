import Status from '@/components/custom-component/Status';

export const StockMobileViewCard = ({ data }) => {
    return (
        <div className="flex w-full cursor-pointer justify-between gap-3 border-b border-border bg-card px-2 py-4 transition-colors active:bg-muted/50">
            <div className="w-full">
                <div className="font-medium">
                    {data?.product_brand} {data?.product_model}
                </div>
                <div className="text-sm text-muted-foreground">
                    {data?.imei || 'No IMEI'} - {data?.condition}
                </div>
                <div className="text-sm text-muted-foreground">
                    Price: {Number(data?.purchase_price).toLocaleString()}
                    {data?.sale_price &&
                        ` / Sale: ${Number(data?.sale_price).toLocaleString()}`}
                </div>
            </div>
            <div className="flex items-center">
                <Status status={data?.status_name} />
            </div>
        </div>
    );
};
