import assert from 'node:assert/strict';
import test from 'node:test';

import * as slug from '../../resources/js/lib/slug.ts';

const { slugify, tidySlugInput } = slug as unknown as { slugify: (text: string) => string; tidySlugInput: (text: string) => string };
const SERVER_RULE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

test('builds server-valid slugs from titles', () => {
    for (const [title, expected] of [
        ['PT Kenco Manufactur Achieves ISO 9001:2015 Certification', 'pt-kenco-manufactur-achieves-iso-9001-2015-certification'],
        ['Précision Parts & Assembly', 'precision-parts-and-assembly'],
        ['  Tool   &  Die -- Design  ', 'tool-and-die-design'],
        ['Kapabilitas Produksi (CNC)', 'kapabilitas-produksi-cnc'],
    ]) {
        assert.equal(slugify(title), expected);
        assert.match(slugify(title), SERVER_RULE);
    }
});

test('tidies typing without fighting the cursor', () => {
    assert.equal(tidySlugInput('New Bracket'), 'new-bracket');
    assert.equal(tidySlugInput('new-'), 'new-');
    assert.equal(tidySlugInput('New  --Bracket'), 'new-bracket');
});
