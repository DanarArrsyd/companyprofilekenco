import assert from 'node:assert/strict';
import test from 'node:test';

import * as navbarState from '../../resources/js/components/public/navbar-scroll.ts';

const { getNavbarHidden } = navbarState;
const shouldRestoreMenuTriggerFocus = (
    navbarState as unknown as {
        shouldRestoreMenuTriggerFocus?: (wasDrawerOpen: boolean, drawerOpen: boolean) => boolean;
    }
).shouldRestoreMenuTriggerFocus;
const getNavbarTransformClass = (
    navbarState as unknown as {
        getNavbarTransformClass?: (navbarHidden: boolean, drawerOpen: boolean) => string;
    }
).getNavbarTransformClass;
const getTrappedFocusIndex = (
    navbarState as unknown as {
        getTrappedFocusIndex?: (currentIndex: number, total: number, backwards: boolean) => number | null;
    }
).getTrappedFocusIndex;
const getBodyScrollLockStyles = (
    navbarState as unknown as {
        getBodyScrollLockStyles?: (scrollbarWidth?: number) => Record<string, string>;
    }
).getBodyScrollLockStyles;
const createNavbarHiddenUpdater = (
    navbarState as unknown as {
        createNavbarHiddenUpdater?: (input: {
            previousY: number;
            currentY: number;
            drawerOpen: boolean;
        }) => (wasHidden: boolean) => boolean;
    }
).createNavbarHiddenUpdater;

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

test('removes the header transform while the viewport-fixed drawer is open', () => {
    assert.equal(getNavbarTransformClass?.(false, true), 'transform-none');
});

test('slides the logo tab away only while the menu is closed', () => {
    assert.equal(getNavbarTransformClass?.(true, false), '-translate-y-full');
    assert.equal(getNavbarTransformClass?.(false, false), 'translate-y-0');
});

test('wraps focus from the last menu element back to the first', () => {
    assert.equal(getTrappedFocusIndex?.(4, 5, false), 0);
});

test('wraps Shift+Tab from the first menu element to the last', () => {
    assert.equal(getTrappedFocusIndex?.(0, 5, true), 4);
});

test('pulls stray focus back into the menu', () => {
    assert.equal(getTrappedFocusIndex?.(-1, 5, false), 0);
    assert.equal(getTrappedFocusIndex?.(-1, 5, true), 4);
});

test('leaves focus moves between inner menu elements to the browser', () => {
    assert.equal(getTrappedFocusIndex?.(2, 5, false), null);
    assert.equal(getTrappedFocusIndex?.(0, 0, false), null);
});

test('the menu lock never moves the body, so the page keeps its scroll position', () => {
    const styles = getBodyScrollLockStyles?.(0) ?? {};

    assert.equal(styles.position, undefined);
    assert.equal(styles.top, undefined);
});

test('captures the previous position before React evaluates the state update', () => {
    const updateHidden = createNavbarHiddenUpdater?.({ previousY: 40, currentY: 80, drawerOpen: false });

    assert.equal(updateHidden?.(false), true);
});

test('pads the locked page by the scrollbar it hides so the layout keeps its width', () => {
    assert.equal(getBodyScrollLockStyles?.(10).paddingRight, '10px');
    assert.equal(getBodyScrollLockStyles?.(0).paddingRight, undefined);
});
