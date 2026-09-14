import { Link } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
    return (
        <nav aria-label="Breadcrumb" className="flex items-center text-sm text-slate-500">
            <Link href={route('dashboard')} className="flex items-center hover:text-foreground" aria-label="Dashboard">
                <Home className="h-3.5 w-3.5" />
            </Link>

            {items.map((item, index) => (
                <Fragment key={item.label}>
                    <ChevronRight className="mx-1.5 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    {item.href && index !== items.length - 1 ? (
                        <Link href={item.href} className="hover:text-foreground">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="font-medium text-foreground" aria-current="page">
                            {item.label}
                        </span>
                    )}
                </Fragment>
            ))}
        </nav>
    );
}
