/**
 * Indonesian display labels for the locked status values (user decision
 * 2026-09-29: values stay fixed because the system depends on them; only the
 * words shown change). Unknown values fall back to the raw value.
 */
const LABELS: Record<string, string> = {
    draft: 'Draf',
    published: 'Tayang',
    archived: 'Diarsipkan',
};

export function statusLabel(value: string): string {
    return LABELS[value] ?? value;
}
