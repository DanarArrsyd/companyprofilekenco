import { useLocale } from '@/hooks/use-locale';

export interface CertificationItemData {
    id: number;
    name: string;
    issuer?: string | null;
    certificate_number?: string | null;
    issued_at?: string | null;
    expires_at?: string | null;
    is_expired?: boolean;
    image?: string | null;
}

/**
 * Document-plate certificate presentation — deliberately not a product
 * card. Mark sits directly on the page background; identity is carried by
 * a thin top rule and label/value typography, like a compliance document
 * footer rather than a shop tile.
 */
function Plate({ cert }: { cert: CertificationItemData }) {
    const { t, formatDate } = useLocale();
    return (
        <div className="w-40 shrink-0 border-t-2 border-navy-900 pt-4 text-center sm:w-44">
            {cert.image ? (
                <img src={`/storage/${cert.image}`} alt={cert.name} loading="lazy" className="mx-auto h-16 w-16 object-contain" />
            ) : (
                <div className="mx-auto flex h-16 w-16 items-center justify-center text-caption uppercase text-muted-foreground">
                    {t('Mark')}
                </div>
            )}
            <p className="mt-3 text-small font-medium text-foreground">{cert.name}</p>
            {cert.issuer && <p className="mt-0.5 text-caption text-muted-foreground">{cert.issuer}</p>}
            {cert.expires_at && (
                <p className="mt-1 text-caption text-muted-foreground">{t('Valid until :date', { date: formatDate(cert.expires_at) })}</p>
            )}
        </div>
    );
}

/**
 * Full compliance-record row for the Certifications index — a document
 * ledger line, not a shop tile: mark, identity and reference number on the
 * left; issue/expiry dates and a plain status label on the right.
 */
function Row({ cert }: { cert: CertificationItemData }) {
    const { t, formatDate } = useLocale();
    return (
        <div className="flex flex-col gap-4 py-6 sm:grid sm:grid-cols-[4rem_1fr_auto] sm:items-center sm:gap-8">
            <div className="flex items-start gap-4 sm:contents">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-border">
                    {cert.image ? (
                        <img src={`/storage/${cert.image}`} alt={cert.name} loading="lazy" className="h-10 w-10 object-contain" />
                    ) : (
                        <span className="text-caption uppercase text-muted-foreground">{t('Mark')}</span>
                    )}
                </div>

                <div>
                    <p className="text-body font-medium text-foreground">{cert.name}</p>
                    <p className="mt-1 text-small text-muted-foreground">
                        {[cert.issuer, cert.certificate_number ? t('No. :number', { number: cert.certificate_number }) : null].filter(Boolean).join(' · ') || '—'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-6 pl-[4.5rem] sm:justify-end sm:pl-0">
                <dl className="tabular-nums text-small text-muted-foreground">
                    {cert.issued_at && (
                        <div className="flex gap-2 sm:justify-end">
                            <dt>{t('Issued')}</dt><dd className="text-foreground">{formatDate(cert.issued_at)}</dd>
                        </div>
                    )}
                    {cert.expires_at && (
                        <div className="flex gap-2 sm:justify-end">
                            <dt>{t('Expires')}</dt><dd className="text-foreground">{formatDate(cert.expires_at)}</dd>
                        </div>
                    )}
                </dl>

                <span className={`shrink-0 text-caption uppercase ${cert.is_expired ? 'text-danger' : 'text-success'}`}>
                    {cert.is_expired ? t('Expired') : t('Active')}
                </span>
            </div>
        </div>
    );
}

export function CertificationItem({
    items,
    variant = 'compact',
}: {
    items: CertificationItemData[];
    variant?: 'compact' | 'detailed';
}) {
    if (items.length === 0) return null;

    if (variant === 'detailed') {
        return (
            <div data-reveal-group className="divide-y divide-border border-t border-border">
                {items.map((cert) => <Row key={cert.id} cert={cert} />)}
            </div>
        );
    }

    return (
        <div data-reveal-group className="-mx-5 flex gap-8 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:gap-10 sm:overflow-visible sm:px-0">
            {items.map((cert) => <Plate key={cert.id} cert={cert} />)}
        </div>
    );
}
