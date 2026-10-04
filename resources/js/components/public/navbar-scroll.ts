interface NavbarScrollState {
    previousY: number;
    currentY: number;
    wasHidden: boolean;
    drawerOpen: boolean;
}

const TOP_THRESHOLD = 24;

export function getNavbarHidden({ previousY, currentY, wasHidden, drawerOpen }: NavbarScrollState): boolean {
    if (drawerOpen || currentY <= TOP_THRESHOLD) return false;
    if (currentY > previousY) return true;
    if (currentY < previousY) return false;

    return wasHidden;
}

export function createNavbarHiddenUpdater({
    previousY,
    currentY,
    drawerOpen,
}: Omit<NavbarScrollState, 'wasHidden'>): (wasHidden: boolean) => boolean {
    return (wasHidden) => getNavbarHidden({ previousY, currentY, wasHidden, drawerOpen });
}

export function shouldRestoreMenuTriggerFocus(wasDrawerOpen: boolean, drawerOpen: boolean): boolean {
    return wasDrawerOpen && !drawerOpen;
}

/** Slide the logo tab away on scroll-down; keep it put while the menu is open. */
export function getNavbarTransformClass(navbarHidden: boolean, drawerOpen = false): string {
    if (drawerOpen) return 'transform-none';

    return navbarHidden ? '-translate-y-full' : 'translate-y-0';
}

/**
 * Body styles that freeze the page under the open menu. `scrollbarWidth` is the
 * classic scrollbar the lock removes (0 for overlay scrollbars); padding the body
 * by it keeps the layout from widening, so nothing jumps as the menu opens/closes.
 */
export function getBodyScrollLockStyles(scrollY: number, scrollbarWidth = 0): Record<string, string> {
    return {
        position: 'fixed',
        top: `-${scrollY}px`,
        left: '0',
        right: '0',
        width: '100%',
        ...(scrollbarWidth > 0 ? { paddingRight: `${scrollbarWidth}px` } : {}),
    };
}

/**
 * Focus-trap step for the open menu: Tab past the last focusable element
 * wraps to the first, Shift+Tab before the first wraps to the last.
 * Returns null when the browser's default move should stand.
 */
export function getTrappedFocusIndex(currentIndex: number, total: number, backwards: boolean): number | null {
    if (total === 0) return null;
    if (currentIndex === -1) return backwards ? total - 1 : 0;
    if (backwards && currentIndex === 0) return total - 1;
    if (!backwards && currentIndex === total - 1) return 0;

    return null;
}
