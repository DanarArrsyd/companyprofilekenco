import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import { usePermissions } from '@/hooks/use-permissions';
import { adminNavGroups } from '@/lib/admin-nav';
import { cn } from '@/lib/utils';

function isGroupVisible(permission: string | undefined, can: (p: string) => boolean) {
    return !permission || can(permission);
}

export function SidebarNav({ collapsed = false }: { collapsed?: boolean }) {
    const { can } = usePermissions();

    return (
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {adminNavGroups
                .filter((group) => isGroupVisible(group.permission, can) && group.items.some((item) => isGroupVisible(item.permission, can)))
                .map((group) => {
                    const Icon = group.icon;
                    const visibleItems = group.items.filter((item) => isGroupVisible(item.permission, can));
                    const isSingle = visibleItems.length === 1;
                    const active = visibleItems.some((item) => route().current(item.href) || route().current(`${item.href}.*`));

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

                    return (
                        <Disclosure key={group.label} defaultOpen={active}>
                            {({ open }) => (
                                <div>
                                    <DisclosureButton
                                        className={cn(
                                            'flex w-full items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors',
                                            active ? 'text-primary' : 'text-slate-700 hover:bg-muted',
                                        )}
                                    >
                                        <Icon className="h-4 w-4 shrink-0" />
                                        <span className="flex-1 text-left">{group.label}</span>
                                        <ChevronDown
                                            className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
                                        />
                                    </DisclosureButton>
                                    <DisclosurePanel className="ml-7 mt-1 space-y-1 border-l border-border pl-3">
                                        {visibleItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={route(item.href)}
                                                className={cn(
                                                    'block rounded px-2 py-1.5 text-sm transition-colors',
                                                    route().current(item.href)
                                                        ? 'font-medium text-primary'
                                                        : 'text-slate-600 hover:text-foreground',
                                                )}
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </DisclosurePanel>
                                </div>
                            )}
                        </Disclosure>
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
                'hidden shrink-0 flex-col border-r border-border bg-surface transition-all sm:flex',
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
