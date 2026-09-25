import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

import * as help from '../../resources/js/lib/admin-field-help.ts';

const { fieldHelp } = help as unknown as { fieldHelp: (module: string, field: string) => { hint?: string; example?: string } };

const pagesDir = new URL('../../resources/js/pages/admin/', import.meta.url).pathname;
const source = readFileSync(new URL('../../resources/js/lib/admin-field-help.ts', import.meta.url), 'utf8');
const moduleKeys = [...source.matchAll(/'([\w-]+):(\w+)'/g)].map(([, module, field]) => ({ module, field }));

test('every module-specific help entry points at a real admin form field', () => {
    const missing = moduleKeys.filter(({ module, field }) => {
        const dir = join(pagesDir, module);
        if (!existsSync(dir)) return true;

        const forms = readdirSync(dir)
            .filter((name) => /^(Create|Edit)\.tsx$/.test(name))
            .map((name) => readFileSync(join(dir, name), 'utf8'))
            .join('\n');

        return !forms.includes(`'${field}'`) && !forms.includes(`"${field}"`);
    });

    assert.deepEqual(missing, []);
});

test('module entries override the shared help', () => {
    assert.equal(fieldHelp('products', 'material').example, 'SPCC, SPHC, SUS 304');
    assert.match(fieldHelp('products', 'status').hint ?? '', /Draft/);
    assert.deepEqual(fieldHelp('products', 'unknown_field'), {});
});
