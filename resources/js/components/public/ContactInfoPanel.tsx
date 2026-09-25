import { usePage } from '@inertiajs/react';
import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import { ReactNode } from 'react';

import { useLocale } from '@/hooks/use-locale';

/** A Google Maps "embed" URL is iframe-safe; a plain maps.google.com link is not — link out instead. */
function isEmbeddableMapUrl(url: string): boolean {
    return url.includes('/maps/embed') || url.includes('output=embed');
}

function InfoRow({ icon: Icon, label, children }: { icon: typeof MapPin; label: string; children: ReactNode }) {
    return (
        <div className="flex gap-3 py-4">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
                <p className="text-caption uppercase text-muted-foreground">{label}</p>
                <div className="mt-1 text-small text-foreground">{children}</div>
            </div>
        </div>
    );
}

/**
 * Company contact details sourced from Settings — self-contained (reads
 * siteSettings itself) so it drops into both the full /contact page and the
 * homepage ContactCTA band without either caller wiring props through.
 * `compact` trims it to a plain address/phone/email list with no divider
 * rules or map, sized for sitting inside a colored CTA section.
 */
export function ContactInfoPanel({ compact = false }: { compact?: boolean }) {
    const { t } = useLocale();
    const { siteSettings } = usePage().props;
    const hasAny = siteSettings.address || siteSettings.phone || siteSettings.email || siteSettings.operating_hours;

    if (!hasAny) return null;

    if (compact) {
        return (
            <div className="space-y-3 text-small text-slate-700">
                {siteSettings.address && <p className="whitespace-pre-line">{siteSettings.address}</p>}
                {siteSettings.phone && (
                    <a href={`tel:${siteSettings.phone}`} className="block hover:text-navy-900">{siteSettings.phone}</a>
                )}
                {siteSettings.email && (
                    <a href={`mailto:${siteSettings.email}`} className="block hover:text-navy-900">{siteSettings.email}</a>
                )}
            </div>
        );
    }

    return (
        <div>
            <dl className="divide-y divide-border border-t border-border">
                {siteSettings.address && (
                    <InfoRow icon={MapPin} label={t('Address')}>
                        <span className="whitespace-pre-line">{siteSettings.address}</span>
                    </InfoRow>
                )}
                {siteSettings.phone && (
                    <InfoRow icon={Phone} label={t('Phone')}>
                        <a href={`tel:${siteSettings.phone}`} className="hover:text-navy-900">{siteSettings.phone}</a>
                    </InfoRow>
                )}
                {siteSettings.email && (
                    <InfoRow icon={Mail} label={t('Email')}>
                        <a href={`mailto:${siteSettings.email}`} className="hover:text-navy-900">{siteSettings.email}</a>
                    </InfoRow>
                )}
                {siteSettings.operating_hours && (
                    <InfoRow icon={Phone} label={t('Operating Hours')}>
                        <span className="whitespace-pre-line">{siteSettings.operating_hours}</span>
                    </InfoRow>
                )}
            </dl>

            {siteSettings.map_embed_url && (
                <div className="mt-8">
                    {isEmbeddableMapUrl(siteSettings.map_embed_url) ? (
                        <iframe
                            src={siteSettings.map_embed_url}
                            title={t('Location map')}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="aspect-[4/3] w-full border border-border"
                        />
                    ) : (
                        <a
                            href={siteSettings.map_embed_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-small font-medium text-navy-700 hover:text-navy-900"
                        >
                            {t('View on Map')}
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}
