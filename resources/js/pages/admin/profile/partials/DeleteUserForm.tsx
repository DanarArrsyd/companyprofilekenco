import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, Fragment, useRef, useState } from 'react';

import InputError from '@/components/admin/InputError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DeleteUserForm({ className = '' }: { className?: string }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        password: '',
    });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-base font-semibold text-foreground">Delete Account</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                    Once your account is deleted, all of its resources and data will be permanently deleted. Before
                    deleting your account, please download any data or information that you wish to retain.
                </p>
            </header>

            <Button variant="danger" onClick={() => setConfirmingUserDeletion(true)}>
                Delete Account
            </Button>

            {/* Same shell as ConfirmDialog, with a password field for re-authentication. */}
            <Transition show={confirmingUserDeletion} as={Fragment}>
                <Dialog onClose={closeModal} initialFocus={passwordInput} className="relative z-50">
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
                            <DialogPanel className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-sm">
                                <form onSubmit={deleteUser}>
                                    <DialogTitle className="text-sm font-semibold text-foreground">
                                        Are you sure you want to delete your account?
                                    </DialogTitle>
                                    <p className="mt-2 text-sm text-slate-500">
                                        All of its resources and data will be permanently deleted. Enter your password to
                                        confirm.
                                    </p>

                                    <div className="mt-5">
                                        <Label htmlFor="delete_password" className="sr-only">
                                            Password
                                        </Label>
                                        <Input
                                            id="delete_password"
                                            type="password"
                                            name="password"
                                            ref={passwordInput}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            autoComplete="current-password"
                                            placeholder="Password"
                                        />
                                        <InputError message={errors.password} className="mt-2" />
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <Button type="button" variant="secondary" size="sm" onClick={closeModal} disabled={processing}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" variant="danger" size="sm" disabled={processing}>
                                            Delete Account
                                        </Button>
                                    </div>
                                </form>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </Dialog>
            </Transition>
        </section>
    );
}
