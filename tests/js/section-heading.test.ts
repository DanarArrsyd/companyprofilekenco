import assert from 'node:assert/strict';
import test from 'node:test';

import { getSectionHeadingClass } from '../../resources/js/components/public/section-heading.ts';

test('uses the larger Caveat display treatment when section settings request it', () => {
    assert.equal(
        getSectionHeadingClass({ heading_font: 'caveat' }),
        'font-caveat text-[clamp(2.75rem,1.75rem+4vw,4.5rem)] leading-[1.05] font-semibold',
    );
});

test('keeps the normal heading scale when no display font is configured', () => {
    assert.equal(getSectionHeadingClass(null), 'text-h2 text-navy-900');
});
