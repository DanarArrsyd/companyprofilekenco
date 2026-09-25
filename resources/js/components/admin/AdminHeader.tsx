import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, LogOut, Menu as MenuIcon, UserCircle } from 'lucide-react';

import { PageProps } from '@/types';
import { cn } from '@/lib/utils';

export function AdminHeader({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
    const { auth } = usePage<PageProps>().props;

    return (
        <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
            <button
                type="button"
                onClick={onOpenMobileNav}
                className="rounded p-2 text-slate-700 hover:bg-muted sm:hidden"
                aria-label="Open navigation menu"
            >
                <MenuIcon className="h-5 w-5" />
            </button>

            <span className="hidden text-sm text-slate-500 sm:block" />

            <Menu as="div" className="relative">
                <MenuButton className="flex items-center gap-2 rounded px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-muted">
                    <UserCircle className="h-5 w-5" />
                    <span className="hidden sm:inline">{auth.user.name}</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                </MenuButton>

                <MenuItems
                    anchor="bottom end"
                    className="z-40 mt-2 w-48 rounded border border-border bg-surface p-1 shadow-sm focus:outline-none"
                >
                    <MenuItem>
                        {({ focus }) => (
                            <Link
                                href={route('profile.edit')}
                                className={cn(
                                    'block rounded px-3 py-2 text-sm text-foreground',
                                    focus && 'bg-muted',
                                )}
                            >
                                Profile
                            </Link>
                        )}
                    </MenuItem>
                    <MenuItem>
                        {({ focus }) => (
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className={cn(
                                    'flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-danger',
                                    focus && 'bg-danger/10',
                                )}
                            >
                                <LogOut className="h-4 w-4" />
                                Log Out
                            </Link>
                        )}
                    </MenuItem>
                </MenuItems>
            </Menu>
        </header>
    );
}
