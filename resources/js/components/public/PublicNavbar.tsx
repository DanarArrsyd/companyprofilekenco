import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import { MouseEvent, useEffect, useRef, useState } from 'react';

import logoKmi from '../../../img/logo_kmi.png';

import {
    createNavbarHiddenUpdater,
    getBodyScrollLockStyles,
    getNavbarSurfaceClass,
    getNavbarTransformClass,
    shouldRestoreMenuTriggerFocus,
} from '@/components/public/navbar-scroll';

interface NavLink {
    label: string;
    href: string;
}

interface NavItem {
    label: string;
    href?: string;
    children?: NavLink[];
}

const NAV: NavItem[] = [
    { label: 'Company', children: [
        { label: 'About', href: '/company#about' },
        { label: 'Vision & Mission', href: '/company#vision-mission' },
        { label: 'Facilities', href: '/company#facilities' },
        { label: 'Industries', href: '/company#industries' },
    ] },
    { label: 'Capabilities', href: '/capabilities' },
    { label: 'Products', href: '/products' },
    { label: 'Quality', children: [
        { label: 'Quality Commitment', href: '/quality' },
        { label: 'Certifications', href: '/certifications' },
    ] },
    { label: 'News', href: '/news' },
    { label: 'Career', href: '/careers' },
    { label: 'Contact Us', href: '/contact' },
];

function isActive(currentUrl: string, href: string): boolean {
    return href === '/' ? currentUrl === '/' : currentUrl.startsWith(href);
}

/**
 * A submenu link like "/company#facilities" only needs an Inertia visit when
 * navigating there from a different page — if we're already on /company,
 * jump straight to the section instead of round-tripping through a full
 * page fetch just to change the hash.
 */
