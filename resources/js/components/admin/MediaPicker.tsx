import {
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    FileText,
    RefreshCw,
    Upload,
    X,
} from 'lucide-react';
import {
    ChangeEvent,
    DragEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
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
    usage_count: number;
}

interface PickerResponse {
    data: PickerItem[];
    current_page: number;
    last_page: number;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

function Modal({
    currentUrl,
    onClose,
    onSelectPath,
}: {
    currentUrl?: string | null;
    onClose: () => void;
    onSelectPath: (path: string) => void;
}) {
    const [items, setItems] = useState<PickerItem[]>([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const activeRequest = useRef<AbortController | null>(null);

    const load = useCallback(async (query: string, page = 1) => {
        activeRequest.current?.abort();
        const controller = new AbortController();
        activeRequest.current = controller;
        setLoading(true);
        setLoadError(null);

        try {
            const params = new URLSearchParams({
                search: query,
                type: 'image',
                page: String(page),
            });
            const response = await fetch(`${route('admin.media.picker')}?${params}`, {
                headers: { Accept: 'application/json' },
                signal: controller.signal,
            });

            if (!response.ok) throw new Error('Media request failed.');

            const result = (await response.json()) as PickerResponse;
            setItems(result.data ?? []);
            setCurrentPage(result.current_page ?? 1);
            setLastPage(result.last_page ?? 1);
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                setLoadError('Media library could not be loaded. Check your connection and retry.');
            }
        } finally {
            if (activeRequest.current === controller) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeout = window.setTimeout(() => void load(search), 300);

        return () => window.clearTimeout(timeout);
    }, [load, search]);

    useEffect(() => {
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', closeOnEscape);

        return () => {
            activeRequest.current?.abort();
            window.removeEventListener('keydown', closeOnEscape);
        };
    }, [onClose]);

    const uploadFile = async (file: File) => {
        setUploading(true);
        setUploadError(null);

        try {
            const uploaded = await uploadMedia(file);
            onSelectPath(uploaded.path);
        } catch (error) {
            setUploadError(
                error instanceof MediaUploadError
                    ? error.message
                    : 'Upload failed. Please try again.',
            );
        } finally {
            setUploading(false);
        }
    };

    const onDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setDragActive(false);
        const file = event.dataTransfer.files?.[0];
        if (file && !uploading) void uploadFile(file);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(event) => event.target === event.currentTarget && onClose()}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="media-picker-title"
                className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded border border-border bg-surface shadow-xl"
            >
                <header className="flex items-start justify-between border-b border-border px-5 py-4 sm:px-6">
                    <div>
                        <h2 id="media-picker-title" className="text-base font-semibold text-foreground">
                            Select from Media Library
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Search existing assets or upload a new image.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded p-1.5 text-slate-500 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label="Close media library"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </header>

                <div className="space-y-4 border-b border-border px-5 py-4 sm:px-6">
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by file name or alt text…"
                        aria-label="Search media"
                        className="max-w-md"
                        autoFocus
                    />

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
                            'flex cursor-pointer items-center justify-center gap-3 rounded border border-dashed border-border bg-muted/40 px-4 py-4 text-sm text-slate-600 transition-colors hover:border-primary hover:bg-muted',
                            dragActive && 'border-primary bg-muted text-foreground',
                            uploading && 'cursor-wait opacity-60',
                        )}
                    >
                        <Upload className="h-5 w-5 text-primary" />
                        <span>
                            <span className="font-medium text-foreground">
                                {uploading ? 'Uploading…' : 'Drop an image here or browse'}
                            </span>
                            <span className="ml-2 text-xs">JPG, PNG, or WebP · max 10 MB</span>
                        </span>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={uploading}
                            className="sr-only"
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) void uploadFile(file);
                                event.target.value = '';
                            }}
                        />
                    </Label>

                    {uploadError && (
                        <div
                            role="alert"
                            className="flex items-start justify-between gap-3 rounded border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
                        >
                            <span>{uploadError}</span>
                            <button type="button" onClick={() => setUploadError(null)} aria-label="Dismiss upload error">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="min-h-64 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                    {loading ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6" aria-label="Loading media">
                            {Array.from({ length: 12 }).map((_, index) => (
                                <div key={index} className="aspect-square animate-pulse rounded bg-muted motion-reduce:animate-none" />
                            ))}
                        </div>
                    ) : loadError ? (
                        <div className="flex min-h-64 flex-col items-center justify-center text-center">
                            <p role="alert" className="max-w-sm text-sm text-danger">{loadError}</p>
                            <Button type="button" size="sm" variant="secondary" className="mt-4" onClick={() => void load(search, currentPage)}>
                                <RefreshCw className="mr-2 h-4 w-4" />Retry
                            </Button>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex min-h-64 flex-col items-center justify-center text-center">
                            <FileText className="h-9 w-9 text-slate-300" />
                            <p className="mt-3 text-sm font-medium text-foreground">No matching images</p>
                            <p className="mt-1 text-sm text-slate-500">Try another search or upload a new image.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                            {items.map((item) => {
                                const selected = item.url === currentUrl;

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => onSelectPath(item.path)}
                                        aria-pressed={selected}
                                        className={cn(
                                            'group relative overflow-hidden rounded border bg-surface text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                                            selected ? 'border-primary ring-1 ring-primary' : 'border-border',
                                        )}
                                    >
                                        <div className="flex aspect-square items-center justify-center bg-muted">
                                            {item.is_image && item.url ? (
                                                <img src={item.url} alt={item.alt_text ?? ''} className="h-full w-full object-cover" />
                                            ) : (
                                                <FileText className="h-8 w-8 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="p-2">
                                            <p className="truncate text-xs font-medium text-foreground">
                                                {item.original_name ?? item.filename}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-slate-400">
                                                Used in {item.usage_count} {item.usage_count === 1 ? 'place' : 'places'}
                                            </p>
                                        </div>
                                        {selected && (
                                            <span className="absolute right-2 top-2 rounded-full bg-primary p-1 text-primary-foreground" aria-label="Currently selected">
                                                <Check className="h-3.5 w-3.5" />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <footer className="flex items-center justify-between border-t border-border px-5 py-3 sm:px-6">
                    <p className="text-xs text-slate-500">Page {currentPage} of {lastPage}</p>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={loading || currentPage <= 1}
                            onClick={() => void load(search, currentPage - 1)}
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" />Previous
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={loading || currentPage >= lastPage}
                            onClick={() => void load(search, currentPage + 1)}
                        >
                            Next<ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                </footer>
            </section>
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
    const opener = useRef<HTMLButtonElement>(null);

    const closeModal = useCallback(() => {
        setOpen(false);
        window.requestAnimationFrame(() => opener.current?.focus());
    }, []);

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
            setUploadError(
                uploadFailure instanceof MediaUploadError
                    ? uploadFailure.message
                    : 'Upload failed. Please try again.',
            );
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
                    <div className="flex h-24 w-full items-center justify-center rounded border border-dashed border-border text-xs text-slate-400 sm:w-32">
                        No image
                    </div>
                )}

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                        <Button ref={opener} type="button" size="sm" variant="secondary" onClick={() => setOpen(true)}>
                            Choose from Library
                        </Button>
                        {currentUrl && onClear && (
                            <Button type="button" size="sm" variant="secondary" onClick={onClear}>Remove</Button>
                        )}
                    </div>

                    <label className={cn(
                        'inline-flex w-fit items-center gap-2 text-xs text-slate-600',
                        uploadState === 'uploading' ? 'cursor-wait opacity-60' : 'cursor-pointer',
                    )}>
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
                            {uploadToLibrary
                                ? 'Upload complete. Save this section to publish it.'
                                : 'Image selected. Save this form to upload it.'}
                        </p>
                    )}
                    {visibleError && <p role="alert" className="text-sm text-danger">{visibleError}</p>}
                </div>
            </div>

            {open && (
                <Modal
                    currentUrl={currentUrl}
                    onClose={closeModal}
                    onSelectPath={(path) => {
                        onSelectPath(path);
                        setUploadState('success');
                        setUploadError(null);
                        closeModal();
                    }}
                />
            )}
        </div>
    );
}
