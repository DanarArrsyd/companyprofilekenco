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

export function shouldRestoreMenuTriggerFocus(wasDrawerOpen: boolean, drawerOpen: boolean): boolean {
    return wasDrawerOpen && !drawerOpen;
}

export function getNavbarTransformClass(navbarHidden: boolean, drawerOpen: boolean): string {
    if (drawerOpen) return 'transform-none';

    return navbarHidden ? '-translate-y-full' : 'translate-y-0';
}
