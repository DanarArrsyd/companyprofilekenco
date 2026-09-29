import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import { ContentLocaleTabs, LocaleBadge } from '@/components/admin/ContentLocaleTabs';
import { EditCard } from '@/components/admin/edit/EditCard';
import { EditPageLayout } from '@/components/admin/edit/EditPageLayout';
import { PublishPanel } from '@/components/admin/edit/PublishPanel';
import { WebsitePanel } from '@/components/admin/edit/WebsitePanel';
import { FieldHint } from '@/components/admin/FieldHint';
import { MediaPickerField } from '@/components/admin/MediaPicker';
import { SEO_FIELDS_DEFAULT, SeoFields, SeoFieldsData, seoTranslations } from '@/components/admin/SeoFields';
import { SlugField } from '@/components/admin/SlugField';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUnsavedChangesWarning } from '@/hooks/use-unsaved-changes-warning';
import AdminLayout from '@/layouts/AdminLayout';
import { fieldHelp } from '@/lib/admin-field-help';
import { countTranslated, initialTranslations, translatableBinder, translatableError, type ContentLocale, type TranslationValues } from '@/lib/translatable-form';
import { cn } from '@/lib/utils';

interface Step {
    id: number;
    title: string;
    description: string | null;
    sort_order: number;
    translations?: { id?: Record<string, string | null> } | null;
}

interface Capability {
    id: number; name: string; slug: string; summary: string | null; description: string | null;
    icon: string | null; featured_image: string | null; is_featured: boolean; sort_order: number;
    status: string; published_at: string | null;
    steps: Step[];
    machines: { id: number; name: string }[];
    seo_metadata: {
        meta_title: string | null; meta_description: string | null; canonical_url: string | null;
        og_title: string | null; og_description: string | null; og_image: string | null;
        robots_index: boolean; robots_follow: boolean;
    } | null;
}

/** A process step as the form holds it; `key` only identifies the row on screen. */
interface StepRow {
    key: string;
    id: number | null;
    title: string;
    description: string;
    translations: { id: { title: string; description: string } };
}

const TRANSLATABLE_FIELDS = ['name', 'summary', 'description'];

let newStepCounter = 0;

function stepRow(step: Step): StepRow {
    return {
        key: `step-${step.id}`,
        id: step.id,
        title: step.title,
        description: step.description ?? '',
        translations: { id: { title: step.translations?.id?.title ?? '', description: step.translations?.id?.description ?? '' } },
    };
}

