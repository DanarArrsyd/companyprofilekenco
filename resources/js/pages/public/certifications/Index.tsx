import { ArrowUpRight, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { Breadcrumb } from '@/components/public/Breadcrumb';
import { CertificationItemData } from '@/components/public/CertificationItem';
import { PdfPagePreview } from '@/components/public/PdfPagePreview';
import { SeoHead } from '@/components/public/SeoHead';
import { Container } from '@/components/public/Section';
import { useLocale } from '@/hooks/use-locale';
import { IMAGE_SIZES, responsiveImage } from '@/lib/responsive-image';
import PublicLayout from '@/layouts/PublicLayout';
import { ResolvedSeo } from '@/types/cms';

function CertificateImage({ cert, featured = false, expanded = false }: { cert: CertificationItemData; featured?: boolean; expanded?: boolean }) {
    const { t, localizedRoute } = useLocale();
    const fallback = cert.image ? (
        <img
            {...responsiveImage(cert.image, expanded ? IMAGE_SIZES.content : featured ? IMAGE_SIZES.half : IMAGE_SIZES.third)}
            alt={t('Certification mark for :name', { name: cert.name })}
            loading={featured ? 'eager' : 'lazy'}
            className={`w-full object-contain ${expanded ? 'max-h-[64vh]' : featured ? 'max-h-56 sm:max-h-64' : 'max-h-32'}`}
        />
    ) : (
        <span className="text-center text-caption font-semibold uppercase tracking-[0.12em] text-muted-foreground">{t('No preview available')}</span>
    );

    return (
        <div className={`flex items-center justify-center border border-border bg-white ${expanded ? 'h-[72vh] max-h-[42rem] p-4 sm:p-8' : featured ? 'h-64 p-3 sm:h-72 sm:p-4' : 'h-44 p-3 sm:h-48'}`}>
            {cert.has_document ? (
                <PdfPagePreview url={localizedRoute('public.certifications.document', cert.id)} name={cert.name} fallback={fallback} />
            ) : fallback}
        </div>
    );
}

function RecordDetails({ cert, compact = false }: { cert: CertificationItemData; compact?: boolean }) {
    const { t, formatDate } = useLocale();
    const details = (compact ? [
        { key: 'number', label: t('Certificate number'), value: cert.certificate_number },
        { key: 'expires', label: t('Expires'), value: cert.expires_at ? formatDate(cert.expires_at) : null },
    ] : [
        { key: 'issuer', label: t('Issuing body'), value: cert.issuer },
        { key: 'number', label: t('Certificate number'), value: cert.certificate_number },
        { key: 'issued', label: t('Issued'), value: cert.issued_at ? formatDate(cert.issued_at) : null },
        { key: 'expires', label: t('Expires'), value: cert.expires_at ? formatDate(cert.expires_at) : null },
    ]).filter((detail) => detail.value);

    if (details.length === 0) return null;

    return (
        <dl className={`grid grid-cols-2 gap-x-6 border-t border-border ${compact ? 'gap-y-2 pt-4' : 'gap-y-4 pt-5'}`}>
            {details.map((detail) => (
                <div key={detail.key} className={detail.key === 'issuer' ? 'col-span-2 sm:col-span-1' : undefined}>
                    <dt className="text-caption font-semibold uppercase tracking-[0.12em] text-muted-foreground">{detail.label}</dt>
                    <dd className="mt-2 break-words text-small font-medium text-navy-900">{detail.value}</dd>
                </div>
            ))}
        </dl>
    );
}

export default function Index({ certifications, seo }: { certifications: CertificationItemData[]; seo: ResolvedSeo }) {
    const { t } = useLocale();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [selected, setSelected] = useState<CertificationItemData | null>(null);
    const featured = certifications.find((cert) => !cert.is_expired) ?? certifications[0];
    const remaining = certifications.filter((cert) => cert.id !== featured?.id);
    const current = remaining.filter((cert) => !cert.is_expired);
    const archive = remaining.filter((cert) => cert.is_expired);

    const openImage = (cert: CertificationItemData) => {
        setSelected(cert);
        dialogRef.current?.showModal();
    };

    return (
        <PublicLayout>
            <SeoHead seo={seo} />

            <Container className="!max-w-5xl pt-7 sm:pt-9">
                <Breadcrumb items={[{ label: t('Home'), href: '/' }, { label: t('Certifications') }]} />
            </Container>

            <Container as="section" spacing="content" aria-labelledby="certifications-heading" className="grid !max-w-5xl gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] md:items-end md:gap-12">
                <div>
                    <p className="text-caption font-semibold uppercase tracking-[0.16em] text-navy-700">{t('The credentials gallery')}</p>
                    <h1 id="certifications-heading" className="mt-3 text-balance text-h2 text-navy-900">{t('Certifications')}</h1>
                </div>
                <div className="border-l-2 border-navy-900 pl-5">
                    <p className="max-w-md text-body text-slate-700">{t('The credentials behind our work, on display.')}</p>
                    <p className="mt-4 text-caption font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        <span className="mr-2 tabular-nums text-navy-900">{String(certifications.length).padStart(2, '0')}</span>
                        {t('Published records')}
                    </p>
                </div>
            </Container>

            {featured ? (
                <>
                    <section className="bg-secondary" aria-labelledby="featured-record-heading">
                        <Container spacing="content" className="!max-w-5xl">
                            <div className="mb-5 flex items-center justify-between gap-4 border-b border-navy-900/20 pb-4">
                                <h2 id="featured-record-heading" className="text-caption font-semibold uppercase tracking-[0.16em] text-navy-900">{t('Featured record')}</h2>
                                <span className="text-caption tabular-nums text-muted-foreground">01 / {String(certifications.length).padStart(2, '0')}</span>
                            </div>

                            <div className="grid overflow-hidden border border-border bg-white md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                                <figure className="border-b border-border bg-secondary p-4 sm:p-5 md:border-b-0 md:border-r">
                                    <CertificateImage cert={featured} featured />
                                    <figcaption className="mt-3 text-caption uppercase tracking-[0.12em] text-muted-foreground">01 / {t(featured.has_document ? 'PDF page 1' : 'Certification mark')}</figcaption>
                                </figure>

                                <div className="flex flex-col justify-center px-6 py-7 sm:px-8 sm:py-9 lg:px-10">
                                    <div className="flex items-center gap-2 text-small font-semibold text-navy-700">
                                        <span className={`h-2 w-2 rounded-full ${featured.is_expired ? 'bg-danger' : 'bg-success'}`} aria-hidden="true" />
                                        {featured.is_expired ? t('Expired') : t('Active')}
                                    </div>
                                    <h3 className="mt-4 text-balance text-h3 text-navy-900">{featured.name}</h3>

                                    <div className="mt-6"><RecordDetails cert={featured} /></div>

                                    {(featured.has_document || featured.image) && (
                                        <button
                                            type="button"
                                            onClick={() => openImage(featured)}
                                            className="mt-6 inline-flex min-h-10 w-fit items-center gap-3 border-b border-navy-900 pb-1 text-small font-semibold text-navy-900 transition-colors hover:text-navy-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy-700"
                                        >
                                            {t(featured.has_document ? 'View PDF preview' : 'View certification mark')} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Container>
                    </section>

                    {(current.length > 0 || archive.length > 0) && (
                        <Container as="section" spacing="section" aria-labelledby="collection-heading" className="!max-w-5xl">
                            <div className="mb-9 border-b border-border pb-6">
                                <p className="text-caption font-semibold uppercase tracking-[0.16em] text-navy-700">{t('The collection')}</p>
                                <h2 id="collection-heading" className="mt-3 text-h2 text-navy-900">{t('Explore the records')}</h2>
                            </div>
                            {[
                                { heading: t('Current certifications'), items: current },
                                { heading: t('Archive'), items: archive },
                            ].filter((group) => group.items.length > 0).map((group) => (
                                <div key={group.heading} className="mt-12 first:mt-0">
                                    <h3 className="mb-5 text-caption font-semibold uppercase tracking-[0.14em] text-muted-foreground">{group.heading}</h3>
                                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {group.items.map((cert) => (
                                            <article key={cert.id} className="min-w-0 border border-border bg-white p-4">
                                                <CertificateImage cert={cert} />
                                                <div className="px-1 pb-1 pt-5">
                                                    <p className="text-caption font-semibold uppercase tracking-[0.12em] text-muted-foreground">{cert.is_expired ? t('Expired') : t('Active')}</p>
                                                    <h4 className="mt-2 text-h4 text-navy-900">{cert.name}</h4>
                                                    {cert.issuer && <p className="mt-2 text-small text-slate-700">{cert.issuer}</p>}
                                                    <div className="mt-4"><RecordDetails cert={cert} compact /></div>
                                                    {(cert.has_document || cert.image) && (
                                                        <button type="button" onClick={() => openImage(cert)} className="mt-6 inline-flex items-center gap-2 text-small font-semibold text-navy-700 underline underline-offset-4 hover:text-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy-700">
                                                            {t(cert.has_document ? 'View PDF preview' : 'View certification mark')} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                                                        </button>
                                                    )}
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </Container>
                    )}
                </>
            ) : (
                <Container spacing="section">
                    <p className="text-body text-muted-foreground">{t('No certifications published yet.')}</p>
                </Container>
            )}

            <dialog ref={dialogRef} onClose={() => setSelected(null)} aria-label={t(selected?.has_document ? 'PDF preview' : 'Certification mark')} className="m-auto max-h-[95vh] w-[min(94vw,72rem)] border border-border bg-white p-4 text-foreground shadow-xl backdrop:bg-navy-900/80 sm:p-7">
                {selected && (selected.has_document || selected.image) && (
                    <div>
                        <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
                            <p className="text-small font-semibold text-navy-900">{selected.name}</p>
                            <button type="button" onClick={() => dialogRef.current?.close()} aria-label={t('Close image')} className="inline-flex h-10 w-10 items-center justify-center border border-border hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700">
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="mt-5"><CertificateImage cert={selected} expanded /></div>
                    </div>
                )}
            </dialog>
        </PublicLayout>
    );
}
