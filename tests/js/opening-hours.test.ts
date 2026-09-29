import assert from 'node:assert/strict';
import test from 'node:test';

import { closedDays, formatDays, formatTimeRange, type OpeningHoursRow } from '../../resources/js/lib/opening-hours.ts';

const schedule: OpeningHoursRow[] = [
    { from: 'mon', to: 'thu', open: '08:00', close: '16:00' },
    { from: 'fri', to: 'fri', open: '08:00', close: '16:30' },
    { from: 'sat', to: 'sat', open: '08:00', close: '13:15' },
];

test('day ranges read naturally in both languages', () => {
    assert.equal(formatDays(schedule[0], 'id'), 'Senin – Kamis');
    assert.equal(formatDays(schedule[0], 'en'), 'Monday – Thursday');
    assert.equal(formatDays(schedule[1], 'id'), 'Jumat');
    assert.equal(formatDays(schedule[2], 'en'), 'Saturday');
});

test('times follow each language convention', () => {
    assert.equal(formatTimeRange(schedule[0], 'id'), '08.00 – 16.00');
    assert.equal(formatTimeRange(schedule[2], 'en'), '08:00 – 13:15');
});

test('days without a row are listed as closed', () => {
    assert.deepEqual(closedDays(schedule), ['sun']);
    assert.deepEqual(closedDays([]), []);
});
