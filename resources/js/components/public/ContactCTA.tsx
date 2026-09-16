import { Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { ContactInfoPanel } from '@/components/public/ContactInfoPanel';

export function ContactCTA({ heading, description }: { heading?: string; description?: string }) {
    return (
        <section className="bg-secondary">
            <div className="mx-auto grid max-w-content grid-cols-1 gap-10 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-20">
                <div>
                    <h2 className="text-h3 text-navy-900">{heading ?? 'Let’s discuss your next production run'}</h2>
                    {description && <p className="mt-3 max-w-md text-body text-slate-700">{description}</p>}
                    <Button asChild className="mt-6">
                        <Link href="/contact">Contact Us</Link>
                    </Button>
                </div>

                <div className="lg:justify-self-end">
                    <ContactInfoPanel compact />
                </div>
            </div>
        </section>
    );
}
