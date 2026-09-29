import { ReactNode } from 'react';

import { FieldHint } from '@/components/admin/FieldHint';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fromDateTimeInput, toDateTimeInput } from '@/lib/datetime-input';
import { statusLabel } from '@/lib/status-labels';

/** Status, publish date and the page's single save button. */
export function PublishPanel({
    status,
    statusOptions,
    onStatusChange,
    publishedAt,
    onPublishedAtChange,
    isDirty,
    processing,
    previewUrl,
    children,
}: {
    status: string;
    statusOptions: string[];
    onStatusChange: (status: string) => void;
    publishedAt?: string;
    onPublishedAtChange?: (value: string) => void;
    isDirty: boolean;
    processing: boolean;
    previewUrl?: string;
    /** Extra settings shown above the buttons (featured, sort order…). */
    children?: ReactNode;
}) {
    return (
        <section className="space-y-4 rounded-lg border border-border bg-surface p-5">
            {isDirty && (
                <p role="status" className="flex items-center gap-2 rounded bg-warning/10 px-3 py-2 text-sm font-medium text-warning">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-warning" aria-hidden="true" />
                    Ada perubahan yang belum disimpan
                </p>
            )}

            <div>
                <Label htmlFor="status">Status</Label>
                <select
                    id="status"
                    aria-describedby="status-help"
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded border border-border bg-surface px-3 text-sm"
                >
                    {statusOptions.map((option) => (
                        <option key={option} value={option}>
                            {statusLabel(option)}
                        </option>
                    ))}
                </select>
                <FieldHint id="status-help">Hanya yang berstatus “Tayang” terlihat oleh pengunjung.</FieldHint>
            </div>

            {onPublishedAtChange && (
                <div>
                    <Label htmlFor="published_at">Tanggal tayang</Label>
                    <Input
                        id="published_at"
                        aria-describedby="published_at-help"
                        type="datetime-local"
                        value={toDateTimeInput(publishedAt ?? '')}
                        onChange={(e) => onPublishedAtChange(fromDateTimeInput(e.target.value))}
                        className="mt-1.5"
                    />
                    <FieldHint id="published_at-help">Kosongkan untuk tayang saat disimpan. Tanggal di masa depan = terjadwal.</FieldHint>
                </div>
            )}

            {children}

            <div className="flex flex-col gap-2 pt-1">
                <Button type="submit" disabled={processing} className="h-11 w-full">
                    {processing ? 'Menyimpan…' : 'Simpan perubahan'}
                </Button>
                {previewUrl && (
                    <a
                        href={previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 w-full items-center justify-center rounded border border-border bg-surface text-sm font-medium text-foreground hover:bg-muted"
                    >
                        Pratinjau
                    </a>
                )}
            </div>
            <p className="text-center text-xs text-slate-500">Satu tombol menyimpan semua isi halaman ini.</p>
        </section>
    );
}
