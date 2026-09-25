import { Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { ContactInfoPanel } from '@/components/public/ContactInfoPanel';
import { useLocale } from '@/hooks/use-locale';
import { Section } from '@/components/public/Section';

export function ContactCTA({ heading, description }: { heading?: string; description?: string }) {
    const { localize, t } = useLocale();
    return (
        <Section className="bg-secondary" spacing="intro" containerClassName="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            <div>
                <h2 className="text-h3 text-navy-900">{heading ?? t('Let’s discuss your next production run')}</h2>
                {description && <p className="mt-3 max-w-md text-body text-slate-700">{description}</p>}
                <Button asChild className="mt-6">
                    <Link href={localize('/contact')}>{t('Contact Us')}</Link>
                </Button>
            </div>

            <div className="lg:justify-self-end">
                <ContactInfoPanel compact />
            </div>
        </Section>
    );
}
