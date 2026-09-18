import { Head, Link } from '@inertiajs/react';
import { Home, TriangleAlert } from 'lucide-react';

import { SectionHeader } from '@/components/public/SectionHeader';
import { Button } from '@/components/ui/button';
import PublicLayout from '@/layouts/PublicLayout';

const STATUS_COPY: Record<number, { eyebrow: string; heading: string; description: string }> = {
    403: {
        eyebrow: 'Error 403',
        heading: 'Access Denied',
        description: "You don't have permission to view this page.",
    },
    404: {
        eyebrow: 'Error 404',
        heading: 'Page Not Found',
        description: "The page you're looking for doesn't exist or may have been moved.",
    },
    419: {
        eyebrow: 'Error 419',
        heading: 'Page Expired',
        description: 'Your session expired. Please go back and try again.',
    },
    429: {
        eyebrow: 'Error 429',
        heading: 'Too Many Requests',
        description: 'Please wait a moment before trying again.',
    },
    500: {
        eyebrow: 'Error 500',
        heading: 'Something Went Wrong',
        description: 'An unexpected error occurred on our end. Please try again shortly.',
    },
    503: {
        eyebrow: 'Error 503',
        heading: 'Service Unavailable',
        description: "We're performing scheduled maintenance. Please check back soon.",
    },
};

export default function Error({ status }: { status: number }) {
    const copy = STATUS_COPY[status] ?? STATUS_COPY[500];

    return (
        <PublicLayout>
            <Head title={copy.heading}>
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <section className="border-b border-border">
                <div className="mx-auto flex max-w-content flex-col items-center px-5 py-24 text-center sm:px-6 lg:px-8">
                    <TriangleAlert className="h-10 w-10 text-slate-500" strokeWidth={1.5} aria-hidden="true" />

                    <SectionHeader
                        as="h1"
                        align="center"
                        eyebrow={copy.eyebrow}
                        heading={copy.heading}
                        description={copy.description}
                        className="mt-6"
                    />

                    <Button asChild className="mt-8">
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                            Back to Homepage
                        </Link>
                    </Button>
                </div>
            </section>
        </PublicLayout>
    );
}
