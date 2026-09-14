import { Search } from 'lucide-react';
import { InputHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export function SearchInput({
    className,
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
                type="search"
                className={cn(
                    'h-10 w-full rounded border border-border bg-surface pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    className,
                )}
                {...props}
            />
        </div>
    );
}
