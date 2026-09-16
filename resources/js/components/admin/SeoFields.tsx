import { MediaPickerField } from '@/components/admin/MediaPicker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface SeoFieldsData {
    meta_title: string;
    meta_description: string;
    canonical_url: string;
    og_title: string;
    og_description: string;
    og_image: File | null;
    og_image_path: string;
    robots_index: boolean;
    robots_follow: boolean;
}

export const SEO_FIELDS_DEFAULT: SeoFieldsData = {
    meta_title: '', meta_description: '', canonical_url: '',
    og_title: '', og_description: '', og_image: null, og_image_path: '',
    robots_index: true, robots_follow: true,
};

function robotsValue(data: SeoFieldsData): string {
    if (!data.robots_index) return data.robots_follow ? 'noindex,follow' : 'noindex,nofollow';
    return 'index,follow';
}

function applyRobotsValue(value: string): Pick<SeoFieldsData, 'robots_index' | 'robots_follow'> {
    switch (value) {
        case 'noindex,follow': return { robots_index: false, robots_follow: true };
        case 'noindex,nofollow': return { robots_index: false, robots_follow: false };
        default: return { robots_index: true, robots_follow: true };
    }
}

/**
 * Reusable admin SEO panel — one implementation shared by every entity form
 * (Product/Capability/Article/JobVacancy/Page) instead of copy-pasted meta
 * fields. Includes a lightweight SERP preview and soft character-count
 * guidance (never blocks save).
 */
export function SeoFields({
    data,
    onChange,
    errors = {},
    titleFallback,
    pageUrl,
}: {
    data: SeoFieldsData;
    onChange: (patch: Partial<SeoFieldsData>) => void;
    /** The form's raw Inertia errors object — read directly using "seo.*" dot-path keys, no per-page mapping needed. */
    errors?: Partial<Record<string, string>>;
    /** Entity name/title — used as the SERP preview's title when meta_title is empty. */
    titleFallback: string;
    /** Public URL this entity will resolve to — shown in the SERP preview and used as the canonical placeholder. */
    pageUrl: string;
}) {
    const previewTitle = data.meta_title || titleFallback;
    const previewDescription = data.meta_description || 'No meta description set — a site default will be used.';

    return (
        <div className="space-y-6">
            <div className="border border-border bg-muted/40 p-4">
                <p className="text-xs font-medium uppercase text-muted-foreground">Search Preview</p>
                <p className="mt-2 truncate text-sm text-navy-700">{pageUrl}</p>
                <p className="mt-0.5 truncate text-base text-blue-800">{previewTitle}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{previewDescription}</p>
            </div>

            <div>
                <Label htmlFor="meta_title">Meta title</Label>
                <Input id="meta_title" value={data.meta_title} onChange={(e) => onChange({ meta_title: e.target.value })} className="mt-1.5" />
                <p className="mt-1 text-xs text-slate-500">{data.meta_title.length}/60 characters recommended.</p>
                {errors['seo.meta_title'] && <p className="mt-1 text-sm text-danger">{errors['seo.meta_title']}</p>}
            </div>

            <div>
                <Label htmlFor="meta_description">Meta description</Label>
                <textarea id="meta_description" value={data.meta_description} onChange={(e) => onChange({ meta_description: e.target.value })} rows={3} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                <p className="mt-1 text-xs text-slate-500">{data.meta_description.length}/160 characters recommended.</p>
                {errors['seo.meta_description'] && <p className="mt-1 text-sm text-danger">{errors['seo.meta_description']}</p>}
            </div>

            <div>
                <Label htmlFor="canonical_url">Canonical URL override</Label>
                <Input id="canonical_url" value={data.canonical_url} onChange={(e) => onChange({ canonical_url: e.target.value })} className="mt-1.5" placeholder={pageUrl} />
                <p className="mt-1 text-xs text-slate-500">Leave blank to use the page's own URL.</p>
                {errors['seo.canonical_url'] && <p className="mt-1 text-sm text-danger">{errors['seo.canonical_url']}</p>}
            </div>

            <div>
                <Label htmlFor="robots">Robots</Label>
                <select
                    id="robots"
                    value={robotsValue(data)}
                    onChange={(e) => onChange(applyRobotsValue(e.target.value))}
                    className="mt-1.5 h-11 w-full rounded border border-border bg-surface px-3 text-sm"
                >
                    <option value="index,follow">index, follow (default)</option>
                    <option value="noindex,follow">noindex, follow</option>
                    <option value="noindex,nofollow">noindex, nofollow</option>
                </select>
            </div>

            <div>
                <Label htmlFor="og_title">OG title</Label>
                <Input id="og_title" value={data.og_title} onChange={(e) => onChange({ og_title: e.target.value })} className="mt-1.5" placeholder={previewTitle} />
            </div>

            <div>
                <Label htmlFor="og_description">OG description</Label>
                <Input id="og_description" value={data.og_description} onChange={(e) => onChange({ og_description: e.target.value })} className="mt-1.5" placeholder={previewDescription} />
            </div>

            <MediaPickerField
                label="OG image"
                currentUrl={data.og_image ? URL.createObjectURL(data.og_image) : (data.og_image_path ? `/storage/${data.og_image_path}` : null)}
                onUploadFile={(file) => onChange({ og_image: file, og_image_path: '' })}
                onSelectPath={(path) => onChange({ og_image_path: path, og_image: null })}
                onClear={() => onChange({ og_image: null, og_image_path: '' })}
                error={errors['seo.og_image']}
            />
            <p className="-mt-4 text-xs text-slate-500">Falls back to the site default OG image (Settings → SEO) when left empty. Also used for Twitter/X sharing.</p>
        </div>
    );
}
