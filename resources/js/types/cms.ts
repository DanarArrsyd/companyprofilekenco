export type ContentStatus = 'draft' | 'published' | 'archived';

export interface SeoMetadata {
    id?: number;
    meta_title: string | null;
    meta_description: string | null;
    canonical_url: string | null;
    og_title: string | null;
    og_description: string | null;
    og_image: string | null;
    robots_index: boolean;
    robots_follow: boolean;
}

export interface PageSection {
    id: number;
    page_id: number;
    section_type: string;
    title: string | null;
    subtitle: string | null;
    content: Record<string, unknown> | null;
    settings_json: Record<string, unknown> | null;
    sort_order: number;
    is_active: boolean;
}

export interface CmsPage {
    id: number;
    title: string;
    slug: string;
    page_type: 'standard' | 'homepage';
    status: ContentStatus;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    sections?: PageSection[];
    seoMetadata?: SeoMetadata | null;
}

export interface ResolvedSeo {
    title: string;
    description: string | null;
    canonical_url: string | null;
    og_title: string | null;
    og_description: string | null;
    og_image: string | null;
    robots_index: boolean;
    robots_follow: boolean;
}
