import assert from 'node:assert/strict';
import test from 'node:test';

import * as navbarState from '../../resources/js/components/public/navbar-scroll.ts';

const { getNavbarHidden } = navbarState;
const shouldRestoreMenuTriggerFocus = (
    navbarState as unknown as {
        shouldRestoreMenuTriggerFocus?: (wasDrawerOpen: boolean, drawerOpen: boolean) => boolean;
    }
).shouldRestoreMenuTriggerFocus;

test('keeps the navbar visible near the top of the page', () => {
    assert.equal(getNavbarHidden({ previousY: 0, currentY: 16, wasHidden: false, drawerOpen: false }), false);
});

test('hides the navbar when scrolling down beyond the top threshold', () => {
    assert.equal(getNavbarHidden({ previousY: 40, currentY: 80, wasHidden: false, drawerOpen: false }), true);
});

test('shows the navbar when scrolling up', () => {
    assert.equal(getNavbarHidden({ previousY: 80, currentY: 40, wasHidden: true, drawerOpen: false }), false);
});

test('keeps the navbar visible while the navigation drawer is open', () => {
    assert.equal(getNavbarHidden({ previousY: 40, currentY: 80, wasHidden: false, drawerOpen: true }), false);
});

test('does not focus the menu trigger during the initial closed state', () => {
    assert.equal(shouldRestoreMenuTriggerFocus?.(false, false), false);
});

test('restores focus to the menu trigger only after an open drawer closes', () => {
    assert.equal(shouldRestoreMenuTriggerFocus?.(true, false), true);
});
