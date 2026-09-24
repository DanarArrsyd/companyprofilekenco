import assert from 'node:assert/strict';
import test from 'node:test';

import * as form from '../../resources/js/lib/translatable-form.ts';

type Locale = 'en' | 'id';
const { readText, writeText, englishOf, initialTranslations, translatableBinder, translatableError, countTranslated } = form as unknown as {
    readText: (value: unknown, locale: Locale) => string;
    writeText: (value: unknown, locale: Locale, next: string) => unknown;
    englishOf: (value: unknown) => string;
    initialTranslations: (source: object | null, fields: string[]) => { id: Record<string, string> };
    translatableBinder: <T extends { translations: { id: Record<string, string> } }>(
        data: T,
        setData: (updater: (previous: T) => T) => void,
        locale: Locale,
    ) => (field: string) => { value: string; placeholder?: string; onChange: (next: string) => void };
    translatableError: (errors: Record<string, string>, field: string, locale: Locale, prefix?: string) => string | undefined;
    countTranslated: (values: Record<string, string>) => number;
};

test('reads legacy strings as English with a blank translation', () => {
    assert.equal(readText('Built to Last', 'en'), 'Built to Last');
    assert.equal(readText('Built to Last', 'id'), '');
    assert.equal(englishOf({ en: 'Hello', id: 'Halo' }), 'Hello');
});

test('writing a translation turns a legacy string into a locale map', () => {
    assert.deepEqual(writeText('Built to Last', 'id', 'Dibuat untuk Bertahan'), { en: 'Built to Last', id: 'Dibuat untuk Bertahan' });
});

test('editing English keeps the existing translation', () => {
    assert.deepEqual(writeText({ en: 'Old', id: 'Lama' }, 'en', 'New'), { en: 'New', id: 'Lama' });
});

test('clearing the translation collapses back to a plain string', () => {
    assert.equal(writeText({ en: 'Built to Last', id: 'Dibuat' }, 'id', '  '), 'Built to Last');
});

test('seeds form translations from the admin payload', () => {
    assert.deepEqual(initialTranslations({ translations: { id: { name: 'Komponen', description: null } } }, ['name', 'description']), {
        id: { name: 'Komponen', description: '' },
    });
    assert.deepEqual(initialTranslations(null, ['name']), { id: { name: '' } });
});

test('binds fields to English or the translation with the English text as a hint', () => {
    let data = { name: 'Stamped Parts', translations: { id: { name: '' } } };
    const setData = (updater: (previous: typeof data) => typeof data) => { data = updater(data); };

    const english = translatableBinder(data, setData, 'en')('name');
    assert.equal(english.value, 'Stamped Parts');
    assert.equal(english.placeholder, undefined);

    const indonesian = translatableBinder(data, setData, 'id')('name');
    assert.equal(indonesian.value, '');
    assert.equal(indonesian.placeholder, 'Stamped Parts');

    indonesian.onChange('Komponen Stamping');
    assert.equal(data.translations.id.name, 'Komponen Stamping');
    assert.equal(data.name, 'Stamped Parts');
});

test('reports errors for the active tab and counts filled translations', () => {
    const errors = { name: 'EN error', 'translations.id.name': 'ID error', 'seo.translations.id.meta_title': 'SEO ID error' };

    assert.equal(translatableError(errors, 'name', 'en'), 'EN error');
    assert.equal(translatableError(errors, 'name', 'id'), 'ID error');
    assert.equal(translatableError(errors, 'meta_title', 'id', 'seo.'), 'SEO ID error');
    assert.equal(countTranslated({ name: 'Komponen', description: ' ' }), 1);
});
