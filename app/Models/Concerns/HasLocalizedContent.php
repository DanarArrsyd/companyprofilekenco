<?php

namespace App\Models\Concerns;

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

        foreach ($this->getTranslatableAttributes() as $key) {
            if (array_key_exists($key, $attributes)) {
                $attributes[$key] = $this->getAttributeValue($key);
            }
        }

        return $attributes;
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
