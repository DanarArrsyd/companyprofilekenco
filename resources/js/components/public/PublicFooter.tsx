import { Link, usePage } from '@inertiajs/react';
import { ChevronRight, Instagram, Linkedin, Youtube, type LucideIcon } from 'lucide-react';

import { Container } from '@/components/public/Section';
import { useLocale } from '@/hooks/use-locale';

import mascot from '../../../img/footer_maskot1.webp';
import wave from '../../../img/element_footer.webp';

/**
 * "Connect With Us" footer (user reference, 2026-09-26): a navy wave
 * (resources/img/element_footer — its navy is the navy-950 token) rising to
 * the right, the KMI mascot standing on the left with his head above the
 * wave, and the call to action on the right. The info strip (links,
 * address, copyright) was removed on 2026-09-26 pending a redesign.
 *
 * The wave image scales with the viewport width, so the content overlaps it
 * by a vw amount; everything else is rem so desktop scaling still applies.
 */
export function PublicFooter() {
    const { localize, t } = useLocale();
    const { siteSettings } = usePage().props;
    const companyName = siteSettings?.company_name ?? 'PT. Kenco Manufactur Indonesia';

    const socials = [
        { label: 'LinkedIn', href: siteSettings?.social?.linkedin, icon: Linkedin },
        { label: 'Instagram', href: siteSettings?.social?.instagram, icon: Instagram },
        { label: 'YouTube', href: siteSettings?.social?.youtube, icon: Youtube },
    ].filter((social): social is { label: string; href: string; icon: LucideIcon } => Boolean(social.href));

    return (
        <footer className="relative isolate overflow-x-clip text-white">
            {/* overflow-x-clip, not hidden: the mascot's head may rise above the footer's top edge. */}
            <img src={wave} alt="" aria-hidden="true" className="pointer-events-none block h-auto w-full select-none" draggable={false} />

            {/* flow-root: the content's negative top margin must not drag this navy background up over the wave's arc and star. -mt-0.5 hides the resampled bottom edge of the wave image. */}
            <div className="relative -mt-0.5 flow-root bg-navy-950">
                {/* Desktop mascot: stands on the footer's bottom edge, head rising past the wave. */}
                <div
                    data-reveal="up"
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 left-[max(0rem,calc(50%_-_45rem))] z-0 hidden h-[36rem] w-[40rem] overflow-hidden lg:block"
                >
                    <img src={mascot} alt="" className="w-full select-none" draggable={false} />
                </div>

                <Container className="relative z-10 -mt-[2vw] pb-6 sm:-mt-[8vw] lg:-mt-[19vw] lg:pb-20">
                    <div className="lg:ml-auto lg:w-[26rem] xl:w-[28rem]">
                        <div data-reveal-group>
                            <h2 className="text-balance font-montserrat text-[2.75rem] font-bold leading-[1.02] tracking-tight sm:text-[3.5rem] lg:text-[4rem]">
                                {t('Connect With Us')}
                            </h2>
                            <p className="mt-5 max-w-md font-montserrat text-body-lg leading-snug text-white/90">
                                {t('Stay connected with :company for the latest updates, collaborations, and opportunities.', { company: companyName })}
                            </p>

                            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                                {socials.length > 0 && (
                                    <ul className="flex items-center gap-3">
                                        {socials.map(({ label, href, icon: Icon }) => (
                                            <li key={label}>
                                                <a
                                                    href={href}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    aria-label={label}
                                                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-navy-950 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
                                                >
                                                    <Icon className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <Link
                                    href={localize('/contact')}
                                    className="group ml-auto inline-flex items-center gap-6 rounded-full bg-white py-2.5 pl-5 pr-4 font-montserrat text-body-lg font-bold text-navy-950 transition-colors duration-200 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
                                >
                                    {t('Contact Us')}
                                    <ChevronRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.5} aria-hidden="true" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </Container>

                {/* Mobile/tablet mascot: below the call to action, cut at the waist. */}
                <div aria-hidden="true" className="pointer-events-none mx-auto -mt-4 h-[19rem] w-[20rem] overflow-hidden sm:h-[23rem] sm:w-[24rem] lg:hidden">
                    <img src={mascot} alt="" className="w-full select-none" draggable={false} />
                </div>
            </div>
        </footer>
    );
}
