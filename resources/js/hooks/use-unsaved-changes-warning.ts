import { router } from '@inertiajs/react';
import { useEffect } from 'react';

const MESSAGE = 'Ada perubahan yang belum disimpan. Tinggalkan halaman ini?';

/**
 * Asks before leaving a form with unsaved changes: in-app navigation (Inertia
 * GET visits) and closing or reloading the tab. Form submissions pass through.
 */
export function useUnsavedChangesWarning(isDirty: boolean): void {
    useEffect(() => {
        if (!isDirty) return;

        const removeBefore = router.on('before', (event) => {
            const { method } = event.detail.visit;
            if (method === 'get' && !window.confirm(MESSAGE)) event.preventDefault();
        });

        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', onBeforeUnload);

        return () => {
            removeBefore();
            window.removeEventListener('beforeunload', onBeforeUnload);
        };
    }, [isDirty]);
}
