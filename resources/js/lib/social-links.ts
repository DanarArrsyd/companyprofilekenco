/**
 * Social links (Settings → Social Media): an ordered list the admin can grow.
 * Each known platform has its official mark (BrandIcon) and brand colour;
 * `other` is any site, named by its label. Keep the ids in sync with
 * UpdateSettingsRequest::SOCIAL_PLATFORMS (tests/js/social-links.test.ts).
 */
export const SOCIAL_PLATFORMS = ['linkedin', 'instagram', 'youtube', 'facebook', 'tiktok', 'x', 'whatsapp', 'threads', 'other'] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export interface SocialLink {
    platform: SocialPlatform;
    url: string;
    /** Only for `other`. */
    label: string | null;
}

export const SOCIAL_PLATFORM_INFO: Record<SocialPlatform, { name: string; example: string; hover: string }> = {
    linkedin: { name: 'LinkedIn', example: 'https://www.linkedin.com/company/…', hover: 'hover:bg-brand-linkedin focus-visible:bg-brand-linkedin' },
    instagram: { name: 'Instagram', example: 'https://www.instagram.com/…', hover: 'hover:bg-brand-instagram focus-visible:bg-brand-instagram' },
    youtube: { name: 'YouTube', example: 'https://www.youtube.com/@…', hover: 'hover:bg-brand-youtube focus-visible:bg-brand-youtube' },
    facebook: { name: 'Facebook', example: 'https://www.facebook.com/…', hover: 'hover:bg-brand-facebook focus-visible:bg-brand-facebook' },
    tiktok: { name: 'TikTok', example: 'https://www.tiktok.com/@…', hover: 'hover:bg-brand-mono focus-visible:bg-brand-mono' },
    x: { name: 'X (Twitter)', example: 'https://x.com/…', hover: 'hover:bg-brand-mono focus-visible:bg-brand-mono' },
    whatsapp: { name: 'WhatsApp', example: 'https://wa.me/62812…', hover: 'hover:bg-brand-whatsapp focus-visible:bg-brand-whatsapp' },
    threads: { name: 'Threads', example: 'https://www.threads.net/@…', hover: 'hover:bg-brand-mono focus-visible:bg-brand-mono' },
    other: { name: 'Lainnya', example: 'https://…', hover: 'hover:bg-navy-700 focus-visible:bg-navy-700' },
};

/** Accessible name of a link: the platform, or the admin's label for `other`. */
export function socialLinkName(link: SocialLink): string {
    return link.platform === 'other' ? link.label || 'Link' : SOCIAL_PLATFORM_INFO[link.platform].name;
}
