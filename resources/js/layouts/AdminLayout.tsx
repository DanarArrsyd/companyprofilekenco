import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Link, usePage } from '@inertiajs/react';
import { X } from 'lucide-react';
import { Fragment, PropsWithChildren, useEffect, useState } from 'react';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar, SidebarNav } from '@/components/admin/AdminSidebar';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider, useToast } from '@/hooks/use-toast';
import { PageProps } from '@/types';

const SIDEBAR_STORAGE_KEY = 'admin-sidebar-collapsed';

function FlashBridge() {
    const { flash } = usePage<PageProps>().props;
    const { toast } = useToast();

    useEffect(() => {
        if (flash.success) toast('success', flash.success);
        if (flash.error) toast('error', flash.error);
        if (flash.warning) toast('warning', flash.warning);
        if (flash.info) toast('info', flash.info);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flash.success, flash.error, flash.warning, flash.info]);

    return null;
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
    return (
        <Transition show={open} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-50 sm:hidden">
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-charcoal/40" aria-hidden="true" />
                </TransitionChild>

                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="-translate-x-full"
                    enterTo="translate-x-0"
                    leave="ease-in duration-150"
                    leaveFrom="translate-x-0"
                    leaveTo="-translate-x-full"
                >
                    <DialogPanel className="fixed inset-y-0 left-0 flex w-72 flex-col bg-surface">
                        <div className="flex h-16 items-center justify-between border-b border-border px-4">
                            <Link href={route('dashboard')} className="text-base font-semibold tracking-tight text-foreground">
                                Kenco CMS
                            </Link>
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded p-1.5 text-slate-500 hover:bg-muted"
                                aria-label="Close navigation menu"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <SidebarNav />
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}

function AdminLayoutInner({ children }: PropsWithChildren) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {
        try {
            setCollapsed(window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1');
        } catch {
            // localStorage unavailable — keep default expanded state.
        }
    }, []);

    const toggleCollapsed = () => {
        setCollapsed((current) => {
            const next = !current;
            try {
                window.localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0');
            } catch {
                // ignore persistence failure
            }
            return next;
        });
    };

    return (
        <div className="flex min-h-screen bg-muted">
            <FlashBridge />
            <Toaster />

            <AdminSidebar collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
            <MobileDrawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

            <div className="flex min-w-0 flex-1 flex-col">
                <AdminHeader onOpenMobileNav={() => setMobileNavOpen(true)} />

                <main className="flex-1 overflow-x-hidden px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
                    <div className="mx-auto w-full max-w-7xl">{children}</div>
                </main>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }: PropsWithChildren) {
    return (
        <ToastProvider>
            <AdminLayoutInner>{children}</AdminLayoutInner>
        </ToastProvider>
    );
}
