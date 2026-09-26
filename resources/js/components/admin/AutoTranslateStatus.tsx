import { Link, usePage } from '@inertiajs/react';
import { CheckCircle2, Info, TriangleAlert } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { AutoTranslateReport } from '@/types';

const LANGUAGE = { en: 'English', id: 'Bahasa Indonesia' } as const;

/**
 * The result of the last save's automatic translation, shown under the
 * language tabs until the next visit: how many texts were regenerated,
 * nothing to translate, or Azure's reason for refusing.
 */
export function AutoTranslateStatus() {
    const report = usePage().props.flash?.autoTranslate as AutoTranslateReport | null | undefined;

    if (!report) return null;

    const tone = {
        translated: { icon: CheckCircle2, className: 'border-success/30 bg-success/10 text-success' },
        unchanged: { icon: Info, className: 'border-border bg-muted text-slate-700' },
        failed: { icon: TriangleAlert, className: 'border-warning/40 bg-warning/10 text-foreground' },
    }[report.status];
    const Icon = tone.icon;

    return (
        <div role="status" className={cn('flex max-w-xl items-start gap-2 rounded-md border px-3 py-2 text-xs leading-relaxed', tone.className)}>
            <Icon className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', report.status === 'failed' && 'text-warning')} aria-hidden="true" />
            <p>
                {report.status === 'translated' && (
                    <>
                        <span className="font-semibold">{LANGUAGE[report.to]} updated</span> from {LANGUAGE[report.from]} · {report.count} {report.count === 1 ? 'text' : 'texts'}
                    </>
                )}
                {report.status === 'unchanged' && <>Saved. There was no {LANGUAGE[report.from]} text to translate.</>}
                {report.status === 'failed' && (
                    <>
                        <span className="font-semibold">Saved, but {LANGUAGE[report.to]} was not updated.</span> {report.reason}{' '}
                        <Link href={route('admin.settings', { tab: 'System' })} className="font-medium text-navy-700 underline underline-offset-2 hover:text-navy-900">
                            Test the connection in Settings
                        </Link>
                    </>
                )}
            </p>
        </div>
    );
}
