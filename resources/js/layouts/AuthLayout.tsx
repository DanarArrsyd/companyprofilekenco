import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function AuthLayout({ children }: PropsWithChildren) {
    const { siteSettings } = usePage().props;
    const companyName = siteSettings?.company_name ?? 'PT. Kenco Manufactur Indonesia';

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-navy-900 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="mb-8 flex justify-center">
                    <Link href="/" className="text-xl font-semibold tracking-tight text-white">
                        {companyName}
                    </Link>
                </div>

                <div className="rounded border border-border bg-surface px-6 py-8 shadow-sm sm:px-8">
                    {children}
                </div>

                <p className="mt-6 text-center text-xs text-slate-500 text-opacity-80">
                    Admin CMS &middot; Authorized personnel only
                </p>
            </div>
        </div>
    );
}
