import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';

import { Button } from '@/components/ui/button';

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    destructive = false,
    processing = false,
    onConfirm,
    onCancel,
}: {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    processing?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <Transition show={open} as={Fragment}>
            <Dialog onClose={onCancel} className="relative z-50">
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

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-sm rounded border border-border bg-surface p-6 shadow-sm">
                            <DialogTitle className="text-sm font-semibold text-foreground">
                                {title}
                            </DialogTitle>

                            {description && (
                                <p className="mt-2 text-sm text-slate-500">{description}</p>
                            )}

                            <div className="mt-6 flex justify-end gap-3">
                                <Button variant="secondary" size="sm" onClick={onCancel} disabled={processing}>
                                    {cancelLabel}
                                </Button>
                                <Button
                                    variant={destructive ? 'danger' : 'primary'}
                                    size="sm"
                                    onClick={onConfirm}
                                    disabled={processing}
                                >
                                    {confirmLabel}
                                </Button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    );
}
