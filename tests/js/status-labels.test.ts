import assert from 'node:assert/strict';
import test from 'node:test';

import { statusLabel } from '../../resources/js/lib/status-labels.ts';

test('locked status values show Indonesian labels', () => {
    assert.equal(statusLabel('draft'), 'Draf');
    assert.equal(statusLabel('published'), 'Tayang');
    assert.equal(statusLabel('archived'), 'Diarsipkan');
});

test('unknown values fall back to the raw value', () => {
    assert.equal(statusLabel('something-new'), 'something-new');
});
