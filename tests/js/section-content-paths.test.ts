import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Auto-translate only fills the section content keys PageSection lists;
// they must match the text keys the admin section editor writes.
test('PageSection::translatableContentPaths matches the section editor text keys', () => {
    const editor = readFileSync(new URL('../../resources/js/components/admin/SectionContentFields.tsx', import.meta.url), 'utf8');
    const model = readFileSync(new URL('../../app/Models/PageSection.php', import.meta.url), 'utf8');

    const editorKeys = new Set([...editor.matchAll(/setText\('(\w+)'/g)].map((match) => match[1]));
    if (/writeText\(next\[index\]\.label/.test(editor)) editorKeys.add('items.*.label');

    const body = model.match(/function translatableContentPaths\(\): array\s*\{([\s\S]*?)\n    \}/)?.[1] ?? '';
    const modelKeys = new Set([...body.matchAll(/'([\w.*]+)'/g)].map((match) => match[1]));

    assert.deepEqual([...modelKeys].sort(), [...editorKeys].sort());
});
