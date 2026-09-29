import { Plus, Trash2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { closedDays, dayName, formatDays, formatTimeRange, WEEK_DAYS, type OpeningHoursRow, type WeekDay } from '@/lib/opening-hours';

const selectClass = 'h-11 w-full rounded border border-border bg-surface px-3 text-sm';

/**
 * Operating hours as rows (day range + opening/closing time). Days not
 * covered by any row show as "Tutup" on the site; the preview below the rows
 * is exactly what visitors read.
 */
export function OperatingHoursField({
    value,
    onChange,
    errors,
}: {
    value: OpeningHoursRow[];
    onChange: (rows: OpeningHoursRow[]) => void;
    errors: Partial<Record<string, string>>;
}) {
    const update = (index: number, patch: Partial<OpeningHoursRow>) =>
        onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));

    const add = () => {
        const covered = new Set(closedDays(value));
        const next: WeekDay = value.length === 0 ? 'mon' : (WEEK_DAYS.find((day) => covered.has(day)) ?? 'sat');
        onChange([...value, { from: next, to: next, open: '08:00', close: '17:00' }]);
    };

    const closed = closedDays(value);

    return (
        <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-foreground">Jam operasional</legend>
            <p className="text-sm text-slate-500">Satu baris per jadwal. Hari yang tidak ada di daftar otomatis tampil “Tutup”.</p>

            {value.map((row, index) => {
                const rowError = ['from', 'to', 'open', 'close'].map((field) => errors[`operating_hours.${index}.${field}`]).find(Boolean);

                return (
                    <div key={index} className="rounded-lg border border-border p-3">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_7rem_7rem_auto] sm:items-center">
                            <select aria-label={`Hari mulai, jadwal ${index + 1}`} value={row.from} onChange={(e) => update(index, { from: e.target.value as WeekDay })} className={selectClass}>
                                {WEEK_DAYS.map((day) => <option key={day} value={day}>{dayName(day, 'id')}</option>)}
                            </select>
                            <select aria-label={`Sampai hari, jadwal ${index + 1}`} value={row.to} onChange={(e) => update(index, { to: e.target.value as WeekDay })} className={selectClass}>
                                {WEEK_DAYS.map((day) => <option key={day} value={day}>{day === row.from ? `${dayName(day, 'id')} (hari itu saja)` : `s/d ${dayName(day, 'id')}`}</option>)}
                            </select>
                            <Input type="time" aria-label={`Jam buka, jadwal ${index + 1}`} value={row.open} onChange={(e) => update(index, { open: e.target.value })} />
                            <Input type="time" aria-label={`Jam tutup, jadwal ${index + 1}`} value={row.close} onChange={(e) => update(index, { close: e.target.value })} />
                            <button
                                type="button"
                                onClick={() => onChange(value.filter((_, i) => i !== index))}
                                aria-label={`Hapus jadwal ${index + 1}`}
                                className="col-span-2 flex h-11 items-center justify-center gap-2 rounded border border-border text-sm text-danger hover:bg-danger/10 sm:col-span-1 sm:w-11"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="sm:hidden">Hapus</span>
                            </button>
                        </div>
                        {rowError && <p className="mt-2 text-sm text-danger">{rowError}</p>}
                    </div>
                );
            })}

            <button
                type="button"
                onClick={add}
                disabled={value.length >= 7}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm font-medium text-navy-700 hover:bg-muted disabled:opacity-50"
            >
                <Plus className="h-4 w-4" />
                Tambah jadwal
            </button>

            {value.length > 0 && (
                <div className="rounded-lg bg-muted px-4 py-3 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tampil di website</p>
                    <dl className="mt-2 space-y-1">
                        {value.map((row, index) => (
                            <div key={index} className="flex justify-between gap-4">
                                <dt className="text-slate-700">{formatDays(row, 'id')}</dt>
                                <dd className="tabular-nums text-foreground">{formatTimeRange(row, 'id')}</dd>
                            </div>
                        ))}
                        {closed.length > 0 && (
                            <div className="flex justify-between gap-4">
                                <dt className="text-slate-700">{closed.map((day) => dayName(day, 'id')).join(', ')}</dt>
                                <dd className="text-slate-500">Tutup</dd>
                            </div>
                        )}
                    </dl>
                </div>
            )}
        </fieldset>
    );
}
