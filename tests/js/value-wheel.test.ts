import assert from 'node:assert/strict';
import test from 'node:test';

import * as wheel from '../../resources/js/lib/value-wheel.ts';

const { labelFlipped, sectorPath, shortestSteps, valueColor, wheelPoint, WHEEL } = wheel as unknown as typeof import('../../resources/js/lib/value-wheel.ts');

test('shortestSteps goes the short way round and wraps', () => {
    assert.equal(shortestSteps(0, 1, 5), 1);
    assert.equal(shortestSteps(0, 4, 5), -1);
    assert.equal(shortestSteps(4, 0, 5), 1);
    assert.equal(shortestSteps(0, 2, 5), 2);
    assert.equal(shortestSteps(0, 3, 5), -2);
    assert.equal(shortestSteps(2, 2, 5), 0);
});

test('labels on the lower half of the wheel are flipped so they read upright', () => {
    // Five values, active one at 0° (right): positions 0, 72, 144, 216, 288.
    assert.equal(labelFlipped(0, 0), false);
    assert.equal(labelFlipped(72, 0), true);
    assert.equal(labelFlipped(144, 0), true);
    assert.equal(labelFlipped(216, 0), false);
    assert.equal(labelFlipped(288, 0), false);
    // After one step forward the wheel has turned -72°.
    assert.equal(labelFlipped(72, -72), false);
    assert.equal(labelFlipped(0, -72), false);
});

test('valueColor keeps a chosen preset and falls back to the design order', () => {
    assert.equal(valueColor('blue', 0), 'blue');
    assert.equal(valueColor(null, 0), 'green');
    assert.equal(valueColor('purple', 2), 'red');
    assert.equal(valueColor(undefined, 5), 'green');
});

test('sectors are closed ring pieces inside the wheel', () => {
    const path = sectorPath(0, 72, WHEEL.sliceInner, WHEEL.sliceOuter);
    assert.match(path, /^M[\d.]+ [\d.]+A239 239 0 0 1 [\d.]+ [\d.]+L[\d.]+ [\d.]+A94 94 0 0 0 [\d.]+ [\d.]+Z$/);
    assert.deepEqual(wheelPoint(WHEEL.bandOuter, 0), [WHEEL.centre + WHEEL.bandOuter, WHEEL.centre]);
});
