/**
 * Geometry of the Operating Values wheel (user design 2026-09-29,
 * resources/design/reference/wheelie_value.png): a coloured outer band carrying the
 * value's name, a pastel slice with its icon, and a white hub. Measured
 * from the 630 px artwork and drawn in a 640 × 640 viewBox.
 *
 * Angles are degrees, 0 = pointing right (3 o'clock), clockwise (SVG y
 * points down). The active value sits at 0°, facing the text.
 */
export const WHEEL = {
    size: 640,
    centre: 320,
    bandOuter: 315,
    bandInner: 247,
    sliceOuter: 239,
    sliceInner: 94,
    hub: 90,
    labelRadius: 281,
    iconRadius: 168,
    /** Half the width of the straight gap between neighbouring pieces. */
    gap: 3.5,
} as const;

export const VALUE_COLORS = ['green', 'yellow', 'red', 'blue', 'grey'] as const;
export type ValueColor = (typeof VALUE_COLORS)[number];

/** The colour a value is drawn in: the chosen preset, else the design's order. */
export function valueColor(color: string | null | undefined, index: number): ValueColor {
    return (VALUE_COLORS as readonly string[]).includes(color ?? '') ? (color as ValueColor) : VALUE_COLORS[index % VALUE_COLORS.length];
}

const round = (n: number) => Math.round(n * 100) / 100;

function point(radius: number, degrees: number): [number, number] {
    const rad = (degrees * Math.PI) / 180;
    return [round(WHEEL.centre + radius * Math.cos(rad)), round(WHEEL.centre + radius * Math.sin(rad))];
}

/**
 * A ring sector between `inner` and `outer` radius centred on `centre`°,
 * `span`° wide. Its straight sides are pulled in by WHEEL.gap so the gaps
 * between neighbours stay parallel, as in the artwork.
 */
export function sectorPath(centre: number, span: number, inner: number, outer: number): string {
    const start = centre - span / 2;
    const end = centre + span / 2;
    const shift = (r: number) => (Math.asin(WHEEL.gap / r) * 180) / Math.PI;
    const [x1, y1] = point(outer, start + shift(outer));
    const [x2, y2] = point(outer, end - shift(outer));
    const [x3, y3] = point(inner, end - shift(inner));
    const [x4, y4] = point(inner, start + shift(inner));
    const large = span > 180 ? 1 : 0;

    return `M${x1} ${y1}A${outer} ${outer} 0 ${large} 1 ${x2} ${y2}L${x3} ${y3}A${inner} ${inner} 0 ${large} 0 ${x4} ${y4}Z`;
}

/**
 * The arc a label is written along. Clockwise reads upright on the top half
 * of the wheel; `flipped` runs it anticlockwise so text on the bottom half
 * is not upside down.
 */
export function labelArc(centre: number, span: number, flipped: boolean): string {
    const r = WHEEL.labelRadius;
    const [sx, sy] = point(r, flipped ? centre + span / 2 : centre - span / 2);
    const [ex, ey] = point(r, flipped ? centre - span / 2 : centre + span / 2);

    return `M${sx} ${sy}A${r} ${r} 0 0 ${flipped ? 0 : 1} ${ex} ${ey}`;
}

/** Where a slice centred on `degrees` lands on screen after the wheel turns by `rotation`, in [0, 360). */
export function screenAngle(degrees: number, rotation: number): number {
    return (((degrees + rotation) % 360) + 360) % 360;
}

/** Labels on the lower half of the screen are written anticlockwise so they read upright. */
export function labelFlipped(degrees: number, rotation: number): boolean {
    return Math.sin((screenAngle(degrees, rotation) * Math.PI) / 180) > 0.2;
}

/** Steps (signed, shortest way round) to go from value `from` to value `to` of `count`. */
export function shortestSteps(from: number, to: number, count: number): number {
    const forward = (((to - from) % count) + count) % count;

    return forward > count / 2 ? forward - count : forward;
}

export { point as wheelPoint };
