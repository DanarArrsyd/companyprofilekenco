import assert from 'node:assert/strict';
import test from 'node:test';

process.env.TZ = 'Asia/Jakarta';

const { toDateTimeInput, fromDateTimeInput } = (await import('../../resources/js/lib/datetime-input.ts')) as unknown as {
    toDateTimeInput: (value: string | null | undefined) => string;
    fromDateTimeInput: (value: string) => string;
};

test('shows a stored UTC time in the admin timezone', () => {
    assert.equal(toDateTimeInput('2026-09-25T03:00:00.000000Z'), '2026-09-25T10:00');
    assert.equal(toDateTimeInput('2026-09-24T20:30:00Z'), '2026-09-25T03:30');
});

test('sends the picked local time as UTC', () => {
    assert.equal(fromDateTimeInput('2026-09-25T10:00'), '2026-09-25T03:00:00.000Z');
});

test('round-trips without drifting', () => {
    const stored = '2026-09-25T03:00:00.000Z';
    assert.equal(fromDateTimeInput(toDateTimeInput(stored)), stored);
});

test('empty and invalid values stay empty', () => {
    assert.equal(toDateTimeInput(null), '');
    assert.equal(toDateTimeInput(''), '');
    assert.equal(toDateTimeInput('not a date'), '');
    assert.equal(fromDateTimeInput(''), '');
});
