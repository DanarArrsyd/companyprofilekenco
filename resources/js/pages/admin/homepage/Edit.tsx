import { Head } from '@inertiajs/react';

import { PageHeader } from '@/components/admin/PageHeader';
import { PageSectionEditor } from '@/components/admin/PageSectionEditor';
import AdminLayout from '@/layouts/AdminLayout';
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

    return (
        <AdminLayout>
            <Head title="Homepage" />

            <PageHeader
                title="Homepage"
                description="Structured sections rendered on the public homepage, in a fixed order."
            />

            <div className="space-y-6">
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
