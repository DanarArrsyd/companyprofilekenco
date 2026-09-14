import { usePage } from '@inertiajs/react';

import { PageProps } from '@/types';

export function usePermissions() {
    const { auth } = usePage<PageProps>().props;

    const can = (permission: string): boolean => auth.permissions.includes(permission);

    const canAny = (permissions: string[]): boolean =>
        permissions.some((permission) => auth.permissions.includes(permission));

    return { can, canAny, permissions: auth.permissions, roles: auth.roles };
}
