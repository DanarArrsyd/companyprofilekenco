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

const { stepProgress, TRICKLE_CAP } = await import('../../resources/js/lib/page-loader-rules.ts');

const run = (state: Parameters<typeof stepProgress>[0], seconds: number) => {
    let next = state;
    for (let t = 0; t < seconds; t += 1 / 60) next = stepProgress(next, 1 / 60);
    return next;
};

test('without milestones the runner crawls but never reaches the end', () => {
    const start = { shown: 0.2, target: 0.2, floor: 0.2, done: false, exit: 1.2 };
    const after2s = run(start, 2);
    const after20s = run(start, 20);

    assert.ok(after2s.shown > 0.3, 'it keeps moving');
    assert.ok(after20s.shown < TRICKLE_CAP + 1e-9, 'it never fakes a finish');
});

test('a milestone is reached with a capped, smooth sprint and never goes back', () => {
    let state = { shown: 0.1, target: 0.1, floor: 0.7, done: false, exit: 1.2 };
    let previous = state.shown;
    for (let i = 0; i < 60; i += 1) {
        state = stepProgress(state, 1 / 60);
        assert.ok(state.shown >= previous, 'monotonic');
        assert.ok(state.shown - previous <= 1.5 / 60 + 1e-9, 'speed capped');
        previous = state.shown;
    }
    assert.ok(state.shown > 0.6);
});

test('once done the runner leaves the rail in bounded time', () => {
    const state = run({ shown: 0.5, target: 0.5, floor: 0.5, done: true, exit: 1.2 }, 1.2);
    assert.ok(state.shown >= 1.2);
});
