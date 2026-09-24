import type { ChangeEvent } from 'react';

/**
 * Admin content is authored in English; other locales are optional
 * translations submitted as `translations.{locale}.{field}` and stored by
 * HasLocalizedContent on the server. A blank translation falls back to the
 * English text on the public site.
 */
export type ContentLocale = 'en' | 'id';

export type TranslationValues = Record<string, string>;

export interface TranslatableFormData {
    translations: { id: TranslationValues };
}

/** Server shape: `model.translations.id.field` (admin requests only). */
export interface WithTranslations {
    translations?: { id?: Record<string, string | null> } | null;
}

/** Initial `translations` form state for the given fields (source: a model loaded on an admin page). */
export function initialTranslations(source: object | null | undefined, fields: string[]): { id: TranslationValues } {
    const id = (source as WithTranslations | null | undefined)?.translations?.id;

    return {
        id: Object.fromEntries(fields.map((field) => [field, id?.[field] ?? ''])),
    };
}

type ChangeValue = string | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

type SetData<TData> = (updater: (previous: TData) => TData) => void;

/**
 * Binds a translatable field to the English value or to its translation,
 * depending on the active content tab. In the translation tab the English
 * text is offered as the placeholder so translators see the source.
 */
export function translatableBinder<TData extends TranslatableFormData>(data: TData, setData: SetData<TData>, locale: ContentLocale) {
    return (field: Extract<keyof TData, string>) => {
        const english = String(data[field] ?? '');

        return {
            value: locale === 'en' ? english : (data.translations.id[field] ?? ''),
            placeholder: locale === 'en' ? undefined : english || undefined,
            onChange: (next: ChangeValue) => {
                const value = typeof next === 'string' ? next : next.target.value;

                setData((previous) =>
                    locale === 'en'
                        ? { ...previous, [field]: value }
                        : { ...previous, translations: { ...previous.translations, id: { ...previous.translations.id, [field]: value } } },
                );
            },
        };
    };
}

/** The validation error for a translatable field in the active tab. */
export function translatableError(errors: Partial<Record<string, string>>, field: string, locale: ContentLocale, prefix = ''): string | undefined {
    return locale === 'en' ? errors[`${prefix}${field}`] : errors[`${prefix}translations.${locale}.${field}`];
}

/** How many of the fields already have a translation — shown on the tab. */
export function countTranslated(values: TranslationValues): number {
    return Object.values(values).filter((value) => value.trim() !== '').length;
}

/**
 * Structured CMS content (a PageSection's `content`) stores a translated
 * text value as {"en": "...", "id": "..."}; untranslated text stays a plain
 * string shared by every locale. Mirrors App\Support\LocalizedContent.
 */
export type LocalizedText = string | { en?: string; id?: string };

function isLocaleMap(value: unknown): value is { en?: string; id?: string } {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

    const keys = Object.keys(value);

    return keys.length > 0 && keys.every((key) => key === 'en' || key === 'id');
}

/** The English source of a content text value. */
export function englishOf(value: unknown): string {
    if (typeof value === 'string') return value;

    return isLocaleMap(value) ? value.en ?? '' : '';
}

/** A content text value as edited in one locale's tab (translations start blank). */
export function readText(value: unknown, locale: ContentLocale): string {
    if (locale === 'en') return englishOf(value);

    return isLocaleMap(value) ? value[locale] ?? '' : '';
}

/**
 * Write one locale of a content text value. Collapses back to a plain
 * string when no translation remains, so untouched content keeps its
 * original shape.
 */
export function writeText(value: unknown, locale: ContentLocale, next: string): LocalizedText {
    const map: { en?: string; id?: string } = isLocaleMap(value) ? { ...value } : { en: englishOf(value) };

    map[locale] = next;

    if (!map.id || map.id.trim() === '') return map.en ?? '';

    return { en: map.en ?? '', id: map.id };
}
