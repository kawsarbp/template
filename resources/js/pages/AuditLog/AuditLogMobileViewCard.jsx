import AuditLogActionButton from './AuditLogActionButton';

export const AuditLogMobileViewCard = ({ data, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="flex w-full cursor-pointer justify-between gap-3 border-b border-border bg-card px-2 py-4 transition-colors active:bg-muted/50"
        >
            <td className="w-full">{data?.user_name}</td>
            <td className="flex w-full justify-end">
                <AuditLogActionButton rowItemData={data} />
            </td>
        </div>
    );
};
