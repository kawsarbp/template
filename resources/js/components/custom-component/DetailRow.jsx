const DetailRow = ({ label, value, children, isIcon }) => (
    <div className="flex items-center justify-between border-b border-border p-2.5 last:border-0 hover:bg-muted/50">
        <span className="text-xs font-medium text-muted-foreground">
            {label}
        </span>
        <div className="text-right text-xs font-bold text-foreground uppercase">
            {children ? (
                children
            ) : isIcon ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-destructive/40 font-bold text-destructive">
                    ✕
                </span>
            ) : (
                value
            )}
        </div>
    </div>
);

export default DetailRow;
