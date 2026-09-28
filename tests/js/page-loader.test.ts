import assert from 'node:assert/strict';
import test from 'node:test';

import { pagePath, shouldCover } from '../../resources/js/lib/page-loader-rules.ts';

const current = new URL('https://staging.kencomanufactur.co.id/products');

const visit = (href: string, overrides: Record<string, unknown> = {}) => ({
    url: new URL(href, current),
    method: 'get',
    prefetch: false,
    async: false,
    only: [] as string[],
    except: [] as string[],
    ...overrides,
});

test('pagePath drops the English prefix and trailing slashes', () => {
    assert.equal(pagePath(new URL('https://x.test/en')), '/');
    assert.equal(pagePath(new URL('https://x.test/en/')), '/');
    assert.equal(pagePath(new URL('https://x.test/en/company')), '/company');
    assert.equal(pagePath(new URL('https://x.test/company/')), '/company');
    assert.equal(pagePath(new URL('https://x.test/english-page')), '/english-page');
});

test('a visit to another public page is covered', () => {
    assert.equal(shouldCover(visit('/company#values'), current), true);
    assert.equal(shouldCover(visit('/en/news'), current), true);
});

test('same page, language switches, filters and background visits are not covered', () => {
    assert.equal(shouldCover(visit('/products?category=dies'), current), false);
    assert.equal(shouldCover(visit('/en/products'), current), false);
    assert.equal(shouldCover(visit('/company', { method: 'post' }), current), false);
    assert.equal(shouldCover(visit('/company', { prefetch: true }), current), false);
    assert.equal(shouldCover(visit('/company', { async: true }), current), false);
    assert.equal(shouldCover(visit('/company', { only: ['menuNews'] }), current), false);
    assert.equal(shouldCover(visit('/admin'), current), false);
});
