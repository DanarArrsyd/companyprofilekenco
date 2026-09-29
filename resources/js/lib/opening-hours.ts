/**
 * Operating hours as structured rows (Settings → Contact): a day range and
 * its opening and closing time, e.g. Mon–Thu 08:00–16:00. Day and time
 * wording comes from the visitor's language, so nothing is typed twice.
 */
export const WEEK_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];

export interface OpeningHoursRow {
    from: WeekDay;
    to: WeekDay;
    /** 24-hour "HH:MM". */
    open: string;
    close: string;
}

type Locale = 'id' | 'en';

const INTL: Record<Locale, string> = { id: 'id-ID', en: 'en-GB' };

// 2024-01-01 was a Monday; day i of the week is 1 + i January 2024 (UTC).
const dayDate = (day: WeekDay) => new Date(Date.UTC(2024, 0, 1 + WEEK_DAYS.indexOf(day), 12));

export function dayName(day: WeekDay, locale: Locale): string {
    return new Intl.DateTimeFormat(INTL[locale], { weekday: 'long', timeZone: 'UTC' }).format(dayDate(day));
}

export function formatDays(row: OpeningHoursRow, locale: Locale): string {
    return row.from === row.to ? dayName(row.from, locale) : `${dayName(row.from, locale)} – ${dayName(row.to, locale)}`;
}

function formatTime(time: string, locale: Locale): string {
    const [hours, minutes] = time.split(':').map(Number);
    return new Intl.DateTimeFormat(INTL[locale], { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'UTC' }).format(
        new Date(Date.UTC(2024, 0, 1, hours, minutes)),
    );
}

export function formatTimeRange(row: OpeningHoursRow, locale: Locale): string {
    return `${formatTime(row.open, locale)} – ${formatTime(row.close, locale)}`;
}

/** Days no row covers, in week order (none when there is no schedule at all). */
export function closedDays(rows: OpeningHoursRow[]): WeekDay[] {
    if (rows.length === 0) return [];

    const open = new Set<WeekDay>();
    for (const row of rows) {
        const start = WEEK_DAYS.indexOf(row.from);
        const end = WEEK_DAYS.indexOf(row.to);
        for (let i = start; i <= end; i += 1) open.add(WEEK_DAYS[i]);
    }

    return WEEK_DAYS.filter((day) => !open.has(day));
}
