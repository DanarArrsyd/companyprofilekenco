import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import test from 'node:test';

import * as utils from '../../resources/js/lib/utils.ts';

const { cn } = utils as unknown as { cn: (...inputs: string[]) => string };

const root = new URL('../../', import.meta.url).pathname;

function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        return statSync(path).isDirectory() ? sourceFiles(path) : /\.tsx?$/.test(name) ? [path] : [];
    });
}

// Public site only — admin still carries Breeze defaults until it is migrated.
const publicFiles = [
    ...sourceFiles(join(root, 'resources/js/pages/public')),
    ...sourceFiles(join(root, 'resources/js/components/public')),
    join(root, 'resources/js/layouts/PublicLayout.tsx'),
];

/** Every `pattern` match in public code, as `path:line match` (first capture group when present). */
function violations(pattern: RegExp): string[] {
    return publicFiles.flatMap((file) =>
        readFileSync(file, 'utf8')
            .split('\n')
            .flatMap((line, index) => [...line.matchAll(pattern)].map((match) => `${relative(root, file)}:${index + 1} ${match[1] ?? match[0]}`)),
    );
}

// DESIGN.md palette as mapped in tailwind.config.js. Tailwind still ships its
// default colours, so anything else silently renders an off-brand hue.
const COLOR_UTILITY = /\b(?:bg|text|border|ring|ring-offset|from|via|to|fill|stroke|outline|divide|decoration|placeholder|caret|accent|shadow)-((?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|navy)-\d{2,3})\b/g;
const PALETTE = new Set(['navy-950', 'navy-900', 'navy-800', 'navy-700', 'slate-700', 'slate-500', 'gray-200', 'gray-100']);

test('public code only uses DESIGN.md palette colours', () => {
    const offPalette = violations(COLOR_UTILITY).filter((hit) => !PALETTE.has(hit.split(' ')[1]));
    assert.deepEqual(offPalette, []);
});

test('public code uses the design type scale, not Tailwind defaults', () => {
    // text-small, text-body, text-h2 … carry the DESIGN.md line-heights.
    assert.deepEqual(violations(/\btext-(?:xs|sm|base|lg|[2-9]?xl)\b/g), []);
});

test('public code has no hard-coded hex colours', () => {
    assert.deepEqual(violations(/\[#[0-9a-fA-F]{3,8}\]|['"]#[0-9a-fA-F]{3,8}['"]/g), []);
});

test('public sizes are rem so proportional desktop scaling applies', () => {
    // Breakpoint variants such as max-[379px]: are viewport queries, not sizes.
    assert.deepEqual(violations(/(?<!(?:min|max)-)\[\d+(?:\.\d+)?px\]/g), []);
});

test('cn() keeps design type-scale classes next to text colours', () => {
    assert.equal(cn('text-small', 'text-white'), 'text-small text-white');
    assert.equal(cn('text-sm', 'text-small'), 'text-small');
    assert.equal(cn('text-h2 text-navy-900', 'text-h3'), 'text-navy-900 text-h3');
});
