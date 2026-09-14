import { Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { PageSection } from '@/types/cms';

interface CtaContent {
    heading?: string;
    description?: string;
    cta_label?: string;
    cta_url?: string;
}

interface HeroContent {
    eyebrow?: string;
    heading?: string;
    description?: string;
    image?: string;
    primary_cta_label?: string;
    primary_cta_url?: string;
    secondary_cta_label?: string;
    secondary_cta_url?: string;
}

interface StatsContent {
    items?: { label: string; value: string }[];
}

interface RelatedItem {
    id: number;
    name: string;
    slug: string;
    summary?: string | null;
    short_description?: string | null;
}

interface PickerContent {
    heading?: string;
    description?: string;
    items?: RelatedItem[];
}

function Cta({ label, url }: { label?: string; url?: string }) {
    if (!label || !url) return null;

    return (
        <Button asChild>
            <a href={url}>{label}</a>
        </Button>
    );
}

export function SectionRenderer({ section }: { section: PageSection }) {
    const content = section.content ?? {};

    switch (section.section_type) {
        case 'hero': {
            const c = content as HeroContent;
            return (
                <section className="border-b border-border bg-surface">
                    <div className="mx-auto max-w-content px-5 py-24 sm:px-6 lg:px-8 lg:py-32">
                        {c.eyebrow && (
                            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                                {c.eyebrow}
                            </p>
                        )}
                        <h1 className="mt-4 max-w-3xl text-h1 text-navy-900">
                            {c.heading ?? section.title}
                        </h1>
                        {c.description && (
                            <p className="mt-6 max-w-2xl text-lg text-slate-700">{c.description}</p>
                        )}
                        <div className="mt-10 flex flex-wrap gap-4">
                            <Cta label={c.primary_cta_label} url={c.primary_cta_url} />
                            {c.secondary_cta_label && c.secondary_cta_url && (
                                <Button asChild variant="secondary">
                                    <a href={c.secondary_cta_url}>{c.secondary_cta_label}</a>
                                </Button>
                            )}
                        </div>
                    </div>
                </section>
            );
        }

        case 'company_intro':
        case 'text': {
            const body = (content as { body?: string }).body;
            return (
                <section className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8">
                    {section.title && <h2 className="text-h2 text-navy-900">{section.title}</h2>}
                    {(section.subtitle || body) && (
                        <p className="mt-4 max-w-2xl text-slate-700">{section.subtitle ?? body}</p>
                    )}
                </section>
            );
        }

        case 'image_text': {
            const c = content as { image?: string; body?: string };
            return (
                <section className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
                        <div>
                            {section.title && <h2 className="text-h2 text-navy-900">{section.title}</h2>}
                            {(section.subtitle || c.body) && (
                                <p className="mt-4 text-slate-700">{section.subtitle ?? c.body}</p>
                            )}
                        </div>
                        {c.image ? (
                            <img src={c.image} alt={section.title ?? ''} className="w-full rounded" />
                        ) : (
                            <div className="flex h-64 items-center justify-center rounded border border-dashed border-border text-sm text-muted-foreground">
                                No image set
                            </div>
                        )}
                    </div>
                </section>
            );
        }

        case 'stats': {
            const c = content as StatsContent;
            const items = c.items ?? [];
            return (
                <section className="border-y border-border bg-navy-900">
                    <div className="mx-auto max-w-content px-5 py-16 sm:px-6 lg:px-8">
                        {items.length === 0 ? (
                            <p className="text-center text-sm text-slate-500">Statistics coming soon.</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                                {items.map((item, index) => (
                                    <div key={index}>
                                        <p className="text-3xl font-semibold text-white">{item.value}</p>
                                        <p className="mt-1 text-sm text-slate-500">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            );
        }

        case 'capabilities':
        case 'products': {
            const c = content as PickerContent;
            const items = c.items ?? [];
            return (
                <section className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8">
                    {(c.heading || section.title) && (
                        <h2 className="text-h2 text-navy-900">{c.heading ?? section.title}</h2>
                    )}
                    {(c.description || section.subtitle) && (
                        <p className="mt-4 max-w-2xl text-slate-700">{c.description ?? section.subtitle}</p>
                    )}

                    {items.length === 0 ? (
                        <p className="mt-8 text-sm text-slate-500">Content coming soon.</p>
                    ) : (
                        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {items.map((item) => (
                                <div key={item.id} className="rounded border border-border bg-surface p-5">
                                    <p className="font-medium text-foreground">{item.name}</p>
                                    {(item.summary || item.short_description) && (
                                        <p className="mt-2 text-sm text-slate-500">
                                            {item.summary ?? item.short_description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            );
        }

        case 'facilities': {
            const c = content as { heading?: string; description?: string; items?: { title: string; description?: string }[] };
            const items = c.items ?? [];
            return (
                <section className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8">
                    {(c.heading || section.title) && <h2 className="text-h2 text-navy-900">{c.heading ?? section.title}</h2>}
                    {(c.description || section.subtitle) && (
                        <p className="mt-4 max-w-2xl text-slate-700">{c.description ?? section.subtitle}</p>
                    )}
                    {items.length === 0 ? (
                        <p className="mt-8 text-sm text-slate-500">Facility highlights coming soon.</p>
                    ) : (
                        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                            {items.map((item, index) => (
                                <div key={index} className="rounded border border-border bg-surface p-5">
                                    <p className="font-medium text-foreground">{item.title}</p>
                                    {item.description && <p className="mt-2 text-sm text-slate-500">{item.description}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            );
        }

        case 'quality':
        case 'call_to_action':
        case 'career_cta':
        case 'contact_cta': {
            const c = content as CtaContent;
            return (
                <section className="border-t border-border bg-muted">
                    <div className="mx-auto max-w-content px-5 py-16 text-center sm:px-6 lg:px-8">
                        <h2 className="text-h3 text-navy-900">{c.heading ?? section.title}</h2>
                        {(c.description || section.subtitle) && (
                            <p className="mx-auto mt-3 max-w-xl text-slate-700">{c.description ?? section.subtitle}</p>
                        )}
                        <div className="mt-6 flex justify-center">
                            <Cta label={c.cta_label} url={c.cta_url} />
                        </div>
                    </div>
                </section>
            );
        }

        case 'gallery': {
            const images = (content as { images?: string[] }).images ?? [];
            return (
                <section className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8">
                    {section.title && <h2 className="text-h2 text-navy-900">{section.title}</h2>}
                    {images.length === 0 ? (
                        <p className="mt-4 text-sm text-slate-500">Gallery coming soon.</p>
                    ) : (
                        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {images.map((src, index) => (
                                <img key={index} src={src} alt="" className="aspect-square w-full rounded object-cover" />
                            ))}
                        </div>
                    )}
                </section>
            );
        }

        default:
            return null;
    }
}

export function NewsPreview({ articles }: { articles: { id: number; title: string; slug: string; excerpt: string | null }[] }) {
    if (articles.length === 0) {
        return (
            <section className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8">
                <h2 className="text-h2 text-navy-900">Latest News</h2>
                <p className="mt-4 text-sm text-slate-500">No articles published yet.</p>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8">
            <h2 className="text-h2 text-navy-900">Latest News</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                {articles.map((article) => (
                    <Link
                        key={article.id}
                        href={`/news/${article.slug}`}
                        className="block rounded border border-border bg-surface p-5 hover:border-navy-700"
                    >
                        <p className="font-medium text-foreground">{article.title}</p>
                        {article.excerpt && <p className="mt-2 text-sm text-slate-500">{article.excerpt}</p>}
                    </Link>
                ))}
            </div>
        </section>
    );
}
