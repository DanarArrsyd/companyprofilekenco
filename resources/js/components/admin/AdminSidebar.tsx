import { Link } from '@inertiajs/react';
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useState } from 'react';

import { usePermissions } from '@/hooks/use-permissions';
import { adminNavGroups } from '@/lib/admin-nav';
import type { AdminNavItem } from '@/lib/admin-nav';
import { cn } from '@/lib/utils';

function isGroupVisible(permission: string | undefined, can: (p: string) => boolean) {
    return !permission || can(permission);
}

function isItemActive(item: AdminNavItem): boolean {
    return Boolean(route().current(item.href) || route().current(`${item.href}.*`));
}

function groupPanelId(label: string): string {
    return `admin-nav-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

export function SidebarNav({ collapsed = false }: { collapsed?: boolean }) {
    const { can } = usePermissions();
    const groups = adminNavGroups
        .filter((group) => isGroupVisible(group.permission, can) && group.items.some((item) => isGroupVisible(item.permission, can)))
        .map((group) => ({ ...group, visibleItems: group.items.filter((item) => isGroupVisible(item.permission, can)) }));

    // Accordion: one group open at a time, starting with the current page's.
    const [openGroup, setOpenGroup] = useState<string | null>(
        () => groups.find((group) => group.visibleItems.length > 1 && group.visibleItems.some(isItemActive))?.label ?? null,
    );

    return (
        <nav aria-label="Admin" className="flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-4">
            {groups.map((group) => {
                    const Icon = group.icon;
                    const visibleItems = group.visibleItems;
                    const isSingle = visibleItems.length === 1;
                    const active = visibleItems.some(isItemActive);

                    if (isSingle || collapsed) {
                        const item = visibleItems[0];

                        return (
                            <Link
                                key={group.label}
                                href={route(item.href)}
                                title={collapsed ? group.label : undefined}
                                className={cn(
                                    'flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors',
                                    active ? 'bg-primary text-primary-foreground' : 'text-slate-700 hover:bg-muted',
                                    collapsed && 'justify-center',
                                )}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {!collapsed && <span>{group.label}</span>}
                            </Link>
                        );
                    }

                    const open = openGroup === group.label;
                    const panelId = groupPanelId(group.label);

                    return (
                        <div key={group.label}>
                            <button
                                type="button"
                                aria-expanded={open}
                                aria-controls={panelId}
                                onClick={() => setOpenGroup(open ? null : group.label)}
                                className={cn(
                                    'flex w-full items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors',
                                    active ? 'text-primary' : 'text-slate-700 hover:bg-muted',
                                )}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                <span className="flex-1 text-left">{group.label}</span>
                                <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', open && 'rotate-180')} />
                            </button>
                            <div
                                id={panelId}
                                className={cn(
                                    'grid transition-[grid-template-rows,visibility] duration-200 ease-out motion-reduce:transition-none',
                                    open ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]',
                                )}
                            >
                                <div className="min-h-0 overflow-hidden">
                                    <div className="ml-7 mt-1 space-y-1 border-l border-border pl-3">
                                        {visibleItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={route(item.href)}
                                                className={cn(
                                                    'block rounded px-2 py-1.5 text-sm transition-colors',
                                                    isItemActive(item)
                                                        ? 'font-medium text-primary'
                                                        : 'text-slate-600 hover:text-foreground',
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
                    <Link href={route('dashboard')} className="text-base font-semibold tracking-tight text-foreground">
                        Kenco CMS
                    </Link>
                )}
                <button
                    type="button"
                    onClick={onToggleCollapsed}
                    className="rounded p-1.5 text-slate-500 hover:bg-muted hover:text-foreground"
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                </button>
            </div>

            <SidebarNav collapsed={collapsed} />
        </aside>
    );
}
