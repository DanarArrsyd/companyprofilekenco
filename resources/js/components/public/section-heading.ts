const CAVEAT_HEADING_CLASS = 'font-caveat text-[clamp(2.75rem,1.75rem+4vw,4.5rem)] leading-[1.05] font-semibold';

export function getSectionHeadingClass(settings: Record<string, unknown> | null): string {
    return settings?.heading_font === 'caveat' ? CAVEAT_HEADING_CLASS : 'text-h2 text-navy-900';
}
