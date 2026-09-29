import { Link } from '@inertiajs/react';
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useState } from 'react';

import { usePermissions } from '@/hooks/use-permissions';
import { adminNavSections } from '@/lib/admin-nav';
import type { AdminNavEntry, AdminNavItem } from '@/lib/admin-nav';
import { cn } from '@/lib/utils';

function allowed(permission: string | undefined, can: (p: string) => boolean) {
    return !permission || can(permission);
}

function isRouteActive(href: string): boolean {
    return Boolean(route().current(href) || route().current(`${href}.*`));
}

function panelId(label: string): string {
    return `admin-nav-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

type VisibleEntry = AdminNavEntry & { visibleItems: AdminNavItem[] };

function entryActive(entry: VisibleEntry): boolean {
    return entry.href ? isRouteActive(entry.href) : entry.visibleItems.some((item) => isRouteActive(item.href));
}

export function SidebarNav({ collapsed = false }: { collapsed?: boolean }) {
    const { can } = usePermissions();
    const sections = adminNavSections
        .map((section) => ({
            ...section,
            entries: section.entries
                .filter((entry) => allowed(entry.permission, can))
                .map((entry) => ({ ...entry, visibleItems: (entry.items ?? []).filter((item) => allowed(item.permission, can)) }))
                .filter((entry) => entry.href || entry.visibleItems.length > 0),
        }))
        .filter((section) => section.entries.length > 0);

    // Accordion: one group open at a time, starting with the current page's.
    const [openGroup, setOpenGroup] = useState<string | null>(
        () => sections.flatMap((section) => section.entries).find((entry) => !entry.href && entryActive(entry))?.label ?? null,
    );

    const linkClass = (active: boolean) =>
        cn(
            'flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors',
            active ? 'bg-primary text-primary-foreground' : 'text-slate-700 hover:bg-muted',
            collapsed && 'justify-center',
        );

    return (
        <nav aria-label="Menu admin" className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
            {sections.map((section, index) => (
                <div key={section.heading ?? 'top'} className={cn(index > 0 && (collapsed ? 'mt-3 border-t border-border pt-3' : 'mt-5'))}>
                    {section.heading && !collapsed && (
                        <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">{section.heading}</p>
                    )}
                    <div className="space-y-1">
                        {section.entries.map((entry) => {
                            const Icon = entry.icon;
                            const active = entryActive(entry);
                            // Collapsed, a group links to its first page; its icon stands for all of it.
                            const href = entry.href ?? (collapsed || entry.visibleItems.length === 1 ? entry.visibleItems[0].href : null);

                            if (href) {
                                return (
                                    <Link key={entry.label} href={route(href)} title={collapsed ? entry.label : undefined} className={linkClass(active)}>
                                        <Icon className="h-4 w-4 shrink-0" />
                                        {!collapsed && <span>{entry.label}</span>}
                                    </Link>
                                );
                            }

                            const open = openGroup === entry.label;
                            const id = panelId(entry.label);

                            return (
                                <div key={entry.label}>
                                    <button
                                        type="button"
                                        aria-expanded={open}
                                        aria-controls={id}
                                        onClick={() => setOpenGroup(open ? null : entry.label)}
                                        className={cn(
                                            'flex w-full items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors',
                                            active ? 'text-primary' : 'text-slate-700 hover:bg-muted',
                                        )}
                                    >
                                        <Icon className="h-4 w-4 shrink-0" />
                                        <span className="flex-1 text-left">{entry.label}</span>
                                        <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', open && 'rotate-180')} />
                                    </button>
                                    <div
                                        id={id}
                                        className={cn(
                                            'grid transition-[grid-template-rows,visibility] duration-200 ease-out motion-reduce:transition-none',
                                            open ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]',
                                        )}
                                    >
                                        <div className="min-h-0 overflow-hidden">
                                            <div className="ml-7 mt-1 space-y-1 border-l border-border pl-3">
                                                {entry.visibleItems.map((item) => (
                                                    <Link
                                                        key={item.href}
                                                        href={route(item.href)}
                                                        aria-current={isRouteActive(item.href) ? 'page' : undefined}
                                                        className={cn(
                                                            'block rounded px-2 py-1.5 text-sm transition-colors',
                                                            isRouteActive(item.href) ? 'font-medium text-primary' : 'text-slate-700 hover:text-foreground',
                                                        )}
                                                    >
                                                        {item.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </nav>
    );
}

export function AdminSidebar({
    collapsed,
    onToggleCollapsed,
}: {
    collapsed: boolean;
    onToggleCollapsed: () => void;
}) {
    return (
        <aside
            className={cn(
                // Pinned to the viewport: page scroll never moves the menu, and the
                // nav list scrolls on its own when it outgrows the screen.
                'sticky top-0 hidden h-screen shrink-0 flex-col self-start border-r border-border bg-surface transition-all sm:flex',
                collapsed ? 'w-16' : 'w-64',
            )}
        >
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
                {!collapsed && (
                    <Link href={route('dashboard')} className="flex flex-col leading-tight">
                        <span className="text-base font-semibold tracking-tight text-foreground">Kenco CMS</span>
                        <span className="text-xs text-slate-500">Kelola website perusahaan</span>
                    </Link>
                )}
                <button
                    type="button"
                    onClick={onToggleCollapsed}
                    className="rounded p-1.5 text-slate-500 hover:bg-muted hover:text-foreground"
                    aria-label={collapsed ? 'Lebarkan menu' : 'Ciutkan menu'}
                    title={collapsed ? 'Lebarkan menu' : 'Ciutkan menu'}
                >
                    {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                </button>
            </div>

            <SidebarNav collapsed={collapsed} />
        </aside>
    );
}
