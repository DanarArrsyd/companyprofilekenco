import { Head } from '@inertiajs/react';
import { useState } from 'react';

import { ContentLocaleTabs } from '@/components/admin/ContentLocaleTabs';
import { PageHeader } from '@/components/admin/PageHeader';
import { PageSectionEditor } from '@/components/admin/PageSectionEditor';
import AdminLayout from '@/layouts/AdminLayout';
import type { ContentLocale } from '@/lib/translatable-form';
import { CmsPage } from '@/types/cms';

const SECTION_LABELS: Record<string, string> = {
    hero: 'Hero',
    company_intro: 'Company Introduction',
    stats: 'Statistics',
    capabilities: 'Capabilities',
    products: 'Products',
    facilities: 'Facilities',
    quality: 'Quality',
    news: 'News',
    career_cta: 'Career CTA',
    contact_cta: 'Contact CTA',
};

export default function Edit({
    page,
    availableCapabilities,
    availableProducts,
    availableFacilities,
}: {
    page: CmsPage;
    sectionTypes: string[];
    availableCapabilities: { id: number; name: string }[];
    availableProducts: { id: number; name: string }[];
    availableFacilities: { id: number; name: string }[];
}) {
    const sections = page.sections ?? [];
    const [contentLocale, setContentLocale] = useState<ContentLocale>('en');

    return (
        <AdminLayout>
            <Head title="Homepage" />

            <PageHeader
                title="Homepage"
                description="Structured sections rendered on the public homepage, in a fixed order."
            />

            <div className="space-y-6">
                {/* One language switch for every section card; stays in view while scrolling the stack. */}
                <div className="sticky top-0 z-30 rounded-lg border border-border bg-surface/95 px-6 py-4 backdrop-blur-sm sm:px-8">
                    <ContentLocaleTabs inline value={contentLocale} onChange={setContentLocale} />
                </div>

                {sections.map((section) => (
                    <PageSectionEditor
                        key={section.id}
                        pageId={page.id}
                        section={section}
                        isFirst
                        isLast
                        fixed
                        label={SECTION_LABELS[section.section_type] ?? section.section_type}
                        onMove={() => undefined}
                        locale={contentLocale}
                        pickerOptions={{
                            capabilities: availableCapabilities,
                            products: availableProducts,
                            facilities: availableFacilities,
                        }}
                    />
                ))}
            </div>
        </AdminLayout>
    );
}
