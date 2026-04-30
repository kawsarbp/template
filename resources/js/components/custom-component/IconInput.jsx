import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export const IconInput = ({ icon: Icon = Search, ...props }) => (
    <div className="relative">
        <Icon className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
            {...props}
            className={`h-10 border-border bg-background pl-9 focus-visible:ring-1 ${props.className}`}
        />
    </div>
);
