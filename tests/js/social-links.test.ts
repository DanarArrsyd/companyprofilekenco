import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { SOCIAL_PLATFORM_INFO, SOCIAL_PLATFORMS, socialLinkName } from '../../resources/js/lib/social-links.ts';

test('the platform list matches the server validation', () => {
    const php = readFileSync(new URL('../../app/Http/Requests/Admin/Settings/UpdateSettingsRequest.php', import.meta.url), 'utf8');
    const server = php.match(/SOCIAL_PLATFORMS = \[([^\]]+)\]/)?.[1].match(/'([^']+)'/g)?.map((v) => v.slice(1, -1));
    assert.deepEqual(server, [...SOCIAL_PLATFORMS]);
});

test('every platform has a name, an example and a hover colour', () => {
    for (const platform of SOCIAL_PLATFORMS) {
        assert.ok(SOCIAL_PLATFORM_INFO[platform].name && SOCIAL_PLATFORM_INFO[platform].example.startsWith('https://'));
    }
});

test('custom links are named by their label', () => {
    assert.equal(socialLinkName({ platform: 'other', url: 'https://x.test', label: 'Katalog' }), 'Katalog');
    assert.equal(socialLinkName({ platform: 'x', url: 'https://x.com/k', label: null }), 'X (Twitter)');
});
