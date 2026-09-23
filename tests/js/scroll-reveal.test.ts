import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import * as reveal from '../../resources/js/hooks/use-in-view.ts';

const revealClass = reveal.revealClass as unknown as (
    inView: boolean,
    variant?: 'up' | 'left' | 'right' | 'scale' | 'fade' | 'image',
) => string;

const revealDelay = (
    reveal as unknown as {
        revealDelay?: (index: number, step?: number, maximum?: number) => string;
    }
).revealDelay;

const scrollRevealObserverOptions = (
    reveal as unknown as {
        scrollRevealObserverOptions?: { threshold: number; rootMargin: string };
    }
).scrollRevealObserverOptions;

const preferExplicitRevealTargets = (
    reveal as unknown as {
        preferExplicitRevealTargets?: <T>(targets: T[]) => T[];
    }
).preferExplicitRevealTargets;

test('builds a hidden directional reveal state', () => {
    assert.equal(revealClass(false, 'left'), 'scroll-reveal scroll-reveal--left');
});

test('adds the revealed state without losing the motion variant', () => {
    assert.equal(revealClass(true, 'scale'), 'scroll-reveal scroll-reveal--scale is-revealed');
});

test('builds a masked reveal state for editorial imagery', () => {
    assert.equal(revealClass(false, 'image'), 'scroll-reveal scroll-reveal--image');
});

test('defines an image mask transition that opens when revealed', () => {
    const css = readFileSync(new URL('../../resources/css/app.css', import.meta.url), 'utf8');

    assert.match(css, /\.scroll-reveal--image\s*\{[^}]*clip-path:\s*inset\(0 0 99% 0\)/s);
    assert.match(css, /\.scroll-reveal--image\.is-revealed\s*\{[^}]*clip-path:\s*inset\(0\)/s);
});

test('safelists runtime reveal variants for production CSS', () => {
    const config = readFileSync(new URL('../../tailwind.config.js', import.meta.url), 'utf8');

    for (const variant of ['up', 'left', 'right', 'scale', 'fade', 'image']) {
        assert.match(config, new RegExp(`['\"]scroll-reveal--${variant}['\"]`));
    }
});

test('caps stagger delay so long collections stay responsive', () => {
    assert.equal(revealDelay?.(0), '0ms');
    assert.equal(revealDelay?.(3), '270ms');
    assert.equal(revealDelay?.(20), '360ms');
});

test('normalizes invalid stagger indexes', () => {
    assert.equal(revealDelay?.(-2), '0ms');
    assert.equal(revealDelay?.(Number.NaN), '0ms');
});

test('uses a clipped-image-safe observer threshold', () => {
    assert.equal(scrollRevealObserverOptions?.threshold, 0);
    assert.equal(scrollRevealObserverOptions?.rootMargin, '0px 0px -8% 0px');
});

test('drops an automatic ancestor when an explicit reveal exists inside it', () => {
    const makeNode = (explicit = false) => ({
        explicit,
        parentElement: null as null | { hasAttribute: (name: string) => boolean },
        descendants: [] as object[],
        hasAttribute(name: string) {
            return name === 'data-reveal' && this.explicit;
        },
        contains(target: object) {
            return this.descendants.includes(target);
        },
    });
    const automaticAncestor = makeNode();
    const explicitChild = makeNode(true);
    const automaticSibling = makeNode();
    automaticAncestor.descendants.push(explicitChild);

    assert.equal(typeof preferExplicitRevealTargets, 'function');
    assert.deepEqual(
        preferExplicitRevealTargets?.([automaticAncestor, explicitChild, automaticSibling]),
        [explicitChild, automaticSibling],
    );
});
