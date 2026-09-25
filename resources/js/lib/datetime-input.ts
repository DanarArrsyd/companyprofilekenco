/*
 * `<input type="datetime-local">` has no timezone: it shows and returns wall
 * time. The server stores UTC, so admin forms keep the UTC ISO string in
 * their state and convert at the input — an admin in WIB who picks 10:00
 * publishes at 10:00 WIB (03:00 UTC), not seven hours later.
 */

const pad = (value: number) => String(value).padStart(2, '0');

/** Server timestamp (ISO, usually UTC) → `YYYY-MM-DDTHH:mm` in the browser's timezone. */
export function toDateTimeInput(value: string | null | undefined): string {
    if (!value) return '';

    // Laravel serializes microseconds (".000000Z"); Date only reads milliseconds.
    const date = new Date(value.replace(/\.(\d{3})\d+/, '.$1'));
    if (Number.isNaN(date.getTime())) return '';

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** `datetime-local` value in the browser's timezone → UTC ISO string; empty stays empty. */
export function fromDateTimeInput(value: string): string {
    if (!value) return '';

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}
