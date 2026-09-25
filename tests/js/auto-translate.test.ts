import assert from 'node:assert/strict';
import test from 'node:test';

const store = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
} as Storage;

const { autoTranslateEnabled, setAutoTranslateEnabled, autoTranslateHeaders } = (await import('../../resources/js/lib/auto-translate.ts')) as unknown as {
    autoTranslateEnabled: () => boolean;
    setAutoTranslateEnabled: (on: boolean) => void;
    autoTranslateHeaders: (method: string, pathname: string) => Record<string, string>;
};

test('is on by default and remembers the choice', () => {
    assert.equal(autoTranslateEnabled(), true);
    setAutoTranslateEnabled(false);
    assert.equal(autoTranslateEnabled(), false);
    setAutoTranslateEnabled(true);
    assert.equal(autoTranslateEnabled(), true);
});

test('only admin saves carry the header', () => {
    assert.deepEqual(autoTranslateHeaders('put', '/admin/products/1'), { 'X-Auto-Translate': '1' });
    assert.deepEqual(autoTranslateHeaders('post', '/admin/news'), { 'X-Auto-Translate': '1' });
    assert.deepEqual(autoTranslateHeaders('get', '/admin/products/1/edit'), {});
    assert.deepEqual(autoTranslateHeaders('post', '/contact'), {});
    assert.deepEqual(autoTranslateHeaders('post', '/administrator'), {});
});

test('no header once the admin turns it off', () => {
    setAutoTranslateEnabled(false);
    assert.deepEqual(autoTranslateHeaders('put', '/admin/products/1'), {});
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
