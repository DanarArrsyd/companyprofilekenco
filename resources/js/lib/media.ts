export interface UploadedMedia {
    id: number;
    path: string;
    url: string;
}

export class MediaUploadError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MediaUploadError';
    }
}

export function mediaUrl(path?: string | null): string | null {
    if (!path) return null;

    if (/^(https?:)?\/\//.test(path) || path.startsWith('blob:') || path.startsWith('data:') || path.startsWith('/')) {
        return path;
    }

    return `/storage/${path.replace(/^\/+/, '')}`;
}

export async function uploadMedia(file: File): Promise<UploadedMedia> {
    const formData = new FormData();
    formData.append('file', file);

    let response: Response;

    try {
        response = await fetch(route('admin.media.store'), {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: formData,
        });
    } catch {
        throw new MediaUploadError('Upload failed. Check your connection and try again.');
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        throw new MediaUploadError(payload?.errors?.file?.[0] ?? payload?.message ?? 'Upload failed. Please try again.');
    }

    if (!payload?.path || !payload?.url) {
        throw new MediaUploadError('Upload completed but the media response was invalid.');
    }

    return payload as UploadedMedia;
}
