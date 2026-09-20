import assert from 'node:assert/strict';
import test from 'node:test';

import { MediaUploadError, mediaUrl, uploadMedia } from '../../resources/js/lib/media.ts';

test('mediaUrl resolves stored paths without changing absolute sources', () => {
    assert.equal(mediaUrl('library/photo.jpg'), '/storage/library/photo.jpg');
    assert.equal(mediaUrl('/images/static.jpg'), '/images/static.jpg');
    assert.equal(mediaUrl('https://cdn.example.com/photo.jpg'), 'https://cdn.example.com/photo.jpg');
    assert.equal(mediaUrl(null), null);
});

test('uploadMedia surfaces the first server file validation error', async () => {
    const originalFetch = globalThis.fetch;
    const originalDocument = globalThis.document;
    const originalRoute = globalThis.route;

    Object.assign(globalThis, {
        route: () => '/admin/media',
        document: { querySelector: () => ({ content: 'csrf-token' }) },
        fetch: async () => new Response(JSON.stringify({
            message: 'The given data was invalid.',
            errors: { file: ['The file must be an image.'] },
        }), {
            status: 422,
            headers: { 'Content-Type': 'application/json' },
        }),
    });

    try {
        const file = new File(['invalid'], 'payload.exe', { type: 'application/octet-stream' });

        await assert.rejects(
            () => uploadMedia(file),
            (error: unknown) => error instanceof MediaUploadError && error.message === 'The file must be an image.',
        );
    } finally {
        globalThis.fetch = originalFetch;
        globalThis.document = originalDocument;
        globalThis.route = originalRoute;
    }
});
