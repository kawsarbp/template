import { Badge } from '@/components/ui/badge';

export default function Status(props) {
    const { status } = props;
    let statusStyle = 'bg-muted text-muted-foreground border-border';
    if (
        status?.toLowerCase() === 'auction unpaid' ||
        status?.toLowerCase() === 'unpaid'
    ) {
        statusStyle =
            'bg-destructive/10 text-destructive border-destructive/20';
    } else if (status?.toLowerCase() === 'paid') {
        statusStyle = 'bg-primary/10 text-primary border-primary/20';
    } else if (
        status?.toLowerCase() === 'active' ||
        status?.toLowerCase() === 'cash in' ||
        status?.toLowerCase() === 'yes' ||
        status?.toLowerCase() === 'in stock' ||
        status?.toLowerCase() === 'deposit'
    ) {
        statusStyle = 'bg-primary/10 text-primary border-primary/20';
    } else if (
        status?.toLowerCase() === 'inactive' ||
        status?.toLowerCase() === 'cash out' ||
        status?.toLowerCase() === 'no' ||
        status?.toLowerCase() === 'rejected' ||
        status?.toLowerCase() === 'refurbishing' ||
        status?.toLowerCase() === 'withdraw' ||
        status?.toLowerCase() === 'out of stock'
    ) {
        statusStyle =
            'bg-destructive/10 text-destructive border-destructive/20';
    } else if (
        status?.toLowerCase() === 'approved' ||
        status?.toLowerCase() === 'sold'
    ) {
        statusStyle = 'bg-success/10 text-success border-success/20';
    } else if (
        status?.toLowerCase() === 'pending' ||
        status?.toLowerCase() === 'pending inspection' ||
        status?.toLowerCase() === 'partial'
    ) {
        statusStyle = 'bg-warning/10 text-warning border-warning/20';
    }
    return status ? (
        <Badge
            variant="outline"
            className={`h-auto rounded-sm border px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap uppercase ${statusStyle}`}
        >
            {status}
        </Badge>
    ) : null;
}
