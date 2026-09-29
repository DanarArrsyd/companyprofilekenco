import { mediaUrl } from '@/lib/media';

export interface CustomerLogo {
    id: number;
    name: string;
    logo: string | null;
}

/**
 * "Customers Served" logo wall (homepage only, no links — user decision
 * 2026-09-29). Every logo sits in the same white tile so wide and square
 * marks weigh the same; a customer without a logo shows its name.
 */
export function CustomerLogos({ customers }: { customers: CustomerLogo[] }) {
    return (
        <ul data-reveal-group className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
            {customers.map((customer) => (
                <li key={customer.id} className="flex aspect-[3/2] items-center justify-center rounded-lg border border-border bg-white p-5">
                    {customer.logo ? (
                        <img
                            src={mediaUrl(customer.logo) ?? undefined}
                            alt={customer.name}
                            loading="lazy"
                            decoding="async"
                            className="max-h-full max-w-full object-contain"
                        />
                    ) : (
                        <span className="text-center text-small font-semibold text-navy-900">{customer.name}</span>
                    )}
                </li>
            ))}
        </ul>
    );
}
