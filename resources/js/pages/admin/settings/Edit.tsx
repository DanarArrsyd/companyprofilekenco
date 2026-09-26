import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle2, CircleOff, Languages } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { MediaPickerField } from '@/components/admin/MediaPicker';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';
import { mediaUrl } from '@/lib/media';
import { FieldHint } from '@/components/admin/FieldHint';
import { fieldHelp } from '@/lib/admin-field-help';

interface Settings {
    company_name: string | null; legal_name: string | null; tagline: string | null; company_description: string | null;
    logo: string | null; favicon: string | null;
    address: string | null; phone: string | null; email: string | null; operating_hours: string | null; map_embed_url: string | null;
    social_linkedin: string | null; social_youtube: string | null; social_instagram: string | null;
    seo_default_meta_title: string | null; seo_default_meta_description: string | null; seo_default_og_image: string | null;
    seo_title_separator: string | null; seo_default_robots: string | null;
    seo_twitter_card_type: string | null; seo_twitter_username: string | null;
    maintenance_mode: boolean;
}

const TABS = ['General', 'Branding', 'Contact', 'Social Media', 'SEO Defaults', 'System'] as const;
type Tab = (typeof TABS)[number];

/** `?tab=System` (e.g. from the auto-translate status link) opens that tab. */
function initialTab(): Tab {
    const requested = new URLSearchParams(window.location.search).get('tab');

    return TABS.find((name) => name === requested) ?? 'General';
}

