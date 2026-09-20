import { CheckCircle2, FileText, Upload, X } from 'lucide-react';
import { ChangeEvent, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MediaUploadError, uploadMedia } from '@/lib/media';

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

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

function Modal({ onClose, onSelectPath }: { onClose: () => void; onSelectPath: (path: string) => void }) {
    const [items, setItems] = useState<PickerItem[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const load = (q: string) => {
        setLoading(true);
        fetch(`${route('admin.media.picker')}?search=${encodeURIComponent(q)}&type=image`, {
            headers: { Accept: 'application/json' },
        })
            .then((response) => response.json())
            .then((data) => setItems(data.data ?? []))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const uploadFile = async (file: File) => {
        setUploading(true);
        setUploadError(null);

        try {
            const uploaded = await uploadMedia(file);
            onSelectPath(uploaded.path);
        } catch (error) {
            setUploadError(error instanceof MediaUploadError ? error.message : 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div className="flex max-h-[80vh] w-full max-w-3xl flex-col rounded border border-border bg-surface p-6" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground">Select from Media Library</h2>
                    <button type="button" onClick={onClose} aria-label="Close"><X className="h-5 w-5 text-slate-500" /></button>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Input
                        value={search}
                        onChange={(event) => { setSearch(event.target.value); load(event.target.value); }}
                        placeholder="Search media…"
                        className="max-w-sm"
                    />
                    <Label className="flex cursor-pointer items-center gap-2 rounded border border-border px-3 py-2 text-sm text-slate-700 hover:bg-muted">
                        <Upload className="h-4 w-4" />
                        {uploading ? 'Uploading…' : 'Upload new'}
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={uploading}
                            className="hidden"
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) void uploadFile(file);
                                event.target.value = '';
                            }}
                        />
                    </Label>
                </div>

                {uploadError && (
                    <div role="alert" className="mt-3 rounded border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
                        {uploadError}
                    </div>
                )}

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
                                    className="overflow-hidden rounded border border-border text-left hover:border-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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

interface MediaPickerFieldProps {
    label: string;
    currentUrl?: string | null;
    onUploadFile?: (file: File) => void;
    onSelectPath: (path: string) => void;
    uploadToLibrary?: boolean;
    onClear?: () => void;
    error?: string;
}

/**
 * Existing entity forms can defer a fresh file to their parent form through
 * `onUploadFile`; structured CMS sections upload immediately to the library.
 */
export function MediaPickerField({
    label,
    currentUrl,
    onUploadFile,
    onSelectPath,
    uploadToLibrary = false,
    onClear,
    error,
}: MediaPickerFieldProps) {
    const [open, setOpen] = useState(false);
    const [uploadState, setUploadState] = useState<UploadState>('idle');
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleUpload = async (file: File) => {
        setUploadState('uploading');
        setUploadError(null);

        try {
            if (uploadToLibrary) {
                const uploaded = await uploadMedia(file);
                onSelectPath(uploaded.path);
            } else if (onUploadFile) {
                onUploadFile(file);
            } else {
                throw new MediaUploadError('This field is not configured for direct uploads.');
            }

            setUploadState('success');
        } catch (uploadFailure) {
            setUploadState('error');
            setUploadError(uploadFailure instanceof MediaUploadError ? uploadFailure.message : 'Upload failed. Please try again.');
        }
    };

    const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) void handleUpload(file);
        event.target.value = '';
    };

    const visibleError = uploadError ?? error;

    return (
        <div>
            <Label>{label}</Label>
            <div className="mt-1.5 flex flex-col gap-4 rounded border border-border bg-surface p-4 sm:flex-row sm:items-center">
                {currentUrl ? (
                    <img src={currentUrl} alt="" className="h-24 w-full rounded border border-border object-cover sm:w-32" />
                ) : (
                    <div className="flex h-24 w-full items-center justify-center rounded border border-dashed border-border text-xs text-slate-400 sm:w-32">No image</div>
                )}

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(true)}>
                            Choose from Library
                        </Button>
                        {currentUrl && onClear && (
                            <Button type="button" size="sm" variant="secondary" onClick={onClear}>Remove</Button>
                        )}
                    </div>

                    <label className={`inline-flex w-fit items-center gap-2 text-xs text-slate-600 ${uploadState === 'uploading' ? 'cursor-wait opacity-60' : 'cursor-pointer'}`}>
                        <Upload className="h-3.5 w-3.5" />
                        <span>{uploadState === 'uploading' ? 'Uploading…' : 'Upload new image'}</span>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={uploadState === 'uploading'}
                            className="sr-only"
                            onChange={onFileChange}
                        />
                    </label>

                    <p className="text-xs text-slate-500">JPG, PNG, or WebP. Maximum {uploadToLibrary ? '10' : '5'} MB.</p>
                    {uploadState === 'success' && !visibleError && (
                        <p className="flex items-center gap-1 text-xs text-success">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {uploadToLibrary ? 'Upload complete. Save this section to publish it.' : 'Image selected. Save this form to upload it.'}
                        </p>
                    )}
                    {visibleError && <p role="alert" className="text-sm text-danger">{visibleError}</p>}
                </div>
            </div>

            {open && (
                <Modal
                    onClose={() => setOpen(false)}
                    onSelectPath={(path) => {
                        onSelectPath(path);
                        setUploadState('success');
                        setUploadError(null);
                        setOpen(false);
                    }}
                />
            )}
        </div>
    );
}
