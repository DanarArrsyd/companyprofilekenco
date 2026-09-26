import assert from 'node:assert/strict';
import test from 'node:test';

const store = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
} as Storage;

const { autoTranslateEnabled, setAutoTranslateEnabled, setAutoTranslateSource, autoTranslateHeaders } = (await import('../../resources/js/lib/auto-translate.ts')) as unknown as {
    autoTranslateEnabled: () => boolean;
    setAutoTranslateEnabled: (on: boolean) => void;
    setAutoTranslateSource: (locale: 'en' | 'id') => void;
    autoTranslateHeaders: (method: string, pathname: string, data: unknown) => Record<string, string>;
};

const form = { title: 'Bracket', translations: { id: { title: 'Braket' } } };

test('is on by default and remembers the choice', () => {
    assert.equal(autoTranslateEnabled(), true);
    setAutoTranslateEnabled(false);
    assert.equal(autoTranslateEnabled(), false);
    setAutoTranslateEnabled(true);
    assert.equal(autoTranslateEnabled(), true);
});

test('only admin saves of translatable forms carry the headers', () => {
    const on = { 'X-Auto-Translate': '1', 'X-Auto-Translate-Source': 'en' };

    assert.deepEqual(autoTranslateHeaders('put', '/admin/products/1', form), on);
    assert.deepEqual(autoTranslateHeaders('post', '/admin/news', form), on);
    assert.deepEqual(autoTranslateHeaders('get', '/admin/products/1/edit', form), {});
    assert.deepEqual(autoTranslateHeaders('post', '/contact', form), {});
    assert.deepEqual(autoTranslateHeaders('post', '/administrator', form), {});
    // Publish / archive buttons post no form: they must not retranslate content.
    assert.deepEqual(autoTranslateHeaders('post', '/admin/products/1/publish', {}), {});
});

test('multipart forms count as translatable too', () => {
    const data = new FormData();
    data.append('translations[id][title]', 'Braket');

    assert.equal(autoTranslateHeaders('post', '/admin/products/1', data)['X-Auto-Translate'], '1');
});

test('the active language tab is the source', () => {
    setAutoTranslateSource('id');
    assert.equal(autoTranslateHeaders('put', '/admin/products/1', form)['X-Auto-Translate-Source'], 'id');
    setAutoTranslateSource('en');
});

test('no header once the admin turns it off', () => {
    setAutoTranslateEnabled(false);
    assert.deepEqual(autoTranslateHeaders('put', '/admin/products/1', form), {});
    setAutoTranslateEnabled(true);
});

test('falls back to on when storage is unavailable', () => {
    (globalThis as unknown as { localStorage: Storage }).localStorage = {
        getItem: () => {
            throw new Error('blocked');
        },
        setItem: () => {
            throw new Error('blocked');
        },
    } as unknown as Storage;

    assert.equal(autoTranslateEnabled(), true);
    assert.doesNotThrow(() => setAutoTranslateEnabled(false));
});
