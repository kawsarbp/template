import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';

export default function AuditLogActionButton({ rowItemData }) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* view button */}
            {
                <Link href={rowItemData?.history_url}>
                    <Button variant="view" size="icon-sm">
                        <Eye className="h-2 w-2" />
                    </Button>
                </Link>
            }
        </div>
    );
}
