import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { getNavbarHidden, getNavbarTransformClass, shouldRestoreMenuTriggerFocus } from '@/components/public/navbar-scroll';
import { Button } from '@/components/ui/button';

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
        { label: 'About', href: '/company' },
        { label: 'Vision & Mission', href: '/company/vision-mission' },
        { label: 'Facilities', href: '/facilities' },
        { label: 'Industries', href: '/industries' },
    ] },
    { label: 'Capabilities', href: '/capabilities' },
    { label: 'Products', href: '/products' },
    { label: 'Quality', children: [
        { label: 'Quality Commitment', href: '/quality' },
        { label: 'Certifications', href: '/certifications' },
    ] },
    { label: 'News', href: '/news' },
    { label: 'Career', href: '/careers' },
];

function isActive(currentUrl: string, href: string): boolean {
    return href === '/' ? currentUrl === '/' : currentUrl.startsWith(href);
}

export function PublicNavbar({
    companyName,
    logo,
    variant = 'solid',
}: {
    companyName: string;
    logo?: string | null;
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
    const [drawerEntered, setDrawerEntered] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [navbarHidden, setNavbarHidden] = useState(false);
    const openButtonRef = useRef<HTMLButtonElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const previousDrawerOpenRef = useRef(false);
    const previousScrollYRef = useRef(0);

    useEffect(() => {
        setDrawerOpen(false);
        setNavbarHidden(false);
    }, [url]);

    // Keep navigation out of the content's way while moving down, then make
    // it immediately reachable again when the visitor reverses direction.
    useEffect(() => {
        previousScrollYRef.current = window.scrollY;

        const onScroll = () => {
            const currentY = window.scrollY;

            setScrolled(currentY > 24);
            setNavbarHidden((wasHidden) =>
                getNavbarHidden({
                    previousY: previousScrollYRef.current,
                    currentY,
                    wasHidden,
                    drawerOpen,
                }),
            );
            previousScrollYRef.current = currentY;
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [drawerOpen]);

    useEffect(() => {
        if (!drawerOpen) {
            setDrawerEntered(false);
            return;
        }
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduced) {
            setDrawerEntered(true);
            return;
        }
        const id = requestAnimationFrame(() => setDrawerEntered(true));
        return () => cancelAnimationFrame(id);
    }, [drawerOpen]);

    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : '';
        if (drawerOpen) {
            closeButtonRef.current?.focus();
        } else if (shouldRestoreMenuTriggerFocus(previousDrawerOpenRef.current, drawerOpen)) {
            openButtonRef.current?.focus();
        }
        previousDrawerOpenRef.current = drawerOpen;

        return () => {
            document.body.style.overflow = '';
        };
    }, [drawerOpen]);

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
        <header
            className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-200 ease-out motion-reduce:transition-none ${
                getNavbarTransformClass(navbarHidden, drawerOpen)
            } ${
                transparentHero ? 'bg-transparent' : 'border-b border-white/30 bg-white/60 backdrop-blur-md'
            }`}
        >
            <div className="mx-auto flex h-20 max-w-content items-center justify-between px-5 sm:px-6 lg:px-8">
                <Link
                    href="/"
                    className={`flex shrink-0 items-center gap-2 text-base font-semibold tracking-tight transition-colors duration-200 ${
                        transparentHero && !light ? 'text-white' : 'text-navy-900'
                    }`}
                >
                    {logo && <img src={`/storage/${logo}`} alt={companyName} className="h-7 w-auto" />}
                    {companyName}
                </Link>

                <button
                    ref={openButtonRef}
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    aria-label="Open navigation menu"
                    aria-haspopup="dialog"
                    aria-expanded={drawerOpen}
                    className={`inline-flex items-center justify-center p-2 transition-colors duration-200 ${
                        transparentHero
                            ? light
                                ? 'text-navy-900 hover:text-navy-700'
                                : 'text-white hover:text-white/70'
                            : 'text-slate-700 hover:text-navy-900'
                    }`}
                >
                    <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
            </div>

            {drawerOpen && (
                <div className="fixed inset-0 z-[60]">
                    <div
                        className={`absolute inset-0 bg-charcoal/50 transition-opacity duration-200 ease-out ${drawerEntered ? 'opacity-100' : 'opacity-0'}`}
                        onClick={() => setDrawerOpen(false)}
                        aria-hidden="true"
                    />

                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Navigation menu"
                        className={`absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-navy-900 text-white shadow-xl transition-transform duration-200 ease-out ${
                            drawerEntered ? 'translate-x-0' : 'translate-x-full'
                        }`}
                    >
                        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
                            <span className="text-base font-semibold">{companyName}</span>
                            <button
                                ref={closeButtonRef}
                                type="button"
                                onClick={() => setDrawerOpen(false)}
                                aria-label="Close navigation menu"
                                className="p-2 text-white/80 transition-colors hover:text-white"
                            >
                                <X className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>

                        <nav className="flex-1 overflow-y-auto px-5 py-6" aria-label="Primary">
                            <ul className="space-y-1">
                                {NAV.map((item) => (
                                    <li key={item.label}>
                                        {item.children ? (
                                            <details className="group" open={item.children.some((c) => isActive(url, c.href))}>
                                                <summary className="flex cursor-pointer list-none items-center justify-between border-b border-white/10 py-3 text-h4">
                                                    {item.label}
                                                    <ChevronDown
                                                        className="h-5 w-5 text-white/60 transition-transform group-open:rotate-180"
                                                        aria-hidden="true"
                                                    />
                                                </summary>
                                                <ul className="space-y-1 border-l border-white/15 py-2 pl-4">
                                                    {item.children.map((child) => (
                                                        <li key={child.href}>
                                                            <Link
                                                                href={child.href}
                                                                className={`block py-2 text-sm ${
                                                                    isActive(url, child.href) ? 'text-white' : 'text-white/70 hover:text-white'
                                                                }`}
                                                            >
                                                                {child.label}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </details>
                                        ) : (
                                            <Link
                                                href={item.href!}
                                                className={`block border-b border-white/10 py-3 text-h4 ${
                                                    isActive(url, item.href!) ? 'text-white' : 'text-white/90 hover:text-white'
                                                }`}
                                            >
                                                {item.label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        <div className="border-t border-white/10 p-5">
                            <Button asChild className="w-full bg-white text-navy-900 hover:bg-white/90">
                                <Link href="/contact">Contact Us</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
