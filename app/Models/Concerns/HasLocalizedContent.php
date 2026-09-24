<?php

namespace App\Models\Concerns;

use App\Support\LocalizedContent;
use Spatie\Translatable\HasTranslations;

/**
 * Translatable CMS text stored as {"en": "...", "id": "..."} (see
 * $translatable on the model). Reading an attribute — or serializing the
 * model for Inertia — yields the current locale, falling back to English;
 * translationsFor() exposes every locale for the admin edit forms.
 */
trait HasLocalizedContent
{
    use HasTranslations;

    /** Serialize translatable attributes in the current locale instead of as locale maps. */
    public function attributesToArray(): array
    {
        $attributes = parent::attributesToArray();

        $secondary = [];

        foreach ($this->getTranslatableAttributes() as $key) {
            if (! array_key_exists($key, $attributes)) {
                continue;
            }

            $attributes[$key] = $this->getAttributeValue($key);

            if (LocalizedContent::$serializeAllLocales) {
                foreach ($this->getTranslations($key) as $locale => $value) {
                    if ($locale !== self::sourceLocale()) {
                        $secondary[$locale][$key] = $value;
                    }
                }
            }
        }

        if (LocalizedContent::$serializeAllLocales) {
            // {"id": {"name": "…"}} — the shape the admin forms submit back.
            $attributes['translations'] = (object) $secondary;
        }

        return $attributes;
    }

    /**
     * Accept a `translations` key alongside normal attributes, so
     * create()/update() with validated admin input stores every locale.
     */
    public function fill(array $attributes)
    {
        $translations = $attributes['translations'] ?? null;
        unset($attributes['translations']);

        parent::fill($attributes);

        if (is_array($translations)) {
            $this->applyTranslations($translations);
        }

        return $this;
    }

    /**
     * Apply submitted non-English translations, e.g. ['id' => ['name' => '…']].
     * An empty value removes that translation so the English text shows
     * through again; fields not present in the input are left untouched.
     *
     * @param  array<string, array<string, mixed>>  $translations
     */
    public function applyTranslations(array $translations): static
    {
        foreach ($translations as $locale => $fields) {
            if ($locale === self::sourceLocale() || ! is_array($fields)) {
                continue;
            }

            foreach ($fields as $key => $value) {
                if (! $this->isTranslatableAttribute($key)) {
                    continue;
                }

                $value = is_string($value) ? trim($value) : $value;

                if ($value === null || $value === '') {
                    $this->forgetTranslation($key, $locale);
                } else {
                    $this->setTranslation($key, $locale, $value);
                }
            }
        }

        return $this;
    }

    /** Admin content is authored in English; other locales are translations of it. */
    private static function sourceLocale(): string
    {
        return 'en';
    }

    /**
     * Every locale of the given (default: all) translatable attributes.
     *
     * @param  list<string>|null  $keys
     * @return array<string, array<string, string>>
     */
    public function translationsFor(?array $keys = null): array
    {
        $translations = [];

        foreach ($keys ?? $this->getTranslatableAttributes() as $key) {
            $translations[$key] = $this->getTranslations($key);
        }

        return $translations;
    }
}
