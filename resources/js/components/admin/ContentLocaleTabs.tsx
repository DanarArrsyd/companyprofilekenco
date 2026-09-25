import { Languages } from 'lucide-react';

import type { ContentLocale } from '@/lib/translatable-form';
import { cn } from '@/lib/utils';

const TABS: { locale: ContentLocale; label: string }[] = [
    { locale: 'en', label: 'English' },
    { locale: 'id', label: 'Bahasa Indonesia' },
];

/**
 * Switches which language the form's translatable fields edit. Sticky at the
 * top of the form card so it stays reachable on long forms; shared fields
 * (images, status, relations) are unaffected by the active tab.
 */
export function ContentLocaleTabs({
    value,
    onChange,
    translated,
    total,
    inline = false,
}: {
    value: ContentLocale;
    onChange: (locale: ContentLocale) => void;
    /** Translatable fields already filled in Indonesian. */
    translated?: number;
    total?: number;
    /** Plain (non-sticky, edge-free) variant for secondary cards on the same page. */
    inline?: boolean;
}) {
    return (
        <div className={inline ? '' : 'sticky top-0 z-20 -mx-6 border-b border-border bg-surface/95 px-6 py-4 backdrop-blur-sm sm:-mx-8 sm:px-8'}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div role="tablist" aria-label="Content language" className="inline-flex rounded-lg bg-muted p-1">
                    {TABS.map((tab) => {
                        const active = tab.locale === value;

                        return (
                            <button
                                key={tab.locale}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => onChange(tab.locale)}
                                className={cn(
                                    'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                                    active ? 'bg-surface text-foreground shadow-sm' : 'text-slate-700 hover:text-foreground',
                                )}
                            >
                                {tab.label}
                                {tab.locale === 'id' && typeof translated === 'number' && typeof total === 'number' && (
                                    <span className={cn('rounded px-1.5 py-0.5 text-xs', translated === total ? 'bg-success/15 text-success' : 'bg-gray-200 text-slate-700')}>
                                        {translated}/{total}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <p className="flex items-center gap-2 text-xs text-slate-500">
                    <Languages className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {value === 'en'
                        ? 'English is required. Images, status and other shared fields apply to both languages.'
                        : 'Fields marked ID are translated. Leave one blank to show the English text instead.'}
                </p>
            </div>
        </div>
    );
}

/** Marks a field label as translatable while the Indonesian tab is active. */
export function LocaleBadge({ locale }: { locale: ContentLocale }) {
    if (locale === 'en') return null;

    return (
        <span className="ml-2 rounded bg-navy-900/10 px-1.5 py-0.5 align-middle text-xs font-semibold uppercase tracking-wide text-navy-700">
            {locale}
        </span>
    );
}