export default function Edit({
    capability,
    availableMachines,
    statusOptions,
}: {
    capability: Capability;
    availableMachines: { id: number; name: string; is_published: boolean }[];
    statusOptions: string[];
}) {
    const { data, setData, post, processing, errors, isDirty, setDefaults } = useForm<{
        _method: string; slug: string; name: string; summary: string; description: string; icon: string;
        featured_image: File | null; featured_image_path: string; is_featured: boolean; sort_order: number;
        status: string; published_at: string;
        seo: SeoFieldsData;
        translations: { id: TranslationValues };
        steps: StepRow[];
        machine_ids: number[];
        sync_relations: boolean;
    }>({
        translations: initialTranslations(capability, TRANSLATABLE_FIELDS),
        _method: 'put',
        slug: capability.slug,
        name: capability.name,
        summary: capability.summary ?? '',
        description: capability.description ?? '',
        icon: capability.icon ?? '',
        featured_image: null,
        featured_image_path: capability.featured_image ?? '',
        is_featured: capability.is_featured,
        sort_order: capability.sort_order,
        status: capability.status,
        published_at: capability.published_at ?? '',
        seo: {
            ...SEO_FIELDS_DEFAULT,
            translations: seoTranslations(capability.seo_metadata),
            meta_title: capability.seo_metadata?.meta_title ?? '',
            meta_description: capability.seo_metadata?.meta_description ?? '',
            canonical_url: capability.seo_metadata?.canonical_url ?? '',
            og_title: capability.seo_metadata?.og_title ?? '',
            og_description: capability.seo_metadata?.og_description ?? '',
            og_image_path: capability.seo_metadata?.og_image ?? '',
            robots_index: capability.seo_metadata?.robots_index ?? true,
            robots_follow: capability.seo_metadata?.robots_follow ?? true,
        },
        steps: (capability.steps ?? []).map(stepRow),
        machine_ids: capability.machines.map((machine) => machine.id),
        sync_relations: true,
    });

    const [contentLocale, setContentLocale] = useState<ContentLocale>('en');
    const bind = translatableBinder(data, setData, contentLocale);
    const publicUrl = `/capabilities/${capability.slug}`;

    useUnsavedChangesWarning(isDirty && !processing);

    // After a save, take the server's rows (new steps now have ids, an uploaded image
    // is now a stored path) and make that the "unchanged" baseline. setDefaults() runs
    // in an effect so it sees the updated data, not the pre-save closure.
    const [savedAt, setSavedAt] = useState(0);
    useEffect(() => {
        if (savedAt) setDefaults();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [savedAt]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.capabilities.update', capability.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                const fresh = (page.props as unknown as { capability: Capability }).capability;
                setData((current) => ({
                    ...current,
                    steps: (fresh.steps ?? []).map(stepRow),
                    featured_image: null,
                    featured_image_path: fresh.featured_image ?? '',
                }));
                setSavedAt(Date.now());
            },
        });
    };

    // --- Steps: edited here, saved with the form. -------------------------------------------
    const updateStep = (index: number, field: 'title' | 'description', value: string) =>
        setData('steps', data.steps.map((step, i) => {
            if (i !== index) return step;
            return contentLocale === 'en'
                ? { ...step, [field]: value }
                : { ...step, translations: { id: { ...step.translations.id, [field]: value } } };
        }));
    const stepValue = (step: StepRow, field: 'title' | 'description') => (contentLocale === 'en' ? step[field] : step.translations.id[field]);
    const moveStep = (index: number, offset: -1 | 1) => {
        const target = index + offset;
        if (target < 0 || target >= data.steps.length) return;
        const next = [...data.steps];
        [next[index], next[target]] = [next[target], next[index]];
        setData('steps', next);
    };
    const addStep = () =>
        setData('steps', [...data.steps, { key: `new-${++newStepCounter}`, id: null, title: '', description: '', translations: { id: { title: '', description: '' } } }]);
    const removeStep = (index: number) => setData('steps', data.steps.filter((_, i) => i !== index));

    const toggleMachine = (id: number) =>
        setData('machine_ids', data.machine_ids.includes(id) ? data.machine_ids.filter((value) => value !== id) : [...data.machine_ids, id]);

    return (
        <AdminLayout>
            <Head title={`Edit ${capability.name}`} />

            <EditPageLayout
                eyebrow="Edit kapabilitas"
                title={capability.name}
                breadcrumbs={[{ label: 'Kapabilitas', href: route('admin.capabilities') }, { label: capability.name }]}
                viewUrl={capability.status === 'published' ? publicUrl : null}
                onSubmit={submit}
                aside={
                    <>
                        <PublishPanel
                            status={data.status}
                            statusOptions={statusOptions}
                            onStatusChange={(status) => setData('status', status)}
                            publishedAt={data.published_at}
                            onPublishedAtChange={(value) => setData('published_at', value)}
                            isDirty={isDirty}
                            processing={processing}
                            previewUrl={route('admin.capabilities.preview', capability.id)}
                        >
                            <label className="flex items-start gap-3 text-sm">
                                <input type="checkbox" checked={data.is_featured} onChange={(e) => setData('is_featured', e.target.checked)} className="mt-0.5 rounded border-border" />
                                <span>
                                    <span className="block font-medium text-foreground">Tampilkan di Beranda</span>
                                    <span className="mt-0.5 block text-xs text-slate-500">Masuk bagian “Kapabilitas” di halaman utama.</span>
                                </span>
                            </label>
                            <div>
                                <Label htmlFor="sort_order">Urutan</Label>
                                <Input id="sort_order" aria-describedby="sort_order-help" type="number" min={0} value={data.sort_order} onChange={(e) => setData('sort_order', Number(e.target.value))} className="mt-1.5" />
                                <FieldHint id="sort_order-help">Angka kecil tampil lebih dulu.</FieldHint>
                            </div>
                        </PublishPanel>
                        <WebsitePanel url={publicUrl} places={['Daftar di halaman Kapabilitas', ...(data.is_featured ? ['Beranda, bagian Kapabilitas'] : [])]} />
                    </>
                }
            >
                <div className="rounded-lg border border-border bg-surface px-5 sm:px-6">
                    <ContentLocaleTabs value={contentLocale} onChange={setContentLocale} translated={countTranslated(data.translations.id)} total={TRANSLATABLE_FIELDS.length} />
                </div>

                <EditCard title="Informasi utama" description="Nama dan teks yang tampil di daftar kapabilitas dan halaman detailnya.">
                    <div>
                        <Label htmlFor="name">Nama kapabilitas<LocaleBadge locale={contentLocale} /></Label>
                        <Input id="name" aria-describedby="name-help" {...bind('name', fieldHelp('capabilities', 'name').example)} className="mt-1.5" />
                        <FieldHint id="name-help">Judul di kartu daftar dan di halaman detail.</FieldHint>
                        {translatableError(errors, 'name', contentLocale) && <p className="mt-1 text-sm text-danger">{translatableError(errors, 'name', contentLocale)}</p>}
                    </div>
                    <SlugField
                        value={data.slug}
                        onChange={(slug) => setData('slug', slug)}
                        source={data.name}
                        prefix="/capabilities/"
                        hint="Huruf kecil, angka dan tanda hubung. Alamat sama untuk kedua bahasa; kalau diganti, alamat lama otomatis dialihkan ke sini."
                        error={errors.slug}
                    />
                    <div>
                        <Label htmlFor="summary">Ringkasan<LocaleBadge locale={contentLocale} /></Label>
                        <Input id="summary" aria-describedby="summary-help" {...bind('summary', fieldHelp('capabilities', 'summary').example)} className="mt-1.5" />
                        <FieldHint id="summary-help">1–2 kalimat. Tampil di kartu daftar kapabilitas dan di Beranda.</FieldHint>
                    </div>
                    <div>
                        <Label htmlFor="description">Deskripsi lengkap<LocaleBadge locale={contentLocale} /></Label>
                        <textarea id="description" {...bind('description')} rows={5} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <Label htmlFor="icon">Ikon</Label>
                        <Input id="icon" aria-describedby="icon-help" placeholder={fieldHelp('capabilities', 'icon').example} value={data.icon} onChange={(e) => setData('icon', e.target.value)} className="mt-1.5" />
                        <FieldHint id="icon-help">{fieldHelp('capabilities', 'icon').hint}</FieldHint>
                    </div>
                </EditCard>

                <EditCard title="Gambar utama" description="Tampil di kartu daftar dan di atas halaman detail. Rasio 4:3, minimal 1200 px.">
                    <MediaPickerField
                        label="Gambar"
                        currentUrl={data.featured_image ? URL.createObjectURL(data.featured_image) : (data.featured_image_path ? `/storage/${data.featured_image_path}` : null)}
                        onUploadFile={(file) => { setData('featured_image', file); setData('featured_image_path', ''); }}
                        onSelectPath={(path) => { setData('featured_image_path', path); setData('featured_image', null); }}
                        onClear={() => { setData('featured_image', null); setData('featured_image_path', ''); }}
                    />
                </EditCard>

                <EditCard
                    title="Langkah proses"
                    description="Tampil berurutan di halaman detail. Tersimpan bersama tombol Simpan."
                    actions={<span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-slate-700">{data.steps.length} langkah</span>}
                >
                    {data.steps.length === 0 && <p className="text-sm text-slate-500">Belum ada langkah. Tambahkan urutan proses produksinya.</p>}
                    <ol className="space-y-3">
                        {data.steps.map((step, index) => (
                            <li key={step.key} className="grid grid-cols-[1.75rem_minmax(0,1fr)_auto] items-start gap-3 rounded-lg border border-border p-3.5">
                                <span className="mt-2 flex h-7 w-7 items-center justify-center rounded-full bg-navy-950 text-xs font-semibold text-white">{index + 1}</span>
                                <div className="space-y-2">
                                    <Input
                                        value={stepValue(step, 'title')}
                                        placeholder={contentLocale === 'id' ? step.title || 'Judul langkah' : 'Judul langkah, mis. Desain & simulasi die'}
                                        onChange={(e) => updateStep(index, 'title', e.target.value)}
                                        aria-label={`Judul langkah ${index + 1}`}
                                        className={cn(errors[`steps.${index}.title` as keyof typeof errors] && 'border-danger')}
                                    />
                                    <textarea
                                        value={stepValue(step, 'description')}
                                        placeholder={contentLocale === 'id' ? step.description || 'Deskripsi singkat (opsional)' : 'Deskripsi singkat (opsional)'}
                                        onChange={(e) => updateStep(index, 'description', e.target.value)}
                                        aria-label={`Deskripsi langkah ${index + 1}`}
                                        rows={2}
                                        className="w-full rounded border border-border bg-surface px-3 py-2 text-sm"
                                    />
                                    {errors[`steps.${index}.title` as keyof typeof errors] && (
                                        <p className="text-sm text-danger">Judul langkah {index + 1} wajib diisi (bahasa Inggris).</p>
                                    )}
                                </div>
                                <div className="flex gap-1.5">
                                    <button type="button" onClick={() => moveStep(index, -1)} disabled={index === 0} aria-label={`Naikkan langkah ${index + 1}`} className="flex h-9 w-9 items-center justify-center rounded border border-border text-slate-700 hover:bg-muted disabled:opacity-40">
                                        <ArrowUp className="h-4 w-4" />
                                    </button>
                                    <button type="button" onClick={() => moveStep(index, 1)} disabled={index === data.steps.length - 1} aria-label={`Turunkan langkah ${index + 1}`} className="flex h-9 w-9 items-center justify-center rounded border border-border text-slate-700 hover:bg-muted disabled:opacity-40">
                                        <ArrowDown className="h-4 w-4" />
                                    </button>
                                    <button type="button" onClick={() => removeStep(index)} aria-label={`Hapus langkah ${index + 1}`} className="flex h-9 w-9 items-center justify-center rounded border border-border text-danger hover:bg-danger/10">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ol>
                    <button
                        type="button"
                        onClick={addStep}
                        disabled={contentLocale !== 'en'}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 text-sm font-medium text-navy-700 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah langkah
                    </button>
                    {contentLocale !== 'en' && <p className="text-xs text-slate-500">Tambah langkah dari tab English; di tab ini isi terjemahannya.</p>}
                </EditCard>

                <EditCard
                    title="Mesin & peralatan"
                    description="Mesin yang dicentang tampil di bagian “Peralatan” pada halaman kapabilitas ini."
                    actions={
                        <Link href={route('admin.machines')} className="text-sm font-medium text-navy-700 hover:text-navy-900">
                            Kelola mesin →
                        </Link>
                    }
                >
                    {availableMachines.length === 0 ? (
                        <p className="text-sm text-slate-500">Belum ada mesin yang tayang. Tambahkan di Data Master → Mesin &amp; Peralatan.</p>
                    ) : (
                        <div className="grid gap-2 sm:grid-cols-2">
                            {availableMachines.map((machine) => {
                                const checked = data.machine_ids.includes(machine.id);

                                return (
                                    <label
                                        key={machine.id}
                                        className={cn(
                                            'flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-3 text-sm transition-colors',
                                            checked ? 'border-navy-700 bg-navy-700/5' : 'border-border hover:bg-muted',
                                        )}
                                    >
                                        <input type="checkbox" checked={checked} onChange={() => toggleMachine(machine.id)} className="mt-0.5 rounded border-border" />
                                        <span>
                                            <span className={cn('flex items-center gap-2 font-medium', !machine.is_published && 'text-slate-500')}>
                                                {machine.name}
                                                {!machine.is_published && <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">Nonaktif</span>}
                                            </span>
                                            {!machine.is_published && <span className="mt-0.5 block text-xs text-slate-500">Tidak tampil di website · hilangkan centang untuk melepas</span>}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </EditCard>

                <EditCard title="SEO (opsional)" description="Judul & deskripsi untuk Google. Kosongkan untuk memakai nama & ringkasan.">
                    <SeoFields
                        locale={contentLocale}
                        data={data.seo}
                        onChange={(patch) => setData('seo', { ...data.seo, ...patch })}
                        errors={errors}
                        titleFallback={capability.name}
                        pageUrl={publicUrl}
                    />
                </EditCard>
            </EditPageLayout>
        </AdminLayout>
    );
}
