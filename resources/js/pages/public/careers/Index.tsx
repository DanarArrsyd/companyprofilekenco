import { Link, router } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import { Pagination } from '@/components/admin/Pagination';
import { SectionHeader } from '@/components/public/SectionHeader';
import { SeoHead } from '@/components/public/SeoHead';
import { useInView } from '@/hooks/use-in-view';
import PublicLayout from '@/layouts/PublicLayout';
import { ResolvedSeo } from '@/types/cms';

interface VacancyRow {
    id: number; title: string; slug: string; department: string | null; location: string | null;
    employment_type: string | null; closes_at: string | null;
}

function VacancyRowItem({ vacancy }: { vacancy: VacancyRow }) {
    const { ref, inView } = useInView<HTMLDivElement>();

    return (
        <div ref={ref} className={`transition-all duration-500 ease-out ${inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <Link
                href={route('public.careers.show', vacancy.slug)}
                className="group flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
                <div>
                    <p className="text-h4 text-navy-900">{vacancy.title}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-small text-muted-foreground">
                        {vacancy.department && <span>{vacancy.department}</span>}
                        {vacancy.location && <span>{vacancy.location}</span>}
                        {vacancy.employment_type && <span>{vacancy.employment_type}</span>}
                        {vacancy.closes_at && <span>Closes {new Date(vacancy.closes_at).toLocaleDateString()}</span>}
                    </div>
                </div>

                <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-navy-700 group-hover:text-navy-900">
                    View position
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
    return (
        <PublicLayout>
            <SeoHead seo={seo} />

            <section className="border-b border-border">
                <div className="mx-auto max-w-content px-5 py-16 sm:px-6 lg:px-8">
                    <SectionHeader
                        as="h1"
                        eyebrow="Join Our Team"
                        heading="Careers"
                        description="Open positions across our manufacturing operations."
                    />
                </div>
            </section>

            <div className="mx-auto max-w-content px-5 py-12 sm:px-6 lg:px-8">
                {departments.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2 border-b border-border pb-8">
                        <button
                            onClick={() => router.get(route('public.careers'))}
                            className={`text-sm font-medium ${!filters.department ? 'text-navy-900' : 'text-muted-foreground hover:text-navy-900'}`}
                        >
                            All
                        </button>
                        {departments.map((d) => (
                            <button
                                key={d}
                                onClick={() => router.get(route('public.careers'), { department: d })}
                                className={`text-sm font-medium ${filters.department === d ? 'text-navy-900' : 'text-muted-foreground hover:text-navy-900'}`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                )}

                {vacancies.data.length === 0 ? (
                    <p className="py-8 text-small text-muted-foreground">No open positions at the moment.</p>
                ) : (
                    <div data-reveal-group className="divide-y divide-border border-t border-border">
                        {vacancies.data.map((vacancy) => <VacancyRowItem key={vacancy.id} vacancy={vacancy} />)}
                    </div>
                )}

                <div className="mt-12">
                    <Pagination links={vacancies.links} />
                </div>
            </div>
        </PublicLayout>
    );
}
