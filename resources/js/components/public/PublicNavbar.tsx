import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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

function DropdownItem({ item, currentUrl }: { item: NavItem; currentUrl: string }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const active = item.children?.some((c) => isActive(currentUrl, c.href)) ?? false;

    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    return (
        <div
            ref={rootRef}
            className="relative"
            onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
        >
            <button
                type="button"
                aria-expanded={open}
                aria-haspopup="true"
                onClick={() => setOpen((v) => !v)}
                className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-navy-900 ${active ? 'text-navy-900' : 'text-slate-700'}`}
            >
                {item.label}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>

            {open && (
                <ul className="absolute left-0 top-full z-50 mt-3 w-56 border border-border bg-surface py-2 shadow-sm">
                    {item.children?.map((child) => (
                        <li key={child.href}>
                            <Link
                                href={child.href}
                                onClick={() => setOpen(false)}
                                className={`block px-4 py-2 text-sm hover:bg-muted ${isActive(currentUrl, child.href) ? 'text-navy-900 font-medium' : 'text-slate-700'}`}
                            >
                                {child.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export function PublicNavbar({ companyName, logo }: { companyName: string; logo?: string | null }) {
    const { url } = usePage();
    const [scrolled, setScrolled] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        setDrawerOpen(false);
    }, [url]);

    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [drawerOpen]);

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-surface">
            <div
                className={`mx-auto flex max-w-content items-center justify-between px-5 transition-[height] duration-200 ease-out sm:px-6 lg:px-8 ${scrolled ? 'h-[60px]' : 'h-[72px]'}`}
            >
                <Link href="/" className="flex shrink-0 items-center gap-2 text-base font-semibold tracking-tight text-navy-900">
                    {logo && <img src={`/storage/${logo}`} alt={companyName} className="h-7 w-auto" />}
                    {companyName}
                </Link>

                <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
                    {NAV.map((item) =>
                        item.children ? (
                            <DropdownItem key={item.label} item={item} currentUrl={url} />
                        ) : (
                            <Link
                                key={item.href}
                                href={item.href!}
                                className={`text-sm font-medium transition-colors hover:text-navy-900 ${isActive(url, item.href!) ? 'text-navy-900' : 'text-slate-700'}`}
                            >
                                {item.label}
                            </Link>
                        ),
                    )}
                </nav>

                <div className="hidden lg:block">
                    <Button asChild size="sm">
                        <Link href="/contact">Contact Us</Link>
                    </Button>
                </div>

                <button
                    type="button"
                    className="inline-flex items-center justify-center p-2 text-slate-700 lg:hidden"
                    onClick={() => setDrawerOpen(true)}
                    aria-label="Open navigation menu"
                    aria-expanded={drawerOpen}
                >
                    <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
            </div>

            {drawerOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-charcoal/40" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Navigation menu"
                        className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-surface"
                        onKeyDown={(e) => { if (e.key === 'Escape') setDrawerOpen(false); }}
                    >
                        <div className="flex h-[72px] items-center justify-between border-b border-border px-5">
                            <span className="text-base font-semibold text-navy-900">{companyName}</span>
                            <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close navigation menu" className="p-2 text-slate-700">
                                <X className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>

                        <nav className="flex-1 overflow-y-auto px-5 py-6" aria-label="Mobile primary">
                            <ul className="space-y-1">
                                {NAV.map((item) => (
                                    <li key={item.label}>
                                        {item.children ? (
                                            <details className="group" open={item.children.some((c) => isActive(url, c.href))}>
                                                <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-h4 text-navy-900">
                                                    {item.label}
                                                    <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" aria-hidden="true" />
                                                </summary>
                                                <ul className="ml-1 space-y-1 border-l border-border pl-4">
                                                    {item.children.map((child) => (
                                                        <li key={child.href}>
                                                            <Link href={child.href} className="block py-2 text-sm text-slate-700">
                                                                {child.label}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </details>
                                        ) : (
                                            <Link href={item.href!} className="block py-3 text-h4 text-navy-900">
                                                {item.label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        <div className="border-t border-border p-5">
                            <Button asChild className="w-full">
                                <Link href="/contact">Contact Us</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
