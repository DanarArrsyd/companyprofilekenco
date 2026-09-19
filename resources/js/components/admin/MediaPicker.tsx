import { FileText, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PickerItem {
    id: number;
    path: string;
    url: string | null;
    filename: string;
    original_name: string | null;
    mime_type: string | null;
    alt_text: string | null;
    is_image: boolean;
}

function Modal({ onClose, onSelectPath }: { onClose: () => void; onSelectPath: (path: string) => void }) {
    const [items, setItems] = useState<PickerItem[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const load = (q: string) => {
        setLoading(true);
        fetch(`${route('admin.media.picker')}?search=${encodeURIComponent(q)}&type=image`, {
            headers: { Accept: 'application/json' },
        })
            .then((r) => r.json())
            .then((data) => setItems(data.data ?? []))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const uploadFile = (file: File) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        fetch(route('admin.media.store'), {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: formData,
        })
            .then((r) => (r.ok ? r.json() : null))
            .then((uploaded: { path: string } | null) => {
                if (uploaded?.path) {
                    onSelectPath(uploaded.path);
                    return;
                }
                load(search);
            })
            .finally(() => setUploading(false));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div className="flex max-h-[80vh] w-full max-w-3xl flex-col rounded border border-border bg-surface p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground">Select from Media Library</h2>
                    <button type="button" onClick={onClose} aria-label="Close"><X className="h-5 w-5 text-slate-500" /></button>
                </div>

                <div className="mt-4 flex items-center gap-3">
                    <Input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); load(e.target.value); }}
                        placeholder="Search media…"
                        className="max-w-sm"
                    />
                    <Label className="flex cursor-pointer items-center gap-2 rounded border border-border px-3 py-2 text-sm text-slate-700 hover:bg-muted">
                        <Upload className="h-4 w-4" />
                        {uploading ? 'Uploading…' : 'Upload new'}
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadFile(file);
                        }} />
                    </Label>
                </div>

                <div className="mt-4 flex-1 overflow-y-auto">
                    {loading ? (
                        <p className="py-8 text-center text-sm text-slate-500">Loading…</p>
                    ) : items.length === 0 ? (
                        <p className="py-8 text-center text-sm text-slate-500">No media found.</p>
                    ) : (
                        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                            {items.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => onSelectPath(item.path)}
                                    className="overflow-hidden rounded border border-border text-left hover:border-navy-700"
                                >
                                    <div className="flex aspect-square items-center justify-center bg-muted">
                                        {item.is_image && item.url ? (
                                            <img src={item.url} alt={item.alt_text ?? ''} className="h-full w-full object-cover" />
                                        ) : (
                                            <FileText className="h-8 w-8 text-slate-400" />
                                        )}
                                    </div>
                                    <p className="truncate p-1.5 text-xs text-foreground">{item.original_name ?? item.filename}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Drop-in image field: lets the admin pick an existing file from the Media
 * Library or upload a brand new one. `currentUrl` previews whatever is
 * already selected; `onUploadFile` receives a fresh File (validated and
 * stored the same way the field always has), `onSelectPath` receives the
 * chosen library file's stored path string.
 */
export function MediaPickerField({
    label,
    currentUrl,
    onUploadFile,
    onSelectPath,
    onClear,
    error,
}: {
    label: string;
    currentUrl?: string | null;
    onUploadFile: (file: File) => void;
    onSelectPath: (path: string) => void;
    onClear?: () => void;
    error?: string;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <Label>{label}</Label>
            <div className="mt-1.5 flex items-center gap-4">
                {currentUrl ? (
                    <img src={currentUrl} alt="" className="h-16 w-16 rounded border border-border object-cover" />
                ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded border border-dashed border-border text-xs text-slate-400">None</div>
                )}
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(true)}>Choose from Library</Button>
                        {currentUrl && onClear && (
                            <Button type="button" size="sm" variant="secondary" onClick={onClear}>Remove</Button>
                        )}
                    </div>
                    <label className="text-xs text-slate-500">
                        or upload new: <input type="file" accept="image/jpeg,image/png,image/webp" className="text-xs" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onUploadFile(file);
                        }} />
                    </label>
                </div>
            </div>
            {error && <p className="mt-1 text-sm text-danger">{error}</p>}

            {open && (
                <Modal
                    onClose={() => setOpen(false)}
                    onSelectPath={(path) => {
                        onSelectPath(path);
                        setOpen(false);
                    }}
                />
            )}
        </div>
    );
}
