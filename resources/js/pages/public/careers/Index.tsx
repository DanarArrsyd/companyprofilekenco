import { Link, router } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import { Pagination } from '@/components/admin/Pagination';
import { SectionHeader } from '@/components/public/SectionHeader';
import { SeoHead } from '@/components/public/SeoHead';
import { revealClass, useInView } from '@/hooks/use-in-view';
import { useLocale } from '@/hooks/use-locale';
import PublicLayout from '@/layouts/PublicLayout';
import { ResolvedSeo } from '@/types/cms';
import { Container, Section } from '@/components/public/Section';

interface VacancyRow {
    id: number; title: string; slug: string; department: string | null; location: string | null;
    employment_type: string | null; closes_at: string | null;
}

function VacancyRowItem({ vacancy }: { vacancy: VacancyRow }) {
    const { localizedRoute, t, formatDate } = useLocale();
    const { ref, inView } = useInView<HTMLDivElement>();

    return (
        <div ref={ref} className={revealClass(inView)}>
            <Link
                href={localizedRoute('public.careers.show', vacancy.slug)}
                className="group flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
                <div>
                    <p className="text-h4 text-navy-900">{vacancy.title}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-small text-muted-foreground">
                        {vacancy.department && <span>{vacancy.department}</span>}
                        {vacancy.location && <span>{vacancy.location}</span>}
                        {vacancy.employment_type && <span>{vacancy.employment_type}</span>}
                        {vacancy.closes_at && <span>{t('Closes :date', { date: formatDate(vacancy.closes_at) })}</span>}
                    </div>
                </div>

                <span className="flex shrink-0 items-center gap-1.5 text-small font-medium text-navy-700 group-hover:text-navy-900">
                    {t('View position')}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
            </Link>
        </div>
    );
}

export default function Index({
    vacancies, departments, filters, seo,
}: {
    vacancies: { data: VacancyRow[]; links: { url: string | null; label: string; active: boolean }[] };
    departments: string[];
    filters: { department?: string; employment_type?: string };
    seo: ResolvedSeo;
}) {
    const { localizedRoute, t } = useLocale();
    return (
        <PublicLayout>
            <SeoHead seo={seo} />

            <Section className="border-b border-border" spacing="intro">
                <SectionHeader
                    as="h1"
                    eyebrow={t('Join Our Team')}
                    heading={t('Careers')}
                    description={t('Open positions across our manufacturing operations.')}
                />
            </Section>

            <Container spacing="content">
                {departments.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2 border-b border-border pb-8">
                        <button
                            onClick={() => router.get(localizedRoute('public.careers'))}
                            className={`text-small font-medium ${!filters.department ? 'text-navy-900' : 'text-muted-foreground hover:text-navy-900'}`}
                        >
                            {t('All')}
                        </button>
                        {departments.map((d) => (
                            <button
                                key={d}
                                onClick={() => router.get(localizedRoute('public.careers'), { department: d })}
                                className={`text-small font-medium ${filters.department === d ? 'text-navy-900' : 'text-muted-foreground hover:text-navy-900'}`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                )}

                {vacancies.data.length === 0 ? (
                    <p className="py-8 text-small text-muted-foreground">{t('No open positions at the moment.')}</p>
                ) : (
                    <div data-reveal-group className="divide-y divide-border border-t border-border">
                        {vacancies.data.map((vacancy) => <VacancyRowItem key={vacancy.id} vacancy={vacancy} />)}
                    </div>
                )}

                <div className="mt-12">
                    <Pagination links={vacancies.links} />
                </div>
            </Container>
        </PublicLayout>
    );
}
