import { ArrowDown, ArrowUp, Globe, Plus, Trash2 } from 'lucide-react';

import { BrandIcon } from '@/components/public/BrandIcon';
import { Input } from '@/components/ui/input';
import { SOCIAL_PLATFORM_INFO, SOCIAL_PLATFORMS, type SocialLink, type SocialPlatform } from '@/lib/social-links';

const MAX_LINKS = 12;

/** Social links as an ordered list; the order here is the order in the footer. */
export function SocialLinksField({
    value,
    onChange,
    errors,
}: {
    value: SocialLink[];
    onChange: (links: SocialLink[]) => void;
    errors: Partial<Record<string, string>>;
}) {
    const update = (index: number, patch: Partial<SocialLink>) => onChange(value.map((link, i) => (i === index ? { ...link, ...patch } : link)));
    const move = (index: number, offset: -1 | 1) => {
        const target = index + offset;
        if (target < 0 || target >= value.length) return;
        const next = [...value];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    };
    const add = () => {
        const used = new Set(value.map((link) => link.platform));
        const platform = SOCIAL_PLATFORMS.find((p) => p !== 'other' && !used.has(p)) ?? 'other';
        onChange([...value, { platform, url: '', label: null }]);
    };

    return (
        <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-foreground">Link sosial media</legend>
            <p className="text-sm text-slate-500">Tampil sebagai ikon bulat di footer “Connect With Us”, sesuai urutan di sini. Pilih “Lainnya” untuk situs lain dan beri nama.</p>

            {value.length === 0 && <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-slate-500">Belum ada link. Footer tidak menampilkan ikon sosial media.</p>}

            {value.map((link, index) => {
                const info = SOCIAL_PLATFORM_INFO[link.platform];
                const error = ['platform', 'url', 'label'].map((field) => errors[`social_links.${index}.${field}`]).find(Boolean);

                return (
                    <div key={index} className="rounded-lg border border-border p-3">
                        <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-2 sm:grid-cols-[2.75rem_11rem_minmax(0,1fr)_auto] sm:items-center">
                            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-950 text-white" aria-hidden="true">
                                {link.platform === 'other' ? <Globe className="h-4 w-4" /> : <BrandIcon brand={link.platform} className="h-4 w-4" />}
                            </span>
                            <select
                                aria-label={`Platform, link ${index + 1}`}
                                value={link.platform}
                                onChange={(e) => update(index, { platform: e.target.value as SocialPlatform, label: e.target.value === 'other' ? link.label : null })}
                                className="h-11 w-full rounded border border-border bg-surface px-3 text-sm"
                            >
                                {SOCIAL_PLATFORMS.map((platform) => <option key={platform} value={platform}>{SOCIAL_PLATFORM_INFO[platform].name}</option>)}
                            </select>
                            <div className="col-span-2 flex flex-col gap-2 sm:col-span-1 sm:flex-row">
                                {link.platform === 'other' && (
                                    <Input aria-label={`Nama link ${index + 1}`} placeholder="Nama, mis. Katalog" value={link.label ?? ''} onChange={(e) => update(index, { label: e.target.value })} className="sm:w-40" />
                                )}
                                <Input type="url" aria-label={`URL ${info.name}`} placeholder={info.example} value={link.url} onChange={(e) => update(index, { url: e.target.value })} />
                            </div>
                            <div className="col-span-2 flex gap-1.5 sm:col-span-1">
                                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Naikkan link ${index + 1}`} className="flex h-11 w-11 items-center justify-center rounded border border-border text-slate-700 hover:bg-muted disabled:opacity-40"><ArrowUp className="h-4 w-4" /></button>
                                <button type="button" onClick={() => move(index, 1)} disabled={index === value.length - 1} aria-label={`Turunkan link ${index + 1}`} className="flex h-11 w-11 items-center justify-center rounded border border-border text-slate-700 hover:bg-muted disabled:opacity-40"><ArrowDown className="h-4 w-4" /></button>
                                <button type="button" onClick={() => onChange(value.filter((_, i) => i !== index))} aria-label={`Hapus link ${index + 1}`} className="flex h-11 w-11 items-center justify-center rounded border border-border text-danger hover:bg-danger/10"><Trash2 className="h-4 w-4" /></button>
                            </div>
                        </div>
                        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
                    </div>
                );
            })}

            <button
                type="button"
                onClick={add}
                disabled={value.length >= MAX_LINKS}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm font-medium text-navy-700 hover:bg-muted disabled:opacity-50"
            >
                <Plus className="h-4 w-4" />
                Tambah link
            </button>
        </fieldset>
    );
}
