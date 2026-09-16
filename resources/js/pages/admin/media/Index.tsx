import { Head, router, useForm } from '@inertiajs/react';
import { FileText, Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { EmptyState } from '@/components/admin/EmptyState';
import { FilterBar } from '@/components/admin/FilterBar';
import { PageHeader } from '@/components/admin/PageHeader';
import { Pagination } from '@/components/admin/Pagination';
import { SearchInput } from '@/components/admin/SearchInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';

interface MediaItem {
    id: number;
    disk: string;
    path: string;
    filename: string;
    original_name: string | null;
    mime_type: string | null;
    size: number | null;
    width: number | null;
    height: number | null;
    alt_text: string | null;
    created_at: string;
    uploader: { id: number; name: string } | null;
}

function formatSize(bytes: number | null): string {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function MediaCard({ item, onSelect, onDelete }: { item: MediaItem; onSelect: () => void; onDelete: () => void }) {
    const isImage = item.mime_type?.startsWith('image/');
    const url = `/storage/${item.path}`;

    return (
        <button type="button" onClick={onSelect} className="group relative overflow-hidden rounded border border-border bg-surface text-left">
            <div className="flex aspect-square items-center justify-center bg-muted">
                {isImage ? (
                    <img src={url} alt={item.alt_text ?? ''} className="h-full w-full object-cover" />
                ) : (
                    <FileText className="h-10 w-10 text-slate-400" />
                )}
            </div>
            <div className="p-2">
                <p className="truncate text-xs font-medium text-foreground">{item.original_name ?? item.filename}</p>
                <p className="text-xs text-slate-400">{formatSize(item.size)}</p>
            </div>
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="absolute right-2 top-2 hidden rounded bg-danger/90 p-1.5 text-white group-hover:block"
                aria-label="Delete"
            >
                <Trash2 className="h-3.5 w-3.5" />
            </button>
        </button>
    );
}

function DetailPanel({ item, onClose }: { item: MediaItem; onClose: () => void }) {
    const { data, setData, put, processing } = useForm({ alt_text: item.alt_text ?? '' });
    const replaceForm = useForm<{ file: File | null }>({ file: null });

    const saveAlt: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.media.alt-text', item.id), { preserveScroll: true });
    };

    const url = `/storage/${item.path}`;
    const isImage = item.mime_type?.startsWith('image/');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div className="w-full max-w-lg rounded border border-border bg-surface p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center rounded bg-muted p-4">
                    {isImage ? <img src={url} alt={item.alt_text ?? ''} className="max-h-64 rounded" /> : <FileText className="h-16 w-16 text-slate-400" />}
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <dt className="text-slate-500">Original name</dt><dd className="text-foreground">{item.original_name ?? '—'}</dd>
                    <dt className="text-slate-500">Stored filename</dt><dd className="truncate text-foreground">{item.filename}</dd>
                    <dt className="text-slate-500">MIME type</dt><dd className="text-foreground">{item.mime_type ?? '—'}</dd>
                    <dt className="text-slate-500">Size</dt><dd className="text-foreground">{formatSize(item.size)}</dd>
                    {isImage && <><dt className="text-slate-500">Dimensions</dt><dd className="text-foreground">{item.width && item.height ? `${item.width}×${item.height}` : '—'}</dd></>}
                    <dt className="text-slate-500">Uploaded by</dt><dd className="text-foreground">{item.uploader?.name ?? '—'}</dd>
                    <dt className="text-slate-500">Uploaded at</dt><dd className="text-foreground">{new Date(item.created_at).toLocaleString()}</dd>
                </dl>

                <div className="mt-4 flex items-center gap-2">
                    <Input readOnly value={url} className="text-xs" onFocus={(e) => e.target.select()} />
                    <Button type="button" size="sm" variant="secondary" onClick={() => navigator.clipboard.writeText(window.location.origin + url)}>Copy URL</Button>
                </div>

                <form onSubmit={saveAlt} className="mt-4">
                    <Label htmlFor="alt_text">Alt text</Label>
                    <div className="mt-1.5 flex gap-2">
                        <Input id="alt_text" value={data.alt_text} onChange={(e) => setData('alt_text', e.target.value)} />
                        <Button type="submit" size="sm" disabled={processing}>Save</Button>
                    </div>
                </form>

                <form
                    className="mt-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!replaceForm.data.file) return;
                        replaceForm.post(route('admin.media.replace', item.id), { preserveScroll: true, forceFormData: true });
                    }}
                >
                    <Label htmlFor="replace_file">Replace file</Label>
                    <div className="mt-1.5 flex items-center gap-2">
                        <input id="replace_file" type="file" onChange={(e) => replaceForm.setData('file', e.target.files?.[0] ?? null)} className="text-sm" />
                        <Button type="submit" size="sm" variant="secondary" disabled={replaceForm.processing}>Replace</Button>
                    </div>
                </form>

                <div className="mt-6 flex justify-end">
                    <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
}

export default function Index({
    media,
    filters,
}: {
    media: { data: MediaItem[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { search?: string; type?: string };
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [selected, setSelected] = useState<MediaItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
    const uploadForm = useForm<{ file: File | null }>({ file: null });

    const applyFilters = (overrides: Record<string, unknown>) => {
        router.get(route('admin.media'), { ...filters, ...overrides }, { preserveState: true, replace: true });
    };

    const upload: FormEventHandler = (e) => {
        e.preventDefault();
        if (!uploadForm.data.file) return;
        uploadForm.post(route('admin.media.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => uploadForm.reset(),
        });
    };

    return (
        <AdminLayout>
            <Head title="Media Library" />

            <PageHeader title="Media Library" description="Reusable images and documents for CMS content." />

            <div className="space-y-4">
                <FilterBar>
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                        placeholder="Search media…"
                        className="max-w-sm"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <select value={filters.type ?? ''} onChange={(e) => applyFilters({ type: e.target.value })} className="h-10 rounded border border-border bg-surface px-3 text-sm">
                            <option value="">All types</option>
                            <option value="image">Images</option>
                            <option value="document">Documents</option>
                        </select>
                        <form onSubmit={upload} className="flex items-center gap-2">
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,application/pdf"
                                onChange={(e) => uploadForm.setData('file', e.target.files?.[0] ?? null)}
                                className="text-sm"
                            />
                            <Button type="submit" size="sm" disabled={uploadForm.processing}>
                                <Upload className="mr-2 h-4 w-4" />Upload
                            </Button>
                        </form>
                    </div>
                </FilterBar>
                {uploadForm.errors.file && <p className="text-sm text-danger">{uploadForm.errors.file}</p>}

                {media.data.length === 0 ? (
                    <EmptyState icon={ImageIcon} title="No media uploaded yet" />
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {media.data.map((item) => (
                            <MediaCard key={item.id} item={item} onSelect={() => setSelected(item)} onDelete={() => setDeleteTarget(item)} />
                        ))}
                    </div>
                )}

                <Pagination links={media.links} />
            </div>

            {selected && <DetailPanel item={selected} onClose={() => setSelected(null)} />}

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Delete this file?"
                description={`"${deleteTarget?.original_name}" will be permanently removed if it's not in use.`}
                confirmLabel="Delete"
                destructive
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (deleteTarget) router.delete(route('admin.media.destroy', deleteTarget.id));
                    setDeleteTarget(null);
                }}
            />
        </AdminLayout>
    );
}
