import { Link, usePage } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';
import { KeyboardEvent as ReactKeyboardEvent, MouseEvent, useEffect, useRef, useState } from 'react';

import logoKmi from '../../../img/logo_kmi.png';

import {
    createNavbarHiddenUpdater,
    getBodyScrollLockStyles,
    getNavbarTransformClass,
    getTrappedFocusIndex,
    shouldRestoreMenuTriggerFocus,
} from '@/components/public/navbar-scroll';
import { mediaUrl } from '@/lib/media';
import { pauseSmoothScroll, resumeSmoothScroll, scrollToElement } from '@/lib/smooth-scroll';
import type { PageProps } from '@/types';

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

// Only English content exists today; Indonesian is shown as upcoming.
const LANGUAGES = [
    { code: 'ID', label: 'Bahasa Indonesia', available: false },
    { code: 'EN', label: 'English', available: true },
] as const;

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled])';

function isActive(currentUrl: string, href: string): boolean {
    const path = currentUrl.split('#')[0];

    return href === '/' ? path === '/' : path.startsWith(href.split('#')[0]);
}

function submenuId(label: string): string {
    return `menu-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function formatNewsDate(date: string | null): string | null {
    if (!date) return null;

    return new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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
        const target = document.getElementById(href.slice(hashIndex + 1));
        if (target) scrollToElement(target);
    }, DRAWER_TRANSITION_MS + 30);
}

// Keep in sync with the panel's `duration-[320ms]` Tailwind class — the
// exit animation must finish before it unmounts.
const DRAWER_TRANSITION_MS = 320;
const DRAWER_EASE = 'ease-[cubic-bezier(0.16,1,0.3,1)]';

/** Hidden below 380px, where the wordmark logo and menu trigger need the room. */
function LanguageSwitch({ hidden }: { hidden: boolean }) {
    return (
        <div
            role="group"
            aria-label="Language"
            className={`flex items-center gap-0.5 rounded-full bg-gray-200 p-1 transition-[opacity,visibility] duration-200 max-[379px]:hidden sm:p-1.5 ${
                hidden ? 'invisible opacity-0' : 'visible opacity-100'
            }`}
        >
            {LANGUAGES.map((language) => (
                <button
                    key={language.code}
                    type="button"
                    lang={language.code.toLowerCase()}
                    aria-label={language.available ? language.label : `${language.label} (coming soon)`}
                    aria-pressed={language.available}
                    disabled={!language.available}
                    title={language.available ? language.label : `${language.label} — coming soon`}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-small font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-700 sm:h-11 sm:w-11 ${
                        language.available ? 'bg-white text-navy-900' : 'cursor-not-allowed text-slate-500'
                    }`}
                >
                    {language.code}
                </button>
            ))}
        </div>
    );
}

