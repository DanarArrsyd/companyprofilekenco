<?php

namespace App\Support;

/**
 * Resolves translatable text nested inside structured CMS content (e.g. a
 * PageSection's `content` array). Any value shaped like {"en": "...",
 * "id": "..."} collapses to the requested locale, falling back to English;
 * plain values (legacy strings, image paths, item IDs) pass through, so
 * shared data stays shared across languages.
 */
final class LocalizedContent
{
    public const FALLBACK = 'en';

    /**
     * When true (admin requests, set by SetLocale), translatable models also
     * serialize a `translations` key with every non-English locale so edit
     * forms can show and resubmit them.
     */
    public static bool $serializeAllLocales = false;

    /**
     * When true (admin saves sent with X-Auto-Translate: 1 and a configured
     * translator, set by SetLocale), translatable models fill the other
     * language on save — see App\Actions\Translation\AutoTranslateChanges.
     */
    public static bool $autoTranslate = false;

    /** The language tab the admin saved from ("en" or "id"); the other language follows it. */
    public static string $autoTranslateSource = 'en';

    public static function resolve(mixed $value, ?string $locale = null): mixed
    {
        if (! is_array($value)) {
            return $value;
        }

        if (self::isLocaleMap($value)) {
            $locale ??= app()->getLocale();
            $text = $value[$locale] ?? null;

            return ($text === null || $text === '') ? ($value[self::FALLBACK] ?? null) : $text;
        }

        foreach ($value as $key => $item) {
            $value[$key] = self::resolve($item, $locale);
        }

        return $value;
    }

    /** A non-empty associative array whose keys are all supported locales. */
    public static function isLocaleMap(array $value): bool
    {
        if ($value === [] || array_is_list($value)) {
            return false;
        }

        foreach (array_keys($value) as $key) {
            if (! in_array($key, Locale::SUPPORTED, true)) {
                return false;
            }
        }

        return true;
    }
}
