import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

import { Breadcrumb, BreadcrumbItem } from '@/components/public/Breadcrumb';
import { SeoHead } from '@/components/public/SeoHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/hooks/use-locale';
import PublicLayout from '@/layouts/PublicLayout';
import { ResolvedSeo } from '@/types/cms';
import { Container } from '@/components/public/Section';

interface Vacancy {
    id: number; title: string; slug: string; department: string | null; location: string | null;
    employment_type: string | null; description: string | null; requirements: string | null;
    closes_at: string | null;
}

function isOpen(vacancy: Vacancy): boolean {
    return !vacancy.closes_at || new Date(vacancy.closes_at) > new Date();
}

export default function Show({
    vacancy, seo, breadcrumb, schema, preview,
}: {
    vacancy: Vacancy;
    seo: ResolvedSeo;
    breadcrumb: BreadcrumbItem[];
    schema?: Array<Record<string, unknown> | null>;
    preview: boolean;
}) {
    const { localizedRoute, t, formatDate } = useLocale();
    const [submitted, setSubmitted] = useState(false);
    const open = isOpen(vacancy);

    const { data, setData, post, processing, errors, reset } = useForm<{
        name: string; email: string; phone: string; address: string; cover_letter: string; cv: File | null;
    }>({
        name: '', email: '', phone: '', address: '', cover_letter: '', cv: null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(localizedRoute('public.careers.apply', vacancy.slug), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setSubmitted(true);
            },
        });
    };

    const meta = [
        ['Department', vacancy.department],
        ['Location', vacancy.location],
        ['Employment Type', vacancy.employment_type],
        ['Closing Date', vacancy.closes_at ? formatDate(vacancy.closes_at) : null],
    ].filter(([, value]) => Boolean(value)) as [string, string][];

    return (
        <PublicLayout>
            <SeoHead seo={seo} schema={schema} />

            {preview && (
                <div className="bg-warning/10 px-5 py-2 text-center text-small font-medium text-warning">
                    {t('Draft preview — this vacancy is not publicly visible.')}
                </div>
            )}

            <Container spacing="content">
                <Breadcrumb items={breadcrumb} />

                <div className="mt-8 flex flex-col gap-10 lg:grid lg:grid-cols-[1fr_22.5rem] lg:items-start lg:gap-16">
                    <div className="lg:col-start-1">
                        <h1 className="text-balance text-h2 text-navy-900">{vacancy.title}</h1>
                        {!open && (
                            <p className="mt-3 text-small font-medium text-danger">{t('Closed — no longer accepting applications.')}</p>
                        )}
                    </div>

                    {meta.length > 0 && (
                        <dl className="divide-y divide-border border-t border-border lg:col-start-2">
                            {meta.map(([label, value]) => (
                                <div key={label} className="flex justify-between gap-4 py-3">
                                    <dt className="text-small text-muted-foreground">{t(label)}</dt>
                                    <dd className="text-small font-medium text-foreground">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    )}

                    <div className="space-y-8 lg:col-start-1">
                        {vacancy.description && (
                            <div>
                                <h2 className="text-h4 text-navy-900">{t('Job Description')}</h2>
                                <p className="mt-3 whitespace-pre-line text-body text-slate-700">{vacancy.description}</p>
                            </div>
                        )}
                        {vacancy.requirements && (
                            <div>
                                <h2 className="text-h4 text-navy-900">{t('Requirements')}</h2>
                                <p className="mt-3 whitespace-pre-line text-body text-slate-700">{vacancy.requirements}</p>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-border pt-6 lg:col-start-2">
                        <h2 className="text-h4 text-navy-900">{t('Apply for this position')}</h2>

                        {!open ? (
                            <p className="mt-4 text-small text-muted-foreground">{t('Applications are closed for this vacancy.')}</p>
                        ) : submitted ? (
                            <p className="mt-4 text-small font-medium text-success">{t('Your application has been submitted. We will review it and get back to you.')}</p>
                        ) : (
                            <form onSubmit={submit} className="mt-4 space-y-4" encType="multipart/form-data">
                                <div>
                                    <Label htmlFor="name">{t('Full Name')}</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1.5" />
                                    {errors.name && <p className="mt-1 text-small text-danger">{errors.name}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="email">{t('Email')}</Label>
                                    <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="mt-1.5" />
                                    {errors.email && <p className="mt-1 text-small text-danger">{errors.email}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="phone">{t('Phone')}</Label>
                                    <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="mt-1.5" />
                                    {errors.phone && <p className="mt-1 text-small text-danger">{errors.phone}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="address">{t('Address')}</Label>
                                    <Input id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} className="mt-1.5" />
                                </div>
                                <div>
                                    <Label htmlFor="cover_letter">{t('Cover Letter')}</Label>
                                    <textarea id="cover_letter" value={data.cover_letter} onChange={(e) => setData('cover_letter', e.target.value)} rows={4} className="mt-1.5 w-full border border-border bg-surface px-3 py-2 text-small" />
                                </div>
                                <div>
                                    <Label htmlFor="cv">{t('CV (PDF preferred, max 5MB)')}</Label>
                                    <input id="cv" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setData('cv', e.target.files?.[0] ?? null)} className="mt-1.5 block text-small" />
                                    {errors.cv && <p className="mt-1 text-small text-danger">{errors.cv}</p>}
                                </div>
                                <Button type="submit" disabled={processing} className="w-full">{t('Submit Application')}</Button>
                            </form>
                        )}
                    </div>
                </div>
            </Container>
        </PublicLayout>
    );
}
