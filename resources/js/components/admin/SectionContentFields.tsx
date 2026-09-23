import { Plus, Trash2 } from 'lucide-react';

import { MediaPickerField } from '@/components/admin/MediaPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mediaUrl } from '@/lib/media';

type Content = Record<string, unknown>;

function TextArea({
    id,
    value,
    onChange,
    rows = 3,
}: {
    id: string;
    value: string;
    onChange: (value: string) => void;
    rows?: number;
}) {
    return (
        <textarea
            id={id}
            value={value}
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
}: {
    sectionType: string;
    content: Content;
    onChange: (content: Content) => void;
    pickerOptions?: { capabilities?: PickerOption[]; products?: PickerOption[]; facilities?: PickerOption[] };
}) {
    const set = (key: string, value: unknown) => onChange({ ...content, [key]: value });

    switch (sectionType) {
        case 'hero':
            return (
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="eyebrow">Eyebrow</Label>
                        <Input id="eyebrow" value={str(content, 'eyebrow')} onChange={(e) => set('eyebrow', e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                        <Label htmlFor="heading">Heading</Label>
                        <Input id="heading" value={str(content, 'heading')} onChange={(e) => set('heading', e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <TextArea id="description" value={str(content, 'description')} onChange={(v) => set('description', v)} />
                    </div>
                    <MediaPickerField
                        label="Background image"
                        currentUrl={mediaUrl(str(content, 'image'))}
                        uploadToLibrary
                        onSelectPath={(path) => set('image', path)}
                        onClear={() => set('image', '')}
                    />
                    <div>
                        <Label htmlFor="highlight">Highlight statement</Label>
                        <TextArea id="highlight" value={str(content, 'highlight')} onChange={(v) => set('highlight', v)} rows={2} />
                        <p className="mt-1.5 text-xs text-slate-500">Only used by page-intro heroes (e.g. the Company page) that show a second, shorter statement alongside the description.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="primary_cta_label">Primary CTA label</Label>
                            <Input id="primary_cta_label" value={str(content, 'primary_cta_label')} onChange={(e) => set('primary_cta_label', e.target.value)} className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="primary_cta_url">Primary CTA URL</Label>
                            <Input id="primary_cta_url" value={str(content, 'primary_cta_url')} onChange={(e) => set('primary_cta_url', e.target.value)} className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="secondary_cta_label">Secondary CTA label</Label>
                            <Input id="secondary_cta_label" value={str(content, 'secondary_cta_label')} onChange={(e) => set('secondary_cta_label', e.target.value)} className="mt-1.5" />
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
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="body">Body</Label>
                        <TextArea id="body" value={str(content, 'body')} onChange={(v) => set('body', v)} rows={6} />
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
                <div className="space-y-4">
                    <MediaPickerField
                        label="Image"
                        currentUrl={mediaUrl(str(content, 'image'))}
                        uploadToLibrary
                        onSelectPath={(path) => set('image', path)}
                        onClear={() => set('image', '')}
                    />
                    <div>
                        <Label htmlFor="body">Body</Label>
                        <TextArea id="body" value={str(content, 'body')} onChange={(v) => set('body', v)} rows={5} />
                    </div>
                </div>
            );

        case 'vision_mission':
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-4 rounded border border-border p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Visi card</p>
                            <MediaPickerField
                                label="Background photo"
                                currentUrl={mediaUrl(str(content, 'left_image'))}
                                uploadToLibrary
                                onSelectPath={(path) => set('left_image', path)}
                                onClear={() => set('left_image', '')}
                            />
                            <div>
                                <Label htmlFor="visi_title">Title</Label>
                                <Input id="visi_title" value={str(content, 'visi_title') || 'Visi'} onChange={(e) => set('visi_title', e.target.value)} className="mt-1.5" />
                            </div>
                            <div>
                                <Label htmlFor="visi_text">Statement</Label>
                                <TextArea id="visi_text" value={str(content, 'visi_text')} onChange={(v) => set('visi_text', v)} rows={4} />
                            </div>
                        </div>

                        <div className="space-y-4 rounded border border-border p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Misi card</p>
                            <MediaPickerField
                                label="Background photo"
                                currentUrl={mediaUrl(str(content, 'right_image'))}
                                uploadToLibrary
                                onSelectPath={(path) => set('right_image', path)}
                                onClear={() => set('right_image', '')}
                            />
                            <div>
                                <Label htmlFor="misi_title">Title</Label>
                                <Input id="misi_title" value={str(content, 'misi_title') || 'Misi'} onChange={(e) => set('misi_title', e.target.value)} className="mt-1.5" />
                            </div>
                            <div>
                                <Label htmlFor="misi_text">Statement</Label>
                                <TextArea id="misi_text" value={str(content, 'misi_text')} onChange={(v) => set('misi_text', v)} rows={4} />
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
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="heading">Heading</Label>
                        <Input id="heading" value={str(content, 'heading')} onChange={(e) => set('heading', e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <TextArea id="description" value={str(content, 'description')} onChange={(v) => set('description', v)} />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="cta_label">CTA label</Label>
                            <Input id="cta_label" value={str(content, 'cta_label')} onChange={(e) => set('cta_label', e.target.value)} className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="cta_url">CTA URL</Label>
                            <Input id="cta_url" value={str(content, 'cta_url')} onChange={(e) => set('cta_url', e.target.value)} className="mt-1.5" />
                        </div>
                    </div>
                </div>
            );

        case 'stats': {
            const items = Array.isArray(content.items) ? (content.items as { label: string; value: string }[]) : [];

            const updateItem = (index: number, key: 'label' | 'value', value: string) => {
                const next = [...items];
                next[index] = { ...next[index], [key]: value };
                set('items', next);
            };

            return (
                <div className="space-y-3">
                    <Label>Statistic items</Label>
                    {items.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                value={item.value ?? ''}
                                onChange={(e) => updateItem(index, 'value', e.target.value)}
                                placeholder="500+"
                                className="w-28"
                            />
                            <Input
                                value={item.label ?? ''}
                                onChange={(e) => updateItem(index, 'label', e.target.value)}
                                placeholder="Projects Completed"
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
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="heading">Heading</Label>
                        <Input id="heading" value={str(content, 'heading')} onChange={(e) => set('heading', e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <TextArea id="description" value={str(content, 'description')} onChange={(v) => set('description', v)} />
                    </div>

                    <div>
                        <Label>Featured {sectionType}</Label>
                        {!options || options.length === 0 ? (
                            <p className="mt-2 rounded border border-dashed border-border p-4 text-sm text-slate-500">
                                No published {sectionType} available yet. Publish some, then come back to feature
                                them here.
                            </p>
                        ) : (
                            <div className="mt-2 space-y-1 rounded border border-border p-3">
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
