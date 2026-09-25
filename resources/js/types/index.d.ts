export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export interface FlashMessages {
    success?: string | null;
    error?: string | null;
    warning?: string | null;
    info?: string | null;
}

export interface SiteSettings {
    company_name: string;
    tagline: string | null;
    logo: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    operating_hours: string | null;
    map_embed_url: string | null;
    social: { linkedin: string | null; youtube: string | null; instagram: string | null };
}

export interface MenuNewsItem {
    title: string;
    slug: string;
    featured_image: string | null;
    published_at: string | null;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
        roles: string[];
        permissions: string[];
    };
    flash: FlashMessages;
    siteSettings: SiteSettings;
    menuNews: MenuNewsItem[];
    /** Admin only: a machine translator is configured, so the auto-translate option is offered. */
    autoTranslate: boolean;
    locale: 'id' | 'en';
    locales: Array<'id' | 'en'>;
    defaultLocale: 'id' | 'en';
    /** Absolute URL of the current public page in each locale (empty on admin pages). */
    alternates: Partial<Record<'id' | 'en', string>>;
};
