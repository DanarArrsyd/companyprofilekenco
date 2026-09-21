<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * CMS CTA links point at internal routes (e.g. "/contact") as often as
 * external ones, so Laravel's built-in `url` rule — which requires a
 * scheme — rejects every internal link. This accepts either.
 */
class RelativeOrAbsoluteUrl implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || $value === '') {
            $fail('The :attribute must be a valid relative path or URL.');

            return;
        }

        $isRelativePath = str_starts_with($value, '/') && ! str_starts_with($value, '//');
        $isAbsoluteUrl = preg_match('#^https?://#i', $value) === 1 && filter_var($value, FILTER_VALIDATE_URL) !== false;

        if (! $isRelativePath && ! $isAbsoluteUrl) {
            $fail('The :attribute must be a valid relative path (e.g. /contact) or absolute URL.');
        }
    }
}
