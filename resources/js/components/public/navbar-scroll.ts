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

export function getNavbarTransformClass(navbarHidden: boolean, drawerOpen: boolean): string {
    if (drawerOpen) return 'transform-none';

    return navbarHidden ? '-translate-y-full' : 'translate-y-0';
}

export function getNavbarSurfaceClass(transparentHero: boolean, drawerOpen: boolean): string {
    if (transparentHero || drawerOpen) return 'bg-transparent';

    return 'border-b border-white/30 bg-white/60 backdrop-blur-md';
}

export function getBodyScrollLockStyles(scrollY: number): Record<string, string> {
    return {
        position: 'fixed',
        top: `-${scrollY}px`,
        left: '0',
        right: '0',
        width: '100%',
    };
}