export default function Edit({ settings, translator }: { settings: Settings; translator: { configured: boolean; region: string | null } }) {
    const [tab, setTab] = useState<Tab>(initialTab);
    const [testingTranslator, setTestingTranslator] = useState(false);
    const faviconInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm<{
        _method: string;
        company_name: string; legal_name: string; tagline: string; company_description: string;
        logo: File | null; logo_path: string; favicon: File | null;
        address: string; phone: string; email: string; operating_hours: string; map_embed_url: string;
        social_linkedin: string; social_youtube: string; social_instagram: string;
        seo_default_meta_title: string; seo_default_meta_description: string; seo_default_og_image: File | null; seo_default_og_image_path: string;
        seo_title_separator: string; seo_default_robots: string;
        seo_twitter_card_type: string; seo_twitter_username: string;
        maintenance_mode: boolean;
    }>({
        _method: 'put',
        company_name: settings.company_name ?? '',
        legal_name: settings.legal_name ?? '',
        tagline: settings.tagline ?? '',
        company_description: settings.company_description ?? '',
        logo: null,
        logo_path: settings.logo ?? '',
        favicon: null,
        address: settings.address ?? '',
        phone: settings.phone ?? '',
        email: settings.email ?? '',
        operating_hours: settings.operating_hours ?? '',
        map_embed_url: settings.map_embed_url ?? '',
        social_linkedin: settings.social_linkedin ?? '',
        social_youtube: settings.social_youtube ?? '',
        social_instagram: settings.social_instagram ?? '',
        seo_default_meta_title: settings.seo_default_meta_title ?? '',
        seo_default_meta_description: settings.seo_default_meta_description ?? '',
        seo_default_og_image: null,
        seo_default_og_image_path: settings.seo_default_og_image ?? '',
        seo_title_separator: settings.seo_title_separator ?? '|',
        seo_default_robots: settings.seo_default_robots ?? 'index,follow',
        seo_twitter_card_type: settings.seo_twitter_card_type ?? 'summary_large_image',
        seo_twitter_username: settings.seo_twitter_username ?? '',
        maintenance_mode: settings.maintenance_mode,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), { forceFormData: true, preserveScroll: true });
    };

    return (
        <AdminLayout>
            <Head title="Website Settings" />
            <PageHeader title="Website Settings" description="Global site configuration used across the public website." />

            <div className="mb-6 flex flex-wrap gap-2 border-b border-border">
                {TABS.map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setTab(t)}
                        className={`px-3 py-2 text-sm font-medium ${tab === t ? 'border-b-2 border-navy-900 text-navy-900' : 'text-slate-500 hover:text-foreground'}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <form onSubmit={submit} className="rounded-lg border border-border bg-surface px-6 sm:px-8">
                {tab === 'General' && (
                    <FormSection title="General">
                        <div>
                            <Label htmlFor="company_name">Company Name</Label>
                            <Input id="company_name" placeholder={fieldHelp('settings', 'company_name').example} value={data.company_name} onChange={(e) => setData('company_name', e.target.value)} className="mt-1.5" />
                            {errors.company_name && <p className="mt-1 text-sm text-danger">{errors.company_name}</p>}
                        </div>
                        <div>
                            <Label htmlFor="legal_name">Legal Name</Label>
                            <Input id="legal_name" aria-describedby="legal_name-help" placeholder={fieldHelp('settings', 'legal_name').example} value={data.legal_name} onChange={(e) => setData('legal_name', e.target.value)} className="mt-1.5" />
                            <FieldHint id="legal_name-help">{fieldHelp('settings', 'legal_name').hint}</FieldHint>
                        </div>
                        <div>
                            <Label htmlFor="tagline">Tagline</Label>
                            <Input id="tagline" placeholder={fieldHelp('settings', 'tagline').example} value={data.tagline} onChange={(e) => setData('tagline', e.target.value)} className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="company_description">Company Description</Label>
                            <textarea id="company_description" value={data.company_description} onChange={(e) => setData('company_description', e.target.value)} rows={4} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                        </div>
                    </FormSection>
                )}

                {tab === 'Branding' && (
                    <FormSection title="Branding">
                        <MediaPickerField
                            label="Company Logo"
                            maxSizeMb={2}
                            currentFile={data.logo}
                            currentUrl={mediaUrl(data.logo_path)}
                            onUploadFile={(file) => { setData('logo', file); setData('logo_path', ''); }}
                            onSelectPath={(path) => { setData('logo_path', path); setData('logo', null); }}
                            onClear={() => { setData('logo', null); setData('logo_path', ''); }}
                            error={errors.logo ?? errors.logo_path}
                        />
                        <div>
                            {settings.favicon && <img src={mediaUrl(settings.favicon) ?? ''} alt="Current favicon" className="mb-3 h-10 w-10 rounded border border-border object-contain" />}
                            <Label htmlFor="favicon">Favicon</Label>
                            <input ref={faviconInputRef} id="favicon" type="file" accept="image/jpeg,image/png,image/webp,image/x-icon,.ico" disabled={processing} onChange={(e) => setData('favicon', e.target.files?.[0] ?? null)} className="mt-1.5 block w-full text-sm" />
                            <p className="mt-1 text-xs text-slate-500">ICO, JPG, PNG, or WebP. Maximum 512 KB.</p>
                            {data.favicon && (
                                <div className="mt-2 flex items-center justify-between gap-3 rounded border border-border bg-muted/40 px-3 py-2 text-sm">
                                    <span className="truncate text-foreground">Selected: {data.favicon.name}</span>
                                    <Button type="button" size="sm" variant="ghost" onClick={() => { setData('favicon', null); if (faviconInputRef.current) faviconInputRef.current.value = ''; }}>Clear</Button>
                                </div>
                            )}
                            {errors.favicon && <p className="mt-1 text-sm text-danger">{errors.favicon}</p>}
                        </div>
                    </FormSection>
                )}

                {tab === 'Contact' && (
                    <FormSection title="Contact">
                        <div>
                            <Label htmlFor="address">Address</Label>
                            <textarea id="address" aria-describedby="address-help" value={data.address} onChange={(e) => setData('address', e.target.value)} rows={3} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                            <FieldHint id="address-help">{fieldHelp('settings', 'address').hint}</FieldHint>
                        </div>
                        <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" aria-describedby="phone-help" placeholder={fieldHelp('settings', 'phone').example} value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="mt-1.5" />
                            <FieldHint id="phone-help">{fieldHelp('settings', 'phone').hint}</FieldHint>
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" placeholder={fieldHelp('settings', 'email').example} type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="mt-1.5" />
                            {errors.email && <p className="mt-1 text-sm text-danger">{errors.email}</p>}
                        </div>
                        <div>
                            <Label htmlFor="operating_hours">Operating Hours</Label>
                            <Input id="operating_hours" value={data.operating_hours} onChange={(e) => setData('operating_hours', e.target.value)} className="mt-1.5" placeholder="Mon–Fri, 08:00–17:00" />
                        </div>
                        <div>
                            <Label htmlFor="map_embed_url">Map Embed URL</Label>
                            <Input id="map_embed_url" aria-describedby="map_embed_url-help" placeholder={fieldHelp('settings', 'map_embed_url').example} value={data.map_embed_url} onChange={(e) => setData('map_embed_url', e.target.value)} className="mt-1.5" />
                            <FieldHint id="map_embed_url-help">{fieldHelp('settings', 'map_embed_url').hint}</FieldHint>
                            {errors.map_embed_url && <p className="mt-1 text-sm text-danger">{errors.map_embed_url}</p>}
                        </div>
                    </FormSection>
                )}

                {tab === 'Social Media' && (
                    <FormSection title="Social Media">
                        <div>
                            <Label htmlFor="social_linkedin">LinkedIn</Label>
                            <Input id="social_linkedin" placeholder={fieldHelp('settings', 'social_linkedin').example} value={data.social_linkedin} onChange={(e) => setData('social_linkedin', e.target.value)} className="mt-1.5" />
                            {errors.social_linkedin && <p className="mt-1 text-sm text-danger">{errors.social_linkedin}</p>}
                        </div>
                        <div>
                            <Label htmlFor="social_youtube">YouTube</Label>
                            <Input id="social_youtube" placeholder={fieldHelp('settings', 'social_youtube').example} value={data.social_youtube} onChange={(e) => setData('social_youtube', e.target.value)} className="mt-1.5" />
                            {errors.social_youtube && <p className="mt-1 text-sm text-danger">{errors.social_youtube}</p>}
                        </div>
                        <div>
                            <Label htmlFor="social_instagram">Instagram</Label>
                            <Input id="social_instagram" placeholder={fieldHelp('settings', 'social_instagram').example} value={data.social_instagram} onChange={(e) => setData('social_instagram', e.target.value)} className="mt-1.5" />
                            {errors.social_instagram && <p className="mt-1 text-sm text-danger">{errors.social_instagram}</p>}
                        </div>
                    </FormSection>
                )}

                {tab === 'SEO Defaults' && (
                    <FormSection title="SEO Defaults" description="Used as the fallback when a page has no custom SEO set.">
                        <div>
                            <Label htmlFor="seo_default_meta_title">Default Meta Title</Label>
                            <Input id="seo_default_meta_title" value={data.seo_default_meta_title} onChange={(e) => setData('seo_default_meta_title', e.target.value)} className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="seo_default_meta_description">Default Meta Description</Label>
                            <textarea id="seo_default_meta_description" value={data.seo_default_meta_description} onChange={(e) => setData('seo_default_meta_description', e.target.value)} rows={3} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                        </div>
                        <MediaPickerField
                            label="Default OG Image"
                            maxSizeMb={2}
                            currentFile={data.seo_default_og_image}
                            currentUrl={mediaUrl(data.seo_default_og_image_path)}
                            onUploadFile={(file) => { setData('seo_default_og_image', file); setData('seo_default_og_image_path', ''); }}
                            onSelectPath={(path) => { setData('seo_default_og_image_path', path); setData('seo_default_og_image', null); }}
                            onClear={() => { setData('seo_default_og_image', null); setData('seo_default_og_image_path', ''); }}
                            error={errors.seo_default_og_image ?? errors.seo_default_og_image_path}
                        />
                        <div>
                            <Label htmlFor="seo_title_separator">Title Separator</Label>
                            <Input id="seo_title_separator" value={data.seo_title_separator} onChange={(e) => setData('seo_title_separator', e.target.value)} className="mt-1.5 max-w-[6rem]" />
                            <p className="mt-1 text-xs text-slate-500">Used as "Page Title {data.seo_title_separator || '|'} {'{Company Name}'}".</p>
                        </div>
                        <div>
                            <Label htmlFor="seo_default_robots">Default Robots</Label>
                            <select id="seo_default_robots" value={data.seo_default_robots} onChange={(e) => setData('seo_default_robots', e.target.value)} className="mt-1.5 h-11 w-full rounded border border-border bg-surface px-3 text-sm">
                                <option value="index,follow">index, follow</option>
                                <option value="noindex,follow">noindex, follow</option>
                                <option value="noindex,nofollow">noindex, nofollow</option>
                            </select>
                            <p className="mt-1 text-xs text-slate-500">Applies to pages without their own SEO override.</p>
                        </div>
                        <div>
                            <Label htmlFor="seo_twitter_card_type">Twitter/X Card Type</Label>
                            <select id="seo_twitter_card_type" value={data.seo_twitter_card_type} onChange={(e) => setData('seo_twitter_card_type', e.target.value)} className="mt-1.5 h-11 w-full rounded border border-border bg-surface px-3 text-sm">
                                <option value="summary_large_image">summary_large_image</option>
                                <option value="summary">summary</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="seo_twitter_username">Twitter/X Username</Label>
                            <Input id="seo_twitter_username" value={data.seo_twitter_username} onChange={(e) => setData('seo_twitter_username', e.target.value)} className="mt-1.5" placeholder="@kencomfg" />
                        </div>
                    </FormSection>
                )}

                {tab === 'System' && (
                    <>
                        <FormSection title="System">
                            <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input type="checkbox" checked={data.maintenance_mode} onChange={(e) => setData('maintenance_mode', e.target.checked)} className="rounded border-border" />
                                Maintenance mode
                            </label>
                        </FormSection>

                        <FormSection
                            title="Machine translation"
                            description="Azure Translator fills the other language when content is saved with auto-translate on. The key and region live in the server .env; deploy after changing them."
                        >
                            <div className="flex flex-wrap items-center gap-3">
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${translator.configured ? 'bg-success/10 text-success' : 'bg-muted text-slate-700'}`}>
                                    {translator.configured ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <CircleOff className="h-3.5 w-3.5" aria-hidden="true" />}
                                    {translator.configured ? 'Key configured' : 'Not configured'}
                                </span>
                                <span className="text-sm text-slate-700">
                                    Region: <span className="font-medium text-foreground">{translator.region || 'not set (global resource)'}</span>
                                </span>
                            </div>
                            <div>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    disabled={testingTranslator}
                                    onClick={() => router.post(route('admin.settings.translator-test'), {}, {
                                        preserveScroll: true,
                                        preserveState: true,
                                        onStart: () => setTestingTranslator(true),
                                        onFinish: () => setTestingTranslator(false),
                                    })}
                                >
                                    <Languages className="mr-2 h-4 w-4" aria-hidden="true" />
                                    {testingTranslator ? 'Testing…' : 'Test connection'}
                                </Button>
                                <FieldHint>Translates a sample sentence into Bahasa Indonesia and shows the result or Azure&apos;s reason for refusing.</FieldHint>
                            </div>
                        </FormSection>
                    </>
                )}

                <FormActions>
                    <Button type="submit" disabled={processing}>{processing ? 'Saving…' : 'Save Settings'}</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