function handleAnchorLinkClick(e: MouseEvent, href: string, closeMenu: () => void) {
    const hashIndex = href.indexOf('#');
    if (hashIndex === -1) return;

    const path = href.slice(0, hashIndex);
    if (typeof window === 'undefined' || window.location.pathname !== path) return;

    e.preventDefault();
    closeMenu();
    window.history.replaceState(null, '', href);

    // Wait out the menu's own close animation first — the page is still
    // scroll-locked (position: fixed) until then, and its cleanup forces
    // window.scrollTo back to the position captured when the menu opened,
    // which would otherwise stomp on this scroll if it ran any earlier.
    window.setTimeout(() => {
        document.getElementById(href.slice(hashIndex + 1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, DRAWER_TRANSITION_MS + 30);
}

// Keep in sync with the menu overlay's `duration-[320ms]` Tailwind class —
// the exit animation must finish before it unmounts.
const DRAWER_TRANSITION_MS = 320;
const DRAWER_EASE = 'ease-[cubic-bezier(0.16,1,0.3,1)]';

export function PublicNavbar({
    companyName,
    variant = 'solid',
}: {
    companyName: string;
    /**
     * 'transparent-dark' floats the header (white text/icons) over a dark
     * hero photo. 'transparent-light' floats it (navy text/icons) over a
     * light/washed-out hero photo. 'solid' is used on pages without a hero.
     * Away from the top, every variant uses the same translucent surface so
     * the page remains visible behind the navigation.
     */
    variant?: 'transparent-dark' | 'transparent-light' | 'solid';
}) {
    const { url } = usePage();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMounted, setDrawerMounted] = useState(false);
    const [drawerEntered, setDrawerEntered] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [navbarHidden, setNavbarHidden] = useState(false);
    const [previewedItem, setPreviewedItem] = useState<NavItem | null>(null);
    const openButtonRef = useRef<HTMLButtonElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const previousDrawerOpenRef = useRef(false);
    const previousScrollYRef = useRef(0);

    useEffect(() => {
        setDrawerOpen(false);
        setNavbarHidden(false);
    }, [url]);

    // Clear the desktop right-pane preview whenever the menu closes, so it
    // reopens blank instead of showing whatever was last hovered.
    useEffect(() => {
        if (!drawerOpen) setPreviewedItem(null);
    }, [drawerOpen]);

    // Keep navigation out of the content's way while moving down, then make
    // it immediately reachable again when the visitor reverses direction.
    useEffect(() => {
        previousScrollYRef.current = window.scrollY;

        const onScroll = () => {
            const currentY = window.scrollY;
            const updateNavbarHidden = createNavbarHiddenUpdater({
                previousY: previousScrollYRef.current,
                currentY,
                drawerOpen,
            });

            setScrolled(currentY > 24);
            setNavbarHidden(updateNavbarHidden);
            previousScrollYRef.current = currentY;
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [drawerOpen]);

    // Mount the dialog for open AND for the duration of the close transition,
    // so the exit animation gets a chance to play instead of being clipped
    // by an instant unmount.
    useEffect(() => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (drawerOpen) {
            setDrawerMounted(true);
            if (reduced) {
                setDrawerEntered(true);
                return;
            }
            const id = requestAnimationFrame(() => setDrawerEntered(true));
            return () => cancelAnimationFrame(id);
        }

        setDrawerEntered(false);
        if (reduced) {
            setDrawerMounted(false);
            return;
        }
        const timeout = window.setTimeout(() => setDrawerMounted(false), DRAWER_TRANSITION_MS);
        return () => window.clearTimeout(timeout);
    }, [drawerOpen]);

    useEffect(() => {
        if (drawerOpen) {
            closeButtonRef.current?.focus();
        } else if (shouldRestoreMenuTriggerFocus(previousDrawerOpenRef.current, drawerOpen)) {
            openButtonRef.current?.focus();
        }
        previousDrawerOpenRef.current = drawerOpen;
    }, [drawerOpen]);

    useEffect(() => {
        if (!drawerMounted) return;

        const lockedScrollY = window.scrollY;
        const body = document.body;
        const root = document.documentElement;
        const previousBodyStyles = {
            position: body.style.position,
            top: body.style.top,
            left: body.style.left,
            right: body.style.right,
            width: body.style.width,
        };
        const previousRootOverflow = root.style.overflow;
        const previousScrollBehavior = root.style.scrollBehavior;
        const lockStyles = getBodyScrollLockStyles(lockedScrollY);

        Object.assign(body.style, lockStyles);
        root.style.overflow = 'hidden';

        return () => {
            Object.assign(body.style, previousBodyStyles);
            root.style.overflow = previousRootOverflow;
            root.style.scrollBehavior = 'auto';
            window.scrollTo(0, lockedScrollY);
            root.style.scrollBehavior = previousScrollBehavior;
        };
    }, [drawerMounted]);

    useEffect(() => {
        if (!drawerOpen) return;

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') setDrawerOpen(false);
        }

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [drawerOpen]);

    const transparentHero = variant !== 'solid' && !scrolled;
    const light = variant === 'transparent-light';

    return (
        <header className="fixed inset-x-0 top-0 z-50">
            {/*
                The hide-on-scroll slide only ever applies to this bar (logo +
                surface). The menu trigger below lives outside it so it stays
                reachable and instantly tappable even while the bar is off-screen
                — no waiting on a re-entrance transition before the drawer can open.
            */}
            <div
                className={`transition-[transform,background-color,border-color] duration-300 ${DRAWER_EASE} motion-reduce:transition-none ${getNavbarTransformClass(navbarHidden)} ${getNavbarSurfaceClass(transparentHero, drawerOpen)}`}
            >
                <div className="mx-auto flex h-20 max-w-content items-center justify-between px-5 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className={`flex shrink-0 items-center gap-2 text-base font-semibold tracking-tight transition-colors duration-200 ${
                            transparentHero && !light ? 'text-white' : 'text-navy-900'
                        }`}
                    >
                        <img src={logoKmi} alt={companyName} className="h-12 w-auto" />
                    </Link>

                    <span className="h-10 w-10" aria-hidden="true" />
                </div>
            </div>

            <div className="pointer-events-none absolute inset-0">
                <div className="mx-auto flex h-20 max-w-content items-center justify-end px-5 sm:px-6 lg:px-8">
                    <button
                        ref={openButtonRef}
                        type="button"
                        onClick={() => setDrawerOpen((open) => !open)}
                        aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        aria-haspopup="dialog"
                        aria-expanded={drawerOpen}
                        className={`pointer-events-auto relative inline-flex h-10 w-10 items-center justify-center transition-colors duration-200 active:scale-90 ${
                            transparentHero
                                ? light
                                    ? 'text-navy-900 hover:text-navy-700'
                                    : 'text-white hover:text-white/70'
                                : 'text-slate-700 hover:text-navy-900'
                        }`}
                    >
                        <span className="relative inline-flex h-6 w-6 items-center justify-center">
                            <Menu
                                className={`absolute h-6 w-6 transition-all duration-300 ${DRAWER_EASE} motion-reduce:transition-none ${
                                    drawerOpen ? 'rotate-90 scale-75 opacity-0' : 'rotate-0 scale-100 opacity-100'
                                }`}
                                aria-hidden="true"
                            />
                            <X
                                className={`absolute h-6 w-6 transition-all duration-300 ${DRAWER_EASE} motion-reduce:transition-none ${
                                    drawerOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-75 opacity-0'
                                }`}
                                aria-hidden="true"
                            />
                        </span>
                    </button>
                </div>
            </div>

            {drawerMounted && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Navigation menu"
                    className={`scrollbar-hide fixed inset-0 z-[60] flex flex-col overflow-y-auto md:flex-row md:overflow-hidden transition-[opacity,transform] duration-[320ms] ${DRAWER_EASE} motion-reduce:transition-none ${
                        drawerEntered ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-0'
                    }`}
                >
                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={() => setDrawerOpen(false)}
                        aria-label="Close navigation menu"
                        className="fixed right-5 top-5 z-[70] inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-navy-900 shadow-md transition-transform duration-200 hover:scale-105 active:scale-95"
                    >
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>

                    {/* Main menu — always navy/white, full width on mobile. */}
                    <nav
                        aria-label="Primary"
                        className="scrollbar-hide flex w-full shrink-0 flex-col bg-navy-900 px-5 pb-8 pt-20 text-white sm:px-10 sm:pt-24 md:w-1/2 md:overflow-y-auto md:px-14 md:py-24 lg:w-[55%] lg:px-20"
                    >
                        <ul className="flex-1">
                            {NAV.map((item, index) => (
                                <li
                                    key={item.label}
                                    className={`transition-all duration-300 ${DRAWER_EASE} motion-reduce:transition-none motion-reduce:translate-y-0 motion-reduce:opacity-100 ${
                                        drawerEntered ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                                    }`}
                                    style={{ transitionDelay: drawerEntered ? `${60 + index * 40}ms` : '0ms' }}
                                >
                                    {item.children ? (
                                        <>
                                            {/* Desktop: hover/focus previews children in the right pane. */}
                                            <button
                                                type="button"
                                                onMouseEnter={() => setPreviewedItem(item)}
                                                onFocus={() => setPreviewedItem(item)}
                                                onClick={() => setPreviewedItem(item)}
                                                className={`hidden w-full items-center justify-between py-4 text-left text-h3 font-semibold transition-colors duration-200 md:flex ${
                                                    previewedItem?.label === item.label ? 'text-white/45' : 'text-white'
                                                }`}
                                            >
                                                {item.label}
                                                <ChevronRight className="h-5 w-5 shrink-0 opacity-50" aria-hidden="true" />
                                            </button>

                                            {/* Mobile: stacked accordion, no right pane to hover into. */}
                                            <details className="group md:hidden" open={item.children.some((c) => isActive(url, c.href))}>
                                                <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-h4 font-semibold sm:py-4 sm:text-h3">
                                                    {item.label}
                                                    <ChevronDown
                                                        className="h-4 w-4 shrink-0 text-white/60 transition-transform group-open:rotate-180 sm:h-5 sm:w-5"
                                                        aria-hidden="true"
                                                    />
                                                </summary>
                                                <ul className="space-y-1 border-l border-white/15 py-2 pl-4">
                                                    {item.children.map((child) => (
                                                        <li key={child.href}>
                                                            <Link
                                                                href={child.href}
                                                                onClick={(e) => handleAnchorLinkClick(e, child.href, () => setDrawerOpen(false))}
                                                                className={`block py-2 text-small ${
                                                                    isActive(url, child.href) ? 'text-white' : 'text-white/70 hover:text-white'
                                                                }`}
                                                            >
                                                                {child.label}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </details>
                                        </>
                                    ) : (
                                        <Link
                                            href={item.href!}
                                            onMouseEnter={() => setPreviewedItem(item)}
                                            onFocus={() => setPreviewedItem(item)}
                                            className={`block py-3 text-h4 font-semibold transition-colors duration-200 sm:py-4 sm:text-h3 ${
                                                previewedItem?.label === item.label ? 'text-white/45' : 'text-white'
                                            } ${isActive(url, item.href!) ? 'underline decoration-2 underline-offset-4' : ''}`}
                                        >
                                            {item.label}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/*
                        Submenu preview — desktop/tablet only. Stays navy (blended
                        with the left column) until a parent item is previewed,
                        then flips to the light surface to host its children.
                    */}
                    <div
                        className={`scrollbar-hide hidden px-14 py-24 transition-colors duration-300 ${DRAWER_EASE} motion-reduce:transition-none md:flex md:w-1/2 md:flex-col md:justify-center md:overflow-y-auto lg:w-[45%] lg:px-20 ${
                            previewedItem?.children ? 'bg-background text-navy-900' : 'bg-navy-900 text-white'
                        }`}
                    >
                        {previewedItem?.children && (
                            <ul key={previewedItem.label} className="space-y-3">
                                {previewedItem.children.map((child, index) => (
                                    <li
                                        key={child.href}
                                        className="submenu-item-enter"
                                        style={{ animationDelay: `${index * 40}ms` }}
                                    >
                                        <Link
                                            href={child.href}
                                            onClick={(e) => handleAnchorLinkClick(e, child.href, () => setDrawerOpen(false))}
                                            className={`block text-h4 font-medium transition-colors duration-200 ${
                                                isActive(url, child.href)
                                                    ? 'text-navy-900 underline decoration-2 underline-offset-4'
                                                    : 'text-navy-700 hover:text-navy-900'
                                            }`}
                                        >
                                            {child.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
