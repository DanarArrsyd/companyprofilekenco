import { mediaUrl } from '@/lib/media';

export interface CustomerLogo {
    id: number;
    name: string;
    logo: string | null;
}

/** Enough logos per loop that a short list still fills a wide screen. */
const MIN_PER_LOOP = 8;
/** Seconds each logo takes to pass: a steady pace whatever the count. */
const SECONDS_PER_LOGO = 3.2;

/**
 * One "Customers Served" row (user reference 2026-09-29): logos on the page
 * background, grey until the pointer (or a tap) is on one, drifting right to
 * left without end. The list is repeated to fill a loop and the loop is
 * rendered twice, so translating the track by -50% lands exactly where it
 * started. Hovering the row pauses it; reduced motion shows one still row.
 * No links (homepage only). CSS lives in app.css (.logo-marquee).
 */
export function CustomerLogos({ customers }: { customers: CustomerLogo[] }) {
    const repeats = Math.max(1, Math.ceil(MIN_PER_LOOP / customers.length));
    const loop = Array.from({ length: repeats }, () => customers).flat();
    const duration = `${loop.length * SECONDS_PER_LOGO}s`;

    return (
        <div className="logo-marquee" style={{ ['--marquee-duration' as string]: duration }}>
            <div className="logo-marquee__track">
                {[0, 1].map((copy) => (
                    <ul key={copy} className="logo-marquee__group" aria-hidden={copy === 1 ? true : undefined}>
                        {loop.map((customer, index) => {
                            // Screen readers get each customer once: the first pass of the first copy.
                            const hidden = copy === 1 || index >= customers.length;

                            return (
                                <li key={`${customer.id}-${index}`} className="logo-marquee__item" aria-hidden={hidden && copy === 0 ? true : undefined}>
                                    {customer.logo ? (
                                        <img
                                            src={mediaUrl(customer.logo) ?? undefined}
                                            alt={hidden ? '' : customer.name}
                                            loading="lazy"
                                            decoding="async"
                                            draggable={false}
                                            className="logo-marquee__logo"
                                        />
                                    ) : (
                                        <span className="logo-marquee__name">{customer.name}</span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                ))}
            </div>
        </div>
    );
}
