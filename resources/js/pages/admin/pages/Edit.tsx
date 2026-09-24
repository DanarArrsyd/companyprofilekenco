import { Head, router, useForm } from '@inertiajs/react';
import { Eye, Plus } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import { ContentLocaleTabs, LocaleBadge } from '@/components/admin/ContentLocaleTabs';
import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { PageHeader } from '@/components/admin/PageHeader';
import { PageSectionEditor } from '@/components/admin/PageSectionEditor';
import { SEO_FIELDS_DEFAULT, SeoFields, SeoFieldsData, seoTranslations } from '@/components/admin/SeoFields';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePermissions } from '@/hooks/use-permissions';
import AdminLayout from '@/layouts/AdminLayout';
import { countTranslated, initialTranslations, translatableBinder, translatableError, type ContentLocale, type TranslationValues } from '@/lib/translatable-form';
import { CmsPage } from '@/types/cms';

const TRANSLATABLE_FIELDS = ['title'];

export default function Edit({
    page,
    statusOptions,
    sectionTypeOptions,
}: {
    page: CmsPage;
    statusOptions: string[];
    sectionTypeOptions: { value: string; label: string }[];
}) {
    const { can } = usePermissions();
    const sections = page.sections ?? [];
    const [newSectionType, setNewSectionType] = useState(sectionTypeOptions[0]?.value ?? 'text');

    const { data, setData, post, processing, errors } = useForm<{
        _method: string; title: string; status: string; published_at: string; seo: SeoFieldsData;
        translations: { id: TranslationValues };
    }>({
        translations: initialTranslations(page, TRANSLATABLE_FIELDS),
        _method: 'put',
        title: page.title,
        status: page.status,
        published_at: page.published_at ? page.published_at.slice(0, 16) : '',
        seo: {
            ...SEO_FIELDS_DEFAULT,
            translations: seoTranslations(page.seo_metadata),
            meta_title: page.seo_metadata?.meta_title ?? '',
            meta_description: page.seo_metadata?.meta_description ?? '',
            canonical_url: page.seo_metadata?.canonical_url ?? '',
            og_title: page.seo_metadata?.og_title ?? '',
            og_description: page.seo_metadata?.og_description ?? '',
            og_image_path: page.seo_metadata?.og_image ?? '',
            robots_index: page.seo_metadata?.robots_index ?? true,
            robots_follow: page.seo_metadata?.robots_follow ?? true,
        },
    });

    const [contentLocale, setContentLocale] = useState<ContentLocale>('en');
    const bind = translatableBinder(data, setData, contentLocale);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.pages.update', page.id), { forceFormData: true });
    };

    const addSection = () => {
        router.post(
            route('admin.pages.sections.store', page.id),
            { section_type: newSectionType, is_active: true },
            { preserveScroll: true },
        );
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const target = direction === 'up' ? index - 1 : index + 1;
        if (target < 0 || target >= sections.length) return;

        const reordered = [...sections];
        [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

        router.post(
            route('admin.pages.sections.reorder', page.id),
            { ordered_ids: reordered.map((s) => s.id) },
            { preserveScroll: true },
        );
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${page.title}`} />

            <PageHeader
                title={page.title}
                breadcrumbs={[{ label: 'Pages', href: route('admin.pages') }, { label: 'Edit' }]}
                actions={
                    <div className="flex items-center gap-2">
                        <StatusBadge status={page.status} />
                        <a href={route('admin.pages.preview', page.id)} target="_blank" rel="noreferrer">
                            <Button variant="secondary" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                            </Button>
                        </a>
                        {can('pages.update') && page.status !== 'published' && (
                            <Button size="sm" onClick={() => router.post(route('admin.pages.publish', page.id))}>
                                Publish
                            </Button>
                        )}
                        {can('pages.update') && page.status !== 'archived' && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => router.post(route('admin.pages.archive', page.id))}
                            >
                                Archive
                            </Button>
                        )}
                    </div>
                }
            />

            <div className="space-y-6">
                <form onSubmit={submit} className="rounded-lg border border-border bg-surface px-6 sm:px-8">
                    <ContentLocaleTabs value={contentLocale} onChange={setContentLocale} translated={countTranslated(data.translations.id)} total={TRANSLATABLE_FIELDS.length} />
                    <FormSection title="General" description="Basic identity for this page.">
                        <div>
                            <Label htmlFor="title">Title<LocaleBadge locale={contentLocale} /></Label>
                            <Input
                                id="title"
                                {...bind('title')}
                                className="mt-1.5"
                            />
                            {translatableError(errors, 'title', contentLocale) && <p className="mt-1 text-sm text-danger">{translatableError(errors, 'title', contentLocale)}</p>}
                        </div>

                        <div>
                            <Label>Slug</Label>
                            <p className="mt-1.5 rounded border border-border bg-muted px-3 py-2 text-sm text-slate-600">
                                /{page.slug}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                The URL slug cannot be changed here to avoid breaking published links.
                            </p>
                        </div>
                    </FormSection>

                    <FormSection title="Publishing" description="Control visibility of this page.">
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value as typeof data.status)}
                                className="mt-1.5 h-11 w-full rounded border border-border bg-surface px-3 text-sm"
                            >
                                {statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="published_at">Published at</Label>
                            <Input
                                id="published_at"
                                type="datetime-local"
                                value={data.published_at}
                                onChange={(e) => setData('published_at', e.target.value)}
                                className="mt-1.5"
                            />
                        </div>
                    </FormSection>

                    <FormSection title="SEO" description="Search engine and social sharing metadata.">
                        <SeoFields
                            locale={contentLocale}
                            data={data.seo}
                            onChange={(patch) => setData('seo', { ...data.seo, ...patch })}
                            errors={errors}
                            titleFallback={page.title}
                            pageUrl={`/${page.slug}`}
                        />
                    </FormSection>

                    <FormActions>
                        <Button type="submit" disabled={processing}>
                            Save Changes
                        </Button>
                    </FormActions>
                </form>

                <div className="rounded-lg border border-border bg-surface p-6 sm:p-8">
                    <h2 className="text-sm font-semibold text-foreground">Content Sections</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Structured sections rendered on the public page, in order.
                    </p>
                    <div className="mt-4">
                        <ContentLocaleTabs inline value={contentLocale} onChange={setContentLocale} />
                    </div>

                    <div className="mt-4 space-y-4">
                        {sections.map((section, index) => (
                            <PageSectionEditor
                                key={section.id}
                                pageId={page.id}
                                section={section}
                                isFirst={index === 0}
                                isLast={index === sections.length - 1}
                                onMove={(direction) => moveSection(index, direction)}
                                locale={contentLocale}
                            />
                        ))}
                    </div>

                    <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                        <select
                            value={newSectionType}
                            onChange={(e) => setNewSectionType(e.target.value)}
                            className="h-10 rounded border border-border bg-surface px-3 text-sm"
                        >
                            {sectionTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <Button type="button" size="sm" onClick={addSection}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Section
                        </Button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
