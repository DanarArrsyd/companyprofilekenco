import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

import { ScrollReveal } from '@/components/public/ScrollReveal';
import { useLocale } from '@/hooks/use-locale';

export function SectionHeader({
    eyebrow,
    heading,
    description,
    align = 'left',
    cta,
    className = '',
    as = 'h2',
}: {
    eyebrow?: string;
    heading?: ReactNode;
    description?: string;
    align?: 'left' | 'center';
    cta?: { label: string; href: string };
    className?: string;
    /** Page-level top banners should render a single real H1; nested section headers stay H2. */
    as?: 'h1' | 'h2';
}) {
    const { localize } = useLocale();
    if (!heading && !description) return null;

    const centered = align === 'center';
    const Heading = as;
    const headingSize = as === 'h1' ? 'text-h1' : 'text-h2';

    return (
        <ScrollReveal className={`flex flex-col gap-4 ${centered ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between'} ${className}`}>
            <div className={centered ? 'max-w-2xl' : 'max-w-2xl'}>
                {eyebrow && <p className="text-caption uppercase text-muted-foreground">{eyebrow}</p>}
                {heading && <Heading className={`mt-2 ${headingSize} text-navy-900`} style={{ textWrap: 'balance' }}>{heading}</Heading>}
                {description && <p className="mt-3 text-body-lg text-slate-700">{description}</p>}
            </div>

            {cta && !centered && (
                <Link href={localize(cta.href)} className="shrink-0 text-sm font-medium text-navy-700 hover:text-navy-900">
                    {cta.label} &rarr;
                </Link>
            )}
        </ScrollReveal>
    );
}
