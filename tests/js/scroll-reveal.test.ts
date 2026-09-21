import assert from 'node:assert/strict';
import test from 'node:test';

import * as reveal from '../../resources/js/hooks/use-in-view.ts';

const revealClass = reveal.revealClass as unknown as (
    inView: boolean,
    variant?: 'up' | 'left' | 'right' | 'scale' | 'fade',
) => string;

const revealDelay = (
    reveal as unknown as {
        revealDelay?: (index: number, step?: number, maximum?: number) => string;
    }
).revealDelay;

test('builds a hidden directional reveal state', () => {
    assert.equal(revealClass(false, 'left'), 'scroll-reveal scroll-reveal--left');
});

test('adds the revealed state without losing the motion variant', () => {
    assert.equal(revealClass(true, 'scale'), 'scroll-reveal scroll-reveal--scale is-revealed');
});

test('caps stagger delay so long collections stay responsive', () => {
    assert.equal(revealDelay?.(0), '0ms');
    assert.equal(revealDelay?.(3), '240ms');
    assert.equal(revealDelay?.(20), '320ms');
});

test('normalizes invalid stagger indexes', () => {
    assert.equal(revealDelay?.(-2), '0ms');
    assert.equal(revealDelay?.(Number.NaN), '0ms');
});
