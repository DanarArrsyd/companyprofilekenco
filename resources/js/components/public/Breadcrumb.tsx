import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';

import { useLocale } from '@/hooks/use-locale';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

/**
 * Public breadcrumb — not wired into any page yet in Phase 9B, but
 * production-ready for 9C/9D: schema-ready (BreadcrumbList itemscope
 * markup) and keyboard/screen-reader accessible via a labeled <nav>.
 */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
    const { localize, t } = useLocale();
    if (items.length === 0) return null;

    return (
        <nav aria-label={t('Breadcrumb')} className="text-small">
            <ol
                itemScope
                itemType="https://schema.org/BreadcrumbList"
                className="flex flex-wrap items-center gap-1.5 text-muted-foreground"
            >
                {items.map((item, index) => {
                    const position = index + 1;
                    const isLast = index === items.length - 1;

                    return (
                        <Fragment key={`${item.label}-${index}`}>
                            {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                            <li
                                itemProp="itemListElement"
                                itemScope
                                itemType="https://schema.org/ListItem"
                                className="flex items-center"
                            >
                                {item.href && !isLast ? (
                                    <Link href={localize(item.href)} itemProp="item" className="hover:text-navy-900">
                                        <span itemProp="name">{item.label}</span>
                                    </Link>
                                ) : (
                                    <span itemProp="name" aria-current={isLast ? 'page' : undefined} className={isLast ? 'text-foreground' : undefined}>
                                        {item.label}
                                    </span>
                                )}
                                <meta itemProp="position" content={String(position)} />
                            </li>
                        </Fragment>
                    );
                })}
            </ol>
        </nav>
    );
}
