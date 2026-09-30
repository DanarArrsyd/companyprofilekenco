import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import * as lib from '../../resources/js/lib/responsive-image.ts';

const { responsiveImage, VARIANT_WIDTHS } = lib as unknown as typeof import('../../resources/js/lib/responsive-image.ts');

test('stored images get WebP variants at every width', () => {
    const sources = responsiveImage('library/photo.png', '100vw');

    assert.equal(sources.src, '/storage/_variants/w960/library/photo.png.webp');
    assert.equal(sources.sizes, '100vw');
    assert.equal(
        sources.srcSet,
        '/storage/_variants/w480/library/photo.png.webp 480w, /storage/_variants/w960/library/photo.png.webp 960w, /storage/_variants/w1440/library/photo.png.webp 1440w, /storage/_variants/w2000/library/photo.png.webp 2000w',
    );
});

test('a /storage/ prefixed path is treated as stored', () => {
    assert.equal(responsiveImage('/storage/library/a.jpg', '50vw').src, '/storage/_variants/w960/library/a.jpg.webp');
});

test('anything else passes through untouched', () => {
    assert.deepEqual(responsiveImage(null, '100vw'), {});
    assert.deepEqual(responsiveImage('https://cdn.example.com/a.jpg', '100vw'), { src: 'https://cdn.example.com/a.jpg' });
    assert.deepEqual(responsiveImage('library/icon.svg', '100vw'), { src: '/storage/library/icon.svg' });
    assert.deepEqual(responsiveImage('/images/local.png', '100vw'), { src: '/images/local.png' });
    assert.deepEqual(responsiveImage('_variants/w480/a.png.webp', '100vw'), { src: '/storage/_variants/w480/a.png.webp' });
    assert.deepEqual(responsiveImage('library/../secret.png', '100vw'), { src: '/storage/library/../secret.png' });
});

test('widths match the server-side ImageVariantService', () => {
    const php = readFileSync(new URL('../../app/Services/ImageVariantService.php', import.meta.url), 'utf8');
    const widths = php.match(/WIDTHS = \[([^\]]+)\]/)?.[1].split(',').map((w) => Number(w.trim()));

    assert.deepEqual(widths, [...VARIANT_WIDTHS]);
});
