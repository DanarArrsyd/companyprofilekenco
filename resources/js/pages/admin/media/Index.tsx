import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Head, router, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    Copy,
    FileText,
    Image as ImageIcon,
    Link2,
    RefreshCw,
    ShieldAlert,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import {
    DragEvent,
    FormEventHandler,
    useEffect,
    useRef,
    useState,
} from 'react';

import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { EmptyState } from '@/components/admin/EmptyState';
import { FilterBar } from '@/components/admin/FilterBar';
import { PageHeader } from '@/components/admin/PageHeader';
import { Pagination, PaginationLink } from '@/components/admin/Pagination';
import { SearchInput } from '@/components/admin/SearchInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';
import { cn } from '@/lib/utils';

interface MediaUsage {
    type: string;
    id: number | string;
    label: string;
}

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
    url: string | null;
    is_image: boolean;
    usage_count: number;
    usages: MediaUsage[];
}

interface MediaPaginator {
    data: MediaItem[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

function formatSize(bytes: number | null): string {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function MediaCard({
    item,
    selected,
    onSelect,
    onDelete,
}: {
    item: MediaItem;
    selected: boolean;
    onSelect: () => void;
    onDelete: () => void;
}) {
    const deleteBlocked = item.usage_count > 0;

    return (
        <article
            className={cn(
                'group relative overflow-hidden rounded border bg-surface transition-colors',
                selected ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-slate-400',
            )}
        >
            <button
                type="button"
                onClick={onSelect}
                aria-pressed={selected}
                className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
            >
                <div className="flex aspect-square items-center justify-center bg-muted">
                    {item.is_image && item.url ? (
                        <img src={item.url} alt={item.alt_text ?? ''} className="h-full w-full object-cover" />
                    ) : (
                        <FileText className="h-10 w-10 text-slate-400" />
                    )}
                </div>
                <div className="space-y-1 p-3">
                    <p className="truncate text-xs font-medium text-foreground">
                        {item.original_name ?? item.filename}
                    </p>
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                        <span>{formatSize(item.size)}</span>
                        <span className="inline-flex items-center gap-1">
                            <Link2 className="h-3 w-3" />{item.usage_count}
                        </span>
                    </div>
                </div>
            </button>

            <button
                type="button"
                onClick={onDelete}
                disabled={deleteBlocked}
                title={deleteBlocked ? `Used in ${item.usage_count} content locations. Replace or unlink it first.` : 'Delete asset'}
                className={cn(
                    'absolute right-2 top-2 rounded p-1.5 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
                    deleteBlocked ? 'cursor-not-allowed bg-slate-500' : 'bg-danger/90 hover:bg-danger',
                )}
                aria-label={deleteBlocked ? 'Asset is in use and cannot be deleted' : 'Delete asset'}
            >
                {deleteBlocked ? <ShieldAlert className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
            </button>
        </article>
    );
}

function DetailPanel({
    item,
    onClose,
    onDelete,
}: {
    item: MediaItem;
    onClose: () => void;
    onDelete: () => void;
}) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        alt_text: item.alt_text ?? '',
    });
    const replaceForm = useForm<{ file: File | null }>({ file: null });
    const replaceInput = useRef<HTMLInputElement>(null);
    const deleteBlocked = item.usage_count > 0;

    const saveAlt: FormEventHandler = (event) => {
        event.preventDefault();
        put(route('admin.media.alt-text', item.id), { preserveScroll: true });
    };

    const replace: FormEventHandler = (event) => {
        event.preventDefault();
        if (!replaceForm.data.file) return;

        replaceForm.post(route('admin.media.replace', item.id), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                replaceForm.reset();
                if (replaceInput.current) replaceInput.current.value = '';
                onClose();
            },
        });
    };

    const publicUrl = item.url ?? '';

    return (
        <Dialog open onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-charcoal/50" aria-hidden="true" />
            <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6">
                <div className="flex min-h-full items-center justify-center">
                    <DialogPanel className="w-full max-w-5xl overflow-hidden rounded border border-border bg-surface shadow-xl">
                        <header className="flex items-start justify-between border-b border-border px-5 py-4 sm:px-6">
                            <div className="min-w-0">
                                <DialogTitle className="truncate text-base font-semibold text-foreground">
                                    {item.original_name ?? item.filename}
                                </DialogTitle>
                                <p className="mt-1 text-sm text-slate-500">Asset details and publishing impact</p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close asset details"
                                className="rounded p-1.5 text-slate-500 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </header>

                        <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
                            <div className="flex min-h-80 items-center justify-center border-b border-border bg-muted p-6 lg:border-b-0 lg:border-r">
                                {item.is_image && item.url ? (
                                    <img src={item.url} alt={item.alt_text ?? ''} className="max-h-[34rem] max-w-full rounded object-contain" />
                                ) : (
                                    <div className="text-center">
                                        <FileText className="mx-auto h-16 w-16 text-slate-400" />
                                        <p className="mt-3 text-sm text-slate-500">Document preview unavailable</p>
                                    </div>
                                )}
                            </div>

                            <div className="max-h-[72vh] space-y-6 overflow-y-auto p-5 sm:p-6">
                                <section>
                                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">File information</h3>
                                    <dl className="mt-3 grid grid-cols-[7rem_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
                                        <dt className="text-slate-500">Stored name</dt><dd className="truncate text-foreground">{item.filename}</dd>
                                        <dt className="text-slate-500">Type</dt><dd className="text-foreground">{item.mime_type ?? '—'}</dd>
                                        <dt className="text-slate-500">Size</dt><dd className="text-foreground">{formatSize(item.size)}</dd>
                                        {item.is_image && <><dt className="text-slate-500">Dimensions</dt><dd className="text-foreground">{item.width && item.height ? `${item.width}×${item.height}` : '—'}</dd></>}
                                        <dt className="text-slate-500">Uploaded by</dt><dd className="text-foreground">{item.uploader?.name ?? '—'}</dd>
                                        <dt className="text-slate-500">Uploaded at</dt><dd className="text-foreground">{new Date(item.created_at).toLocaleString()}</dd>
                                    </dl>

                                    {item.url && (
                                        <div className="mt-4 flex items-center gap-2">
                                            <Input readOnly value={publicUrl} className="min-w-0 text-xs" onFocus={(event) => event.target.select()} />
                                            <Button type="button" size="sm" variant="secondary" onClick={() => void navigator.clipboard.writeText(publicUrl)}>
                                                <Copy className="mr-2 h-4 w-4" />Copy
                                            </Button>
                                        </div>
                                    )}
                                </section>

                                <section className="border-t border-border pt-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Usage</h3>
                                        <span className="rounded bg-muted px-2 py-1 text-xs font-medium text-foreground">
                                            {item.usage_count} {item.usage_count === 1 ? 'location' : 'locations'}
                                        </span>
                                    </div>
                                    {item.usages.length > 0 ? (
                                        <ul className="mt-3 divide-y divide-border rounded border border-border">
                                            {item.usages.map((usage) => (
                                                <li key={`${usage.type}-${usage.id}`} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                                                    <span className="truncate text-foreground">{usage.label}</span>
                                                    <span className="shrink-0 text-xs capitalize text-slate-500">{usage.type}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-3 rounded border border-border bg-muted/40 px-3 py-2 text-sm text-slate-500">
                                            Not linked to published CMS content.
                                        </p>
                                    )}
                                </section>

                                {item.is_image && (
                                    <form onSubmit={saveAlt} className="border-t border-border pt-5">
                                        <Label htmlFor={`alt_text_${item.id}`}>Alt text</Label>
                                        <p className="mt-1 text-xs text-slate-500">Describe the image for accessibility and search engines.</p>
                                        <div className="mt-2 flex gap-2">
                                            <Input id={`alt_text_${item.id}`} value={data.alt_text} onChange={(event) => setData('alt_text', event.target.value)} />
                                            <Button type="submit" size="sm" disabled={processing}>Save</Button>
                                        </div>
                                        {errors.alt_text && <p role="alert" className="mt-2 text-sm text-danger">{errors.alt_text}</p>}
                                        {recentlySuccessful && <p className="mt-2 flex items-center gap-1 text-xs text-success"><CheckCircle2 className="h-3.5 w-3.5" />Alt text saved.</p>}
                                    </form>
                                )}

                                <form onSubmit={replace} className="border-t border-border pt-5">
                                    <Label htmlFor={`replace_file_${item.id}`}>Replace file</Label>
                                    <p className={cn('mt-1 text-xs', deleteBlocked ? 'text-warning' : 'text-slate-500')}>
                                        {deleteBlocked
                                            ? `Replacing this file updates all ${item.usage_count} linked content locations.`
                                            : 'The public path stays the same after replacement.'}
                                    </p>
                                    <input
                                        ref={replaceInput}
                                        id={`replace_file_${item.id}`}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,application/pdf"
                                        onChange={(event) => replaceForm.setData('file', event.target.files?.[0] ?? null)}
                                        className="mt-3 block w-full text-sm text-slate-600 file:mr-3 file:rounded file:border file:border-border file:bg-surface file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted"
                                    />
                                    {replaceForm.data.file && <p className="mt-2 truncate text-xs text-slate-500">Selected: {replaceForm.data.file.name}</p>}
                                    {replaceForm.errors.file && <p role="alert" className="mt-2 text-sm text-danger">{replaceForm.errors.file}</p>}
                                    {replaceForm.progress && (
                                        <div className="mt-3" aria-label={`Upload ${replaceForm.progress.percentage}% complete`}>
                                            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                                <div className="h-full bg-primary transition-[width]" style={{ width: `${replaceForm.progress.percentage}%` }} />
                                            </div>
                                        </div>
                                    )}
                                    <Button type="submit" size="sm" variant="secondary" className="mt-3" disabled={!replaceForm.data.file || replaceForm.processing}>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        {replaceForm.processing ? 'Replacing…' : deleteBlocked ? 'Replace everywhere' : 'Replace file'}
                                    </Button>
                                </form>

                                <section className="border-t border-border pt-5">
                                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Danger zone</h3>
                                    <p className="mt-2 text-xs text-slate-500">
                                        {deleteBlocked
                                            ? `Delete is disabled because this asset is used in ${item.usage_count} content locations.`
                                            : 'Deleting removes this asset permanently from the media library.'}
                                    </p>
                                    <Button type="button" size="sm" variant="danger" className="mt-3" disabled={deleteBlocked} onClick={onDelete}>
                                        <Trash2 className="mr-2 h-4 w-4" />Delete asset
                                    </Button>
                                </section>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}

export default function Index({
    media,
    filters,
}: {
    media: MediaPaginator;
    filters: { search?: string; type?: string };
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [selected, setSelected] = useState<MediaItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const uploadInput = useRef<HTMLInputElement>(null);
    const uploadForm = useForm<{ file: File | null; alt_text: string }>({
        file: null,
        alt_text: '',
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!uploadForm.data.file?.type.startsWith('image/')) {
            setPreviewUrl(null);
            return;
        }

        const nextPreview = URL.createObjectURL(uploadForm.data.file);
        setPreviewUrl(nextPreview);

        return () => URL.revokeObjectURL(nextPreview);
    }, [uploadForm.data.file]);

    const applyFilters = (overrides: Record<string, unknown>) => {
        router.get(
            route('admin.media'),
            { ...filters, ...overrides },
            { preserveState: true, replace: true },
        );
    };

    const upload: FormEventHandler = (event) => {
        event.preventDefault();
        if (!uploadForm.data.file) return;

        uploadForm.post(route('admin.media.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                uploadForm.reset();
                if (uploadInput.current) uploadInput.current.value = '';
            },
        });
    };

    const chooseUpload = (file: File | null) => {
        uploadForm.setData('file', file);
        uploadForm.clearErrors('file');
    };

    const onDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setDragActive(false);
        chooseUpload(event.dataTransfer.files?.[0] ?? null);
    };

    const openDelete = (item: MediaItem) => {
        if (item.usage_count > 0) return;
        setSelected(null);
        setDeleteTarget(item);
    };

    return (
        <AdminLayout>
            <Head title="Media Library" />

            <PageHeader
                title="Media Library"
                description="Upload once, understand every usage, and publish safely across the CMS."
            />

            <div className="space-y-5">
                <section className="overflow-hidden rounded-lg border border-border bg-surface" aria-labelledby="upload-heading">
                    <div className="border-b border-border px-5 py-4 sm:px-6">
                        <h2 id="upload-heading" className="text-sm font-semibold text-foreground">Upload asset</h2>
                        <p className="mt-1 text-xs text-slate-500">JPG, PNG, WebP, or PDF · maximum 10 MB</p>
                    </div>
                    <form onSubmit={upload} className="grid gap-4 p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_18rem]">
                        <Label
                            onDragEnter={(event) => {
                                event.preventDefault();
                                setDragActive(true);
                            }}
                            onDragOver={(event) => event.preventDefault()}
                            onDragLeave={(event) => {
                                if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragActive(false);
                            }}
                            onDrop={onDrop}
                            className={cn(
                                'flex min-h-40 cursor-pointer flex-col items-center justify-center rounded border border-dashed border-border bg-muted/40 px-6 py-8 text-center transition-colors hover:border-primary hover:bg-muted',
                                dragActive && 'border-primary bg-muted',
                                uploadForm.processing && 'cursor-wait opacity-60',
                            )}
                        >
                            {previewUrl ? (
                                <img src={previewUrl} alt="Selected upload preview" className="mb-4 max-h-28 max-w-full rounded object-contain" />
                            ) : uploadForm.data.file?.type === 'application/pdf' ? (
                                <FileText className="mb-3 h-10 w-10 text-primary" />
                            ) : (
                                <Upload className="mb-3 h-10 w-10 text-primary" />
                            )}
                            <span className="text-sm font-medium text-foreground">
                                {uploadForm.data.file ? uploadForm.data.file.name : 'Drop a file here or browse'}
                            </span>
                            <span className="mt-1 text-xs text-slate-500">
                                {uploadForm.data.file ? formatSize(uploadForm.data.file.size) : 'A preview appears before upload'}
                            </span>
                            <input
                                ref={uploadInput}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,application/pdf"
                                disabled={uploadForm.processing}
                                className="sr-only"
                                onChange={(event) => chooseUpload(event.target.files?.[0] ?? null)}
                            />
                        </Label>

                        <div className="flex flex-col justify-center">
                            <Label htmlFor="upload_alt_text">Alt text <span className="font-normal text-slate-400">(images only)</span></Label>
                            <Input
                                id="upload_alt_text"
                                value={uploadForm.data.alt_text}
                                onChange={(event) => uploadForm.setData('alt_text', event.target.value)}
                                placeholder="Describe what the image shows"
                                className="mt-2"
                                disabled={!uploadForm.data.file?.type.startsWith('image/') || uploadForm.processing}
                            />
                            {uploadForm.errors.file && <p role="alert" className="mt-2 text-sm text-danger">{uploadForm.errors.file}</p>}
                            {uploadForm.errors.alt_text && <p role="alert" className="mt-2 text-sm text-danger">{uploadForm.errors.alt_text}</p>}

                            {uploadForm.progress && (
                                <div className="mt-4" aria-label={`Upload ${uploadForm.progress.percentage}% complete`}>
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span>Uploading…</span><span>{uploadForm.progress.percentage}%</span>
                                    </div>
                                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                                        <div className="h-full bg-primary transition-[width]" style={{ width: `${uploadForm.progress.percentage}%` }} />
                                    </div>
                                </div>
                            )}

                            {uploadForm.recentlySuccessful && (
                                <p role="status" className="mt-3 flex items-center gap-1.5 text-sm text-success">
                                    <CheckCircle2 className="h-4 w-4" />Asset uploaded to the library.
                                </p>
                            )}

                            <Button type="submit" className="mt-4 w-full" disabled={!uploadForm.data.file || uploadForm.processing}>
                                <Upload className="mr-2 h-4 w-4" />
                                {uploadForm.processing ? 'Uploading…' : 'Upload to library'}
                            </Button>
                        </div>
                    </form>
                </section>

                <FilterBar>
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                        <SearchInput
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            onKeyDown={(event) => event.key === 'Enter' && applyFilters({ search, page: undefined })}
                            placeholder="Search media…"
                            className="max-w-sm"
                        />
                        <Button type="button" size="sm" variant="secondary" onClick={() => applyFilters({ search, page: undefined })}>
                            Search
                        </Button>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="hidden text-xs text-slate-500 sm:inline">
                            {media.total === 0 ? 'No assets' : `${media.from}–${media.to} of ${media.total}`}
                        </span>
                        <select
                            value={filters.type ?? ''}
                            onChange={(event) => applyFilters({ type: event.target.value, page: undefined })}
                            className="h-10 rounded border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            aria-label="Filter by file type"
                        >
                            <option value="">All types</option>
                            <option value="image">Images</option>
                            <option value="document">Documents</option>
                        </select>
                    </div>
                </FilterBar>

                {media.data.length === 0 ? (
                    <EmptyState icon={ImageIcon} title="No media found" description="Upload the first asset or change the current filters." />
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {media.data.map((item) => (
                            <MediaCard
                                key={item.id}
                                item={item}
                                selected={selected?.id === item.id}
                                onSelect={() => setSelected(item)}
                                onDelete={() => openDelete(item)}
                            />
                        ))}
                    </div>
                )}

                <Pagination links={media.links} />
            </div>

            {selected && (
                <DetailPanel
                    item={selected}
                    onClose={() => setSelected(null)}
                    onDelete={() => openDelete(selected)}
                />
            )}

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Delete this asset?"
                description={`“${deleteTarget?.original_name ?? deleteTarget?.filename ?? ''}” will be permanently removed. This action cannot be undone.`}
                confirmLabel="Delete asset"
                destructive
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (deleteTarget) {
                        router.delete(route('admin.media.destroy', deleteTarget.id), {
                            preserveScroll: true,
                            onFinish: () => setDeleteTarget(null),
                        });
                    }
                }}
            />
        </AdminLayout>
    );
}
