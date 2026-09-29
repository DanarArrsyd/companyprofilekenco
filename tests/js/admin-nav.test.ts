import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// admin-nav.ts imports lucide-react icons; read it as text so the test stays dependency-free.
const source = readFileSync(new URL('../../resources/js/lib/admin-nav.ts', import.meta.url), 'utf8');

const hrefs = [...source.matchAll(/href: '([^']+)'/g)].map((m) => m[1]);
const headings = [...source.matchAll(/heading: (null|'[^']+')/g)].map((m) => m[1]);

test('every nav route appears once', () => {
    assert.ok(hrefs.length > 15);
    assert.equal(new Set(hrefs).size, hrefs.length);
});

test('the sidebar is grouped by website page, then Data Master and Sistem', () => {
    assert.deepEqual(headings, ["null", "'Halaman Website'", "'Konten'", "'Data Master / Opsi'", "'Sistem'"]);
});

test('menu labels are Indonesian', () => {
    for (const english of ["'Dashboard'", "'Settings'", "'Job Vacancies'", "'Contact Inquiries'", "'Machines'", "'Activity Logs'"]) {
        assert.ok(!source.includes(`label: ${english}`) && !source.includes(`name: ${english}`), `${english} is still in the menu`);
    }
});
