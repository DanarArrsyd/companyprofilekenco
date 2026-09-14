import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';

const navigation = [
    { name: 'Company', href: '/company' },
    { name: 'Capabilities', href: '/capabilities' },
    { name: 'Products', href: '/products' },
    { name: 'Facilities', href: '/facilities' },
    { name: 'Quality', href: '/quality' },
    { name: 'Industries', href: '/industries' },
    { name: 'News', href: '/news' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
];

export default function PublicLayout({ children }: PropsWithChildren) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
                <div className="mx-auto flex h-20 max-w-content items-center justify-between px-5 sm:px-6 lg:px-8">
                    <Link href="/" className="text-lg font-semibold tracking-tight text-navy-900">
                        Kenco Manufacturing
                    </Link>

                    <nav className="hidden items-center gap-8 lg:flex">
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-sm font-medium text-slate-700 transition-colors hover:text-navy-900"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded p-2 text-slate-700 lg:hidden"
                        onClick={() => setMobileOpen((v) => !v)}
                        aria-label="Toggle navigation"
                    >
                        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {mobileOpen && (
                    <nav className="border-t border-border bg-surface px-5 py-4 lg:hidden">
                        <div className="flex flex-col gap-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-muted"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </nav>
                )}
            </header>

            <main className="flex-1">{children}</main>

            <footer className="border-t border-border bg-navy-900 text-white">
                <div className="mx-auto max-w-content px-5 py-12 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <p className="text-base font-semibold text-white">Kenco Manufacturing</p>
                            <p className="mt-3 text-sm text-slate-500 text-opacity-90">
                                Precision manufacturing, engineering discipline, and reliable
                                production capability.
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-white">Company</p>
                            <ul className="mt-3 space-y-2 text-sm text-slate-500">
                                <li><Link href="/company" className="hover:text-white">About</Link></li>
                                <li><Link href="/company/vision-mission" className="hover:text-white">Vision &amp; Mission</Link></li>
                                <li><Link href="/company/milestones" className="hover:text-white">Milestones</Link></li>
                            </ul>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-white">Resources</p>
                            <ul className="mt-3 space-y-2 text-sm text-slate-500">
                                <li><Link href="/news" className="hover:text-white">News</Link></li>
                                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                                <li><Link href="/quality" className="hover:text-white">Quality &amp; Certifications</Link></li>
                            </ul>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-white">Contact</p>
                            <ul className="mt-3 space-y-2 text-sm text-slate-500">
                                <li><Link href="/contact" className="hover:text-white">Get in touch</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-10 border-t border-navy-700 pt-6 text-xs text-slate-500">
                        &copy; {new Date().getFullYear()} Kenco Manufacturing. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
