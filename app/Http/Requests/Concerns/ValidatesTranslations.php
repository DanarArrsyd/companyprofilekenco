<?php

namespace App\Http\Requests\Concerns;

use App\Support\Locale;

/**
 * Adds optional `translations.{locale}.{field}` rules mirroring the English
 * field rules, minus any "required" constraint — English stays mandatory,
 * translations are optional and fall back to English when blank.
 */
trait ValidatesTranslations
{
    /**
     * @param  array<string, mixed>  $rules
     * @param  list<string>  $fields
     * @return array<string, mixed>
     */
    protected function withTranslations(array $rules, array $fields, string $prefix = ''): array
    {
        foreach (Locale::SUPPORTED as $locale) {
            if ($locale === 'en') {
                continue;
            }

            foreach ($fields as $field) {
                $base = $rules[$prefix.$field] ?? ['string'];
                $base = is_string($base) ? explode('|', $base) : $base;

                $optional = array_values(array_filter(
                    $base,
                    fn ($rule) => ! (is_string($rule) && str_starts_with($rule, 'required')) && $rule !== 'nullable',
                ));

                $rules["{$prefix}translations.{$locale}.{$field}"] = ['nullable', ...$optional];
            }
        }

        return $rules;
    }
}
