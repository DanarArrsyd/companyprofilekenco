import { Plus, Trash2 } from 'lucide-react';

import { LocaleBadge } from '@/components/admin/ContentLocaleTabs';
import { MediaPickerField } from '@/components/admin/MediaPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mediaUrl } from '@/lib/media';
import { englishOf, readText, writeText } from '@/lib/translatable-form';
import type { ContentLocale } from '@/lib/translatable-form';

type Content = Record<string, unknown>;

function TextArea({
    id,
    value,
    onChange,
    rows = 3,
    placeholder,
}: {
    id: string;
    value: string;
    onChange: (value: string) => void;
    rows?: number;
    placeholder?: string;
}) {
    return (
        <textarea
            id={id}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
    );
}

function str(content: Content, key: string): string {
    return typeof content[key] === 'string' ? (content[key] as string) : '';
}

export interface PickerOption {
    id: number;
    name: string;
}

export function SectionContentFields({
    sectionType,
    content,
    onChange,
    pickerOptions,
    locale = 'en',
}: {
    sectionType: string;
    content: Content;
    onChange: (content: Content) => void;
    pickerOptions?: { capabilities?: PickerOption[]; products?: PickerOption[]; facilities?: PickerOption[] };
    /** Active content tab: text fields edit that language; images, URLs and picks are shared. */
    locale?: ContentLocale;
}) {
    const set = (key: string, value: unknown) => onChange({ ...content, [key]: value });
    // Translatable text: {"en","id"} maps in content, English as the placeholder hint.
    const text = (key: string) => readText(content[key], locale);
    const setText = (key: string, value: string) => set(key, writeText(content[key], locale, value));
    const hint = (key: string) => (locale === 'en' ? undefined : englishOf(content[key]) || undefined);

    switch (sectionType) {
        case 'hero':
            return (
                <div className="space-y-5">
                    <div>
                        <Label htmlFor="eyebrow">Eyebrow<LocaleBadge locale={locale} /></Label>
                        <Input id="eyebrow" value={text('eyebrow')} placeholder={hint('eyebrow')} onChange={(e) => setText('eyebrow', e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                        <Label htmlFor="heading">Heading<LocaleBadge locale={locale} /></Label>
                        <Input id="heading" value={text('heading')} placeholder={hint('heading')} onChange={(e) => setText('heading', e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                        <Label htmlFor="description">Description<LocaleBadge locale={locale} /></Label>
                        <TextArea id="description" value={text('description')} placeholder={hint('description')} onChange={(v) => setText('description', v)} />
                    </div>
                    <MediaPickerField
                        label="Background image"
                        currentUrl={mediaUrl(str(content, 'image'))}
                        uploadToLibrary
                        onSelectPath={(path) => set('image', path)}
                        onClear={() => set('image', '')}
                    />
                    <div>
                        <Label htmlFor="highlight">Highlight statement<LocaleBadge locale={locale} /></Label>
                        <TextArea id="highlight" value={text('highlight')} placeholder={hint('highlight')} onChange={(v) => setText('highlight', v)} rows={2} />
                        <p className="mt-1.5 text-xs text-slate-500">Only used by page-intro heroes (e.g. the Company page) that show a second, shorter statement alongside the description.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="primary_cta_label">Primary CTA label<LocaleBadge locale={locale} /></Label>
                            <Input id="primary_cta_label" value={text('primary_cta_label')} placeholder={hint('primary_cta_label')} onChange={(e) => setText('primary_cta_label', e.target.value)} className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="primary_cta_url">Primary CTA URL</Label>
                            <Input id="primary_cta_url" value={str(content, 'primary_cta_url')} onChange={(e) => set('primary_cta_url', e.target.value)} className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="secondary_cta_label">Secondary CTA label<LocaleBadge locale={locale} /></Label>
                            <Input id="secondary_cta_label" value={text('secondary_cta_label')} placeholder={hint('secondary_cta_label')} onChange={(e) => setText('secondary_cta_label', e.target.value)} className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="secondary_cta_url">Secondary CTA URL</Label>
                            <Input id="secondary_cta_url" value={str(content, 'secondary_cta_url')} onChange={(e) => set('secondary_cta_url', e.target.value)} className="mt-1.5" />
                        </div>
                    </div>
                </div>
            );

        case 'company_intro':
            return (
                <div className="space-y-2">
                    <MediaPickerField
                        label="Supporting image"
                        currentUrl={mediaUrl(str(content, 'image'))}
                        uploadToLibrary
                        onSelectPath={(path) => set('image', path)}
                        onClear={() => set('image', '')}
                    />
                    <p className="mt-1.5 text-xs text-slate-500">Title/Subtitle above are used as the heading and body copy.</p>
                </div>
            );

        case 'text':
            return (
                <div className="space-y-5">
                    <div>
                        <Label htmlFor="body">Body<LocaleBadge locale={locale} /></Label>
                        <TextArea id="body" value={text('body')} placeholder={hint('body')} onChange={(v) => setText('body', v)} rows={6} />
                    </div>
                    <div>
                        <MediaPickerField
                            label="Section image"
                            currentUrl={mediaUrl(str(content, 'image'))}
                            uploadToLibrary
                            onSelectPath={(path) => set('image', path)}
                            onClear={() => set('image', '')}
                        />
                        <p className="mt-1.5 text-xs text-slate-500">Recommended ratio: 4:3.</p>
                    </div>
                </div>
            );

        case 'image_text':
            return (
                <div className="space-y-5">
                    <MediaPickerField
                        label="Image"
                        currentUrl={mediaUrl(str(content, 'image'))}
                        uploadToLibrary
                        onSelectPath={(path) => set('image', path)}
                        onClear={() => set('image', '')}
                    />
                    <div>
                        <Label htmlFor="body">Body<LocaleBadge locale={locale} /></Label>
                        <TextArea id="body" value={text('body')} placeholder={hint('body')} onChange={(v) => setText('body', v)} rows={5} />
                    </div>
                </div>
            );

        case 'vision_mission':
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-5 rounded-lg border border-border p-5">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Visi card</p>
                            <MediaPickerField
                                label="Background photo"
                                currentUrl={mediaUrl(str(content, 'left_image'))}
                                uploadToLibrary
                                onSelectPath={(path) => set('left_image', path)}
                                onClear={() => set('left_image', '')}
                            />
                            <div>
                                <Label htmlFor="visi_title">Title<LocaleBadge locale={locale} /></Label>
                                <Input id="visi_title" value={text('visi_title')} placeholder={hint('visi_title') ?? 'Vision'} onChange={(e) => setText('visi_title', e.target.value)} className="mt-1.5" />
                            </div>
                            <div>
                                <Label htmlFor="visi_text">Statement<LocaleBadge locale={locale} /></Label>
                                <TextArea id="visi_text" value={text('visi_text')} placeholder={hint('visi_text')} onChange={(v) => setText('visi_text', v)} rows={4} />
                            </div>
                        </div>

                        <div className="space-y-5 rounded-lg border border-border p-5">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Misi card</p>
                            <MediaPickerField
                                label="Background photo"
                                currentUrl={mediaUrl(str(content, 'right_image'))}
                                uploadToLibrary
                                onSelectPath={(path) => set('right_image', path)}
                                onClear={() => set('right_image', '')}
                            />
                            <div>
                                <Label htmlFor="misi_title">Title<LocaleBadge locale={locale} /></Label>
                                <Input id="misi_title" value={text('misi_title')} placeholder={hint('misi_title') ?? 'Mission'} onChange={(e) => setText('misi_title', e.target.value)} className="mt-1.5" />
                            </div>
                            <div>
                                <Label htmlFor="misi_text">Statement<LocaleBadge locale={locale} /></Label>
                                <TextArea id="misi_text" value={text('misi_text')} placeholder={hint('misi_text')} onChange={(v) => setText('misi_text', v)} rows={4} />
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'call_to_action':
        case 'quality':
        case 'career_cta':
        case 'contact_cta':
            return (
                <div className="space-y-5">
                    <div>
                        <Label htmlFor="heading">Heading<LocaleBadge locale={locale} /></Label>
                        <Input id="heading" value={text('heading')} placeholder={hint('heading')} onChange={(e) => setText('heading', e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                        <Label htmlFor="description">Description<LocaleBadge locale={locale} /></Label>
                        <TextArea id="description" value={text('description')} placeholder={hint('description')} onChange={(v) => setText('description', v)} />
                    </div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="cta_label">CTA label<LocaleBadge locale={locale} /></Label>
                            <Input id="cta_label" value={text('cta_label')} placeholder={hint('cta_label')} onChange={(e) => setText('cta_label', e.target.value)} className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="cta_url">CTA URL</Label>
                            <Input id="cta_url" value={str(content, 'cta_url')} onChange={(e) => set('cta_url', e.target.value)} className="mt-1.5" />
                        </div>
                    </div>
                </div>
            );

        case 'stats': {
            const items = Array.isArray(content.items) ? (content.items as { label: unknown; value: string }[]) : [];

            // The figure is shared; only the label is translated.
            const updateItem = (index: number, key: 'label' | 'value', value: string) => {
                const next = [...items];
                next[index] = { ...next[index], [key]: key === 'label' ? writeText(next[index].label, locale, value) : value };
                set('items', next);
            };

            return (
                <div className="space-y-3">
                    <Label>Statistic items<LocaleBadge locale={locale} /></Label>
                    {items.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                value={item.value ?? ''}
                                onChange={(e) => updateItem(index, 'value', e.target.value)}
                                placeholder="500+"
                                className="w-28"
                            />
                            <Input
                                value={readText(item.label, locale)}
                                onChange={(e) => updateItem(index, 'label', e.target.value)}
                                placeholder={locale === 'en' ? 'Projects Completed' : englishOf(item.label) || 'Projects Completed'}
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => set('items', items.filter((_, i) => i !== index))}
                                aria-label="Remove statistic"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => set('items', [...items, { label: '', value: '' }])}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add item
                    </Button>
                </div>
            );
        }

        case 'gallery': {
            const images = Array.isArray(content.images) ? (content.images as string[]) : [];

            return (
                <div className="space-y-3">
                    <Label>Gallery images</Label>
                    {images.map((image, index) => (
                        <div key={index} className="space-y-2">
                            <MediaPickerField
                                label={`Image ${index + 1}`}
                                currentUrl={mediaUrl(image)}
                                uploadToLibrary
                                onSelectPath={(path) => {
                                    const next = [...images];
                                    next[index] = path;
                                    set('images', next);
                                }}
                                onClear={() => set('images', images.filter((_, imageIndex) => imageIndex !== index))}
                            />
                            {!image && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => set('images', images.filter((_, imageIndex) => imageIndex !== index))}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Remove empty image
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button type="button" variant="secondary" size="sm" onClick={() => set('images', [...images, ''])}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add image
                    </Button>
                </div>
            );
        }

        case 'capabilities':
        case 'products':
        case 'facilities': {
            const options = {
                capabilities: pickerOptions?.capabilities,
                products: pickerOptions?.products,
                facilities: pickerOptions?.facilities,
            }[sectionType];
            const idsKey = { capabilities: 'capability_ids', products: 'product_ids', facilities: 'facility_ids' }[sectionType];
            const selected = Array.isArray(content[idsKey]) ? (content[idsKey] as number[]) : [];

            const toggle = (id: number) => {
                set(idsKey, selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id]);
            };

            return (
                <div className="space-y-5">
                    <div>
                        <Label htmlFor="heading">Heading<LocaleBadge locale={locale} /></Label>
                        <Input id="heading" value={text('heading')} placeholder={hint('heading')} onChange={(e) => setText('heading', e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                        <Label htmlFor="description">Description<LocaleBadge locale={locale} /></Label>
                        <TextArea id="description" value={text('description')} placeholder={hint('description')} onChange={(v) => setText('description', v)} />
                    </div>

                    <div>
                        <Label>Featured {sectionType}</Label>
                        {!options || options.length === 0 ? (
                            <p className="mt-2 rounded border border-dashed border-border p-4 text-sm text-slate-500">
                                No published {sectionType} available yet. Publish some, then come back to feature
                                them here.
                            </p>
                        ) : (
                            <div className="mt-2 space-y-1 rounded-lg border border-border p-4">
                                {options.map((option) => (
                                    <label key={option.id} className="flex items-center gap-2 text-sm text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(option.id)}
                                            onChange={() => toggle(option.id)}
                                            className="rounded border-border"
                                        />
                                        {option.name}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        case 'news':
            return (
                <p className="text-sm text-slate-500">
                    This section automatically shows the latest published articles. No manual content needed.
                </p>
            );

        default:
            return <p className="text-sm text-slate-500">No configurable fields for this section type.</p>;
    }
}