export function PublicNavbar({ companyName }: { companyName: string }) {
    const { url, props } = usePage<PageProps>();
    const { siteSettings, menuNews = [] } = props;
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMounted, setDrawerMounted] = useState(false);
    const [drawerEntered, setDrawerEntered] = useState(false);
    const [navbarHidden, setNavbarHidden] = useState(false);
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const openButtonRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const previousDrawerOpenRef = useRef(false);
    const previousScrollYRef = useRef(0);

    useEffect(() => {
        setDrawerOpen(false);
        setNavbarHidden(false);
    }, [url]);

    // Reopen with the section that holds the current page already expanded.
    useEffect(() => {
        if (!drawerOpen) return;

        const current = NAV.find((item) => item.children?.some((child) => isActive(url, child.href)));
        setExpandedItem(current?.label ?? null);
    }, [drawerOpen, url]);

    // Keep the logo tab out of the content's way while moving down, then
    // bring it back as soon as the visitor reverses direction.
    useEffect(() => {
        previousScrollYRef.current = window.scrollY;

        const onScroll = () => {
            const currentY = window.scrollY;
            const updateNavbarHidden = createNavbarHiddenUpdater({
                previousY: previousScrollYRef.current,
                currentY,
                drawerOpen,
            });

            setNavbarHidden(updateNavbarHidden);
            previousScrollYRef.current = currentY;
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [drawerOpen]);

    // Mount the panel for open AND for the duration of the close transition,
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
        if (drawerOpen && drawerMounted) {
            panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus({ preventScroll: true });
        } else if (shouldRestoreMenuTriggerFocus(previousDrawerOpenRef.current, drawerOpen)) {
            openButtonRef.current?.focus();
        }

        previousDrawerOpenRef.current = drawerOpen;
    }, [drawerOpen, drawerMounted]);

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

        pauseSmoothScroll();
        Object.assign(body.style, lockStyles);
        root.style.overflow = 'hidden';

        return () => {
            Object.assign(body.style, previousBodyStyles);
            root.style.overflow = previousRootOverflow;
            root.style.scrollBehavior = 'auto';
            window.scrollTo(0, lockedScrollY);
            root.style.scrollBehavior = previousScrollBehavior;
            resumeSmoothScroll();
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

    // Keep keyboard focus inside the menu trigger + panel while open; the
    // page behind is scroll-locked and dimmed, so tabbing into it is a trap
    // of its own.
    function trapFocus(e: ReactKeyboardEvent) {
        if (e.key !== 'Tab' || !drawerOpen || !panelRef.current) return;

        const focusables = [
            openButtonRef.current,
            ...Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)),
        ].filter((element): element is HTMLElement => (
            element !== null && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden'
        ));
        const next = getTrappedFocusIndex(focusables.indexOf(document.activeElement as HTMLElement), focusables.length, e.shiftKey);

        if (next === null) return;

        e.preventDefault();
        focusables[next].focus();
    }

    const closeMenu = () => setDrawerOpen(false);
    const year = new Date().getFullYear();
    const phoneHref = siteSettings.phone ? `tel:${siteSettings.phone.replace(/[^+\d]/g, '')}` : null;

    return (
        <header onKeyDown={trapFocus}>
            {/* Logo tab — a white corner card so the mark stays legible over any hero. */}
            <div
                className={`fixed left-0 top-0 z-50 transition-transform duration-300 ${DRAWER_EASE} motion-reduce:transition-none ${getNavbarTransformClass(navbarHidden, drawerOpen)}`}
            >
                <Link
                    href="/"
                    className="flex h-16 items-center rounded-br-[28px] bg-white pl-5 pr-6 shadow-[0_1px_2px_rgb(var(--color-navy-900)/0.08)] sm:h-20 sm:rounded-br-[40px] sm:pl-8 sm:pr-10 lg:pl-10 lg:pr-12"
                >
                    <img src={logoKmi} alt={companyName} className="h-5 w-auto sm:h-8 lg:h-9" />
                </Link>
            </div>

            {/* Controls stay put on scroll and sit above the panel, so the
                trigger doubles as the close button. */}
            <div className="fixed right-4 top-3 z-[70] flex items-center gap-2 sm:right-6 sm:top-4 sm:gap-3 lg:right-8">
                {siteSettings.show_language_switcher && <LanguageSwitch hidden={drawerOpen} />}

                <button
                    ref={openButtonRef}
                    type="button"
                    onClick={() => setDrawerOpen((open) => !open)}
                    aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    aria-haspopup="dialog"
                    aria-expanded={drawerOpen}
                    className="inline-flex h-11 w-14 items-center justify-center rounded-full bg-white text-navy-900 shadow-[0_1px_2px_rgb(var(--color-navy-900)/0.08)] transition-colors duration-200 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700 sm:h-14 sm:w-16"
                >
                    <span className="relative block h-4 w-7 sm:w-8" aria-hidden="true">
                        <span
                            className={`absolute left-0 top-0 h-0.5 w-full rounded-full bg-current transition-transform duration-500 ${DRAWER_EASE} motion-reduce:transition-none ${
                                drawerOpen ? 'translate-y-[7px] rotate-45' : ''
                            }`}
                        />
                        <span
                            className={`absolute left-0 top-[7px] h-0.5 w-full rounded-full bg-current transition-opacity duration-200 motion-reduce:transition-none ${
                                drawerOpen ? 'opacity-0' : 'opacity-100'
                            }`}
                        />
                        <span
                            className={`absolute left-0 top-[14px] h-0.5 w-full rounded-full bg-current transition-transform duration-500 ${DRAWER_EASE} motion-reduce:transition-none ${
                                drawerOpen ? '-translate-y-[7px] -rotate-45' : ''
                            }`}
                        />
                    </span>
                </button>
            </div>

            {drawerMounted && (
                <div className="fixed inset-0 z-[60]">
                    <div
                        aria-hidden="true"
                        onClick={closeMenu}
                        className={`absolute inset-0 bg-navy-900/40 transition-opacity duration-300 motion-reduce:transition-none ${
                            drawerEntered ? 'opacity-100' : 'opacity-0'
                        }`}
                    />

                    <div
                        ref={panelRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Navigation menu"
                        data-lenis-prevent
                        className={`scrollbar-hide absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto bg-navy-900 text-white transition-transform duration-[320ms] ${DRAWER_EASE} motion-reduce:transition-none md:w-[68%] md:rounded-l-[40px] ${
                            drawerEntered ? 'translate-x-0' : 'translate-x-full'
                        }`}
                    >
                        <div className="flex h-[68px] shrink-0 items-center gap-3 px-6 sm:h-[88px] sm:px-10 lg:px-14">
                            <Link
                                href="/"
                                aria-label="Home"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            >
                                <Home className="h-5 w-5" aria-hidden="true" />
                            </Link>
                            <span className="rounded-full bg-white/10 px-3 py-1 text-small font-medium text-white/80">Menu</span>
                        </div>

                        <div className="flex flex-1 flex-col px-6 pb-10 pt-4 sm:px-10 lg:flex-row lg:px-14 lg:pt-8">
                            <nav aria-label="Primary" className={menuNews.length > 0 ? 'lg:w-[52%] lg:pr-10' : 'lg:w-full lg:max-w-xl'}>
                                <ul>
                                    {NAV.map((item, index) => {
                                        const expanded = expandedItem === item.label;
                                        const staggerStyle = { transitionDelay: drawerEntered ? `${80 + index * 40}ms` : '0ms' };
                                        const staggerClass = `transition-[opacity,transform] duration-300 ${DRAWER_EASE} motion-reduce:transition-none ${
                                            drawerEntered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                                        }`;

                                        if (!item.children) {
                                            const active = isActive(url, item.href!);

                                            return (
                                                <li key={item.label} className={staggerClass} style={staggerStyle}>
                                                    <Link
                                                        href={item.href!}
                                                        aria-current={active ? 'page' : undefined}
                                                        className="group flex py-2.5 text-h4 font-semibold focus-visible:outline-none sm:py-3 sm:text-h3"
                                                    >
                                                        <span
                                                            className={`underline-offset-[10px] group-hover:underline group-focus-visible:underline ${
                                                                active ? 'underline decoration-2' : 'decoration-white/40 decoration-2'
                                                            }`}
                                                        >
                                                            {item.label}
                                                        </span>
                                                    </Link>
                                                </li>
                                            );
                                        }

                                        const sectionActive = item.children.some((child) => isActive(url, child.href));

                                        return (
                                            <li key={item.label} className={staggerClass} style={staggerStyle}>
                                                <button
                                                    type="button"
                                                    aria-expanded={expanded}
                                                    aria-controls={submenuId(item.label)}
                                                    onClick={() => setExpandedItem(expanded ? null : item.label)}
                                                    className="group flex w-full items-center justify-between gap-6 py-2.5 text-left text-h4 font-semibold focus-visible:outline-none sm:py-3 sm:text-h3"
                                                >
                                                    <span
                                                        className={`underline-offset-[10px] group-hover:underline group-focus-visible:underline ${
                                                            sectionActive ? 'underline decoration-2' : 'decoration-white/40 decoration-2'
                                                        }`}
                                                    >
                                                        {item.label}
                                                    </span>
                                                    <ChevronRight
                                                        className={`h-5 w-5 shrink-0 text-white/60 transition-transform duration-300 ${DRAWER_EASE} group-hover:text-white motion-reduce:transition-none sm:h-6 sm:w-6 ${
                                                            expanded ? 'rotate-90' : ''
                                                        }`}
                                                        aria-hidden="true"
                                                    />
                                                </button>

                                                <div
                                                    id={submenuId(item.label)}
                                                    className={`grid transition-[grid-template-rows,visibility] duration-300 ${DRAWER_EASE} motion-reduce:transition-none ${
                                                        expanded ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'
                                                    }`}
                                                >
                                                    <ul className="min-h-0 overflow-hidden">
                                                        {item.children.map((child) => {
                                                            const active = isActive(url, child.href) && !child.href.includes('#');

                                                            return (
                                                                <li key={child.href}>
                                                                    <Link
                                                                        href={child.href}
                                                                        aria-current={active ? 'page' : undefined}
                                                                        onClick={(e) => handleAnchorLinkClick(e, child.href, closeMenu)}
                                                                        className={`block border-l py-2 pl-5 text-body-lg transition-colors duration-200 focus-visible:outline-none focus-visible:underline ${
                                                                            active
                                                                                ? 'border-white font-medium text-white'
                                                                                : 'border-white/20 text-white/70 hover:border-white/60 hover:text-white'
                                                                        }`}
                                                                    >
                                                                        {child.label}
                                                                    </Link>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>

                            {menuNews.length > 0 && (
                                <>
                                    <div aria-hidden="true" className="hidden w-px shrink-0 bg-white/15 lg:block" />
                                    <aside aria-labelledby="menu-news-heading" className="hidden lg:flex lg:flex-1 lg:flex-col lg:gap-4 lg:pl-10">
                                        <h2 id="menu-news-heading" className="text-small font-medium text-white/60">
                                            Latest news
                                        </h2>
                                        {menuNews.map((article) => {
                                            const image = mediaUrl(article.featured_image);

                                            return (
                                                <Link
                                                    key={article.slug}
                                                    href={`/news/${article.slug}`}
                                                    className="group relative block aspect-[2/1] overflow-hidden rounded-[24px] bg-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
                                                >
                                                    {image && (
                                                        <img
                                                            src={image}
                                                            alt=""
                                                            loading="lazy"
                                                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                                                        />
                                                    )}
                                                    <span className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/30 to-transparent" aria-hidden="true" />
                                                    <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5">
                                                        {article.published_at && (
                                                            <time dateTime={article.published_at} className="text-caption text-white/70">
                                                                {formatNewsDate(article.published_at)}
                                                            </time>
                                                        )}
                                                        <span className="line-clamp-2 text-body-lg font-semibold leading-snug text-white">{article.title}</span>
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </aside>
                                </>
                            )}
                        </div>

                        <div className="mt-auto flex flex-col gap-3 border-t border-white/10 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-14">
                            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-small font-medium">
                                <li>
                                    <Link href="/contact" className="text-white hover:underline hover:underline-offset-4">Contact Us</Link>
                                </li>
                                {siteSettings.phone && phoneHref && (
                                    <li>
                                        <a href={phoneHref} className="text-white/70 hover:text-white">{siteSettings.phone}</a>
                                    </li>
                                )}
                                {siteSettings.email && (
                                    <li>
                                        <a href={`mailto:${siteSettings.email}`} className="text-white/70 hover:text-white">{siteSettings.email}</a>
                                    </li>
                                )}
                            </ul>
                            <p className="text-caption text-white/50">© {year} {companyName}</p>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
