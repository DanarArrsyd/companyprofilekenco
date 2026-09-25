import { forwardRef, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from 'react';
import { clsx } from 'clsx';

/**
 * Vertical rhythm tiers for public sections (DESIGN.md "Section Spacing").
 * - section: standalone content blocks — 64 / 96 / 112px (mobile / tablet / desktop)
 * - intro:   page title bands and compact strips — 56 / 64 / 80px
 * - content: page body directly below an intro band — 48 / 56 / 64px
 * Values are rem-based so the proportional desktop scaling still applies.
 * Classes join with clsx, not twMerge: custom tokens like `text-small` would
 * otherwise be read as a colour and drop `text-muted-foreground`. To change
 * spacing, pick another tier (or `none` plus your own padding).
 */
export const sectionSpacing = {
    none: '',
    section: 'py-16 md:py-24 lg:py-28',
    intro: 'py-14 md:py-16 lg:py-20',
    content: 'py-12 md:py-14 lg:py-16',
} as const;

export type SectionSpacing = keyof typeof sectionSpacing;

type ContainerProps<T extends ElementType> = {
    as?: T;
    spacing?: SectionSpacing;
    className?: string;
    children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>;

/** Centered 80rem content column with the public horizontal gutters (20 / 24 / 32px). */
export function Container<T extends ElementType = 'div'>({ as, spacing = 'none', className, children, ...props }: ContainerProps<T>) {
    const Component: ElementType = as ?? 'div';

    return (
        <Component className={clsx('mx-auto w-full max-w-content px-5 sm:px-6 lg:px-8', sectionSpacing[spacing], className)} {...props}>
            {children}
        </Component>
    );
}

type SectionProps = ComponentPropsWithoutRef<'section'> & {
    spacing?: SectionSpacing;
    /** Classes for the inner container (grid, alignment, extra spacing). */
    containerClassName?: string;
};

/** Full-bleed `<section>` (backgrounds, borders) wrapping a spaced Container. */
export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
    { spacing = 'section', containerClassName, children, ...props },
    ref,
) {
    return (
        <section ref={ref} {...props}>
            <Container spacing={spacing} className={containerClassName}>
                {children}
            </Container>
        </section>
    );
});
