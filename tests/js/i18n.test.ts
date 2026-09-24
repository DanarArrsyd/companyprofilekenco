import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

import * as i18n from '../../resources/js/lib/i18n.ts';

const { translate, intlLocale } = i18n as unknown as {
    translate: (key: string, locale?: 'id' | 'en', replacements?: Record<string, string | number>) => string;
    intlLocale: (locale: 'id' | 'en') => string;
};

const catalogue = JSON.parse(readFileSync(new URL('../../lang/id.json', import.meta.url), 'utf8')) as Record<string, string>;

function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        return statSync(path).isDirectory() ? sourceFiles(path) : /\.tsx?$/.test(name) ? [path] : [];
    });
}

test('translates English source text into Indonesian', () => {
    assert.equal(translate('Contact Us', 'id'), 'Hubungi Kami');
    assert.equal(translate('Contact Us', 'en'), 'Contact Us');
});

test('falls back to the English source when a key is missing', () => {
    assert.equal(translate('Not in the catalogue', 'id'), 'Not in the catalogue');
});

test('fills :placeholders in both locales', () => {
    assert.equal(translate('Valid until :date', 'id', { date: '1 Jan 2027' }), 'Berlaku hingga 1 Jan 2027');
    assert.equal(translate('Error :status', 'en', { status: 404 }), 'Error 404');
});

test('maps locales to Intl tags', () => {
    assert.equal(intlLocale('id'), 'id-ID');
    assert.equal(intlLocale('en'), 'en-GB');
});

test('every literal t() key in public UI has an Indonesian translation', () => {
    const root = new URL('../../resources/js/', import.meta.url).pathname;
    const files = [
        ...sourceFiles(join(root, 'pages/public')),
        ...sourceFiles(join(root, 'components/public')),
        join(root, 'pages/Error.tsx'),
    ];

    const missing = files.flatMap((file) =>
        [...readFileSync(file, 'utf8').matchAll(/\bt\(\s*'((?:[^'\\]|\\.)+)'/g)]
            .map((match) => match[1].replace(/\\'/g, "'"))
            .filter((key) => !catalogue[key])
            .map((key) => `${file.replace(root, '')}: ${key}`),
    );

    assert.deepEqual(missing, []);
});
