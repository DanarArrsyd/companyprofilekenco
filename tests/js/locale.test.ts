import assert from 'node:assert/strict';
import test from 'node:test';

import * as locale from '../../resources/js/lib/locale.ts';

const { localizePath, stripLocale, localizedRouteName } = locale as unknown as {
    localizePath: (href: string, locale: 'id' | 'en') => string;
    stripLocale: (path: string) => string;
    localizedRouteName: (name: string, locale: 'id' | 'en') => string;
};

test('keeps default-locale paths at the root', () => {
    assert.equal(localizePath('/products', 'id'), '/products');
    assert.equal(localizePath('/en/products', 'id'), '/products');
});

test('prefixes English paths, including home, anchors and queries', () => {
    assert.equal(localizePath('/', 'en'), '/en');
    assert.equal(localizePath('/products/flange', 'en'), '/en/products/flange');
    assert.equal(localizePath('/company#about', 'en'), '/en/company#about');
    assert.equal(localizePath('/?ref=1', 'en'), '/en?ref=1');
    assert.equal(localizePath('/en/news', 'en'), '/en/news');
});

test('leaves external, protocol and non-page links untouched', () => {
    for (const href of ['https://example.com', '//cdn.test/x', 'mailto:a@b.c', '#top', '/storage/a.png', '/admin/login', '/sitemap.xml']) {
        assert.equal(localizePath(href, 'en'), href);
    }
});

test('strips the locale prefix without touching look-alike paths', () => {
    assert.equal(stripLocale('/en'), '/');
    assert.equal(stripLocale('/en/careers'), '/careers');
    assert.equal(stripLocale('/english-page'), '/english-page');
});

test('maps route names to their locale variant', () => {
    assert.equal(localizedRouteName('public.news', 'id'), 'public.news');
    assert.equal(localizedRouteName('public.news', 'en'), 'en.public.news');
});
