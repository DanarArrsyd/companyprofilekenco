import { ExternalLink } from 'lucide-react';

/** Where this item appears on the public site. */
export function WebsitePanel({ url, places }: { url?: string | null; places: string[] }) {
    return (
        <section className="space-y-3 rounded-lg border border-border bg-surface p-5 text-sm text-slate-700">
            <h2 className="text-base font-semibold text-foreground">Tampil di website</h2>
            {url && (
                <a href={url} target="_blank" rel="noreferrer" className="flex items-start gap-2 break-all text-navy-700 hover:text-navy-900">
                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {url}
                </a>
            )}
            <ul className="space-y-1.5">
                {places.map((place) => (
                    <li key={place} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" aria-hidden="true" />
                        {place}
                    </li>
                ))}
            </ul>
        </section>
    );
}
