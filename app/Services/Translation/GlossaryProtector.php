<?php

namespace App\Services\Translation;

/**
 * Wraps glossary terms in <span class="notranslate"> so the translator keeps
 * them as written, and removes the wrapper afterwards. Only text between
 * tags is touched, never attribute values.
 */
final class GlossaryProtector
{
    private const WRAPPER = '/<span class=["\']notranslate["\']>(.*?)<\/span>/su';

    private ?string $pattern;

    /** @param  list<string>  $terms */
    public function __construct(array $terms)
    {
        usort($terms, fn (string $a, string $b) => mb_strlen($b) <=> mb_strlen($a));

        $alternatives = array_map(fn (string $term) => preg_quote(e($term), '/'), array_filter($terms));

        $this->pattern = $alternatives === []
            ? null
            : '/(?<![\p{L}\p{N}-])('.implode('|', $alternatives).')(?![\p{L}\p{N}-])/iu';
    }

    public function protect(string $html): string
    {
        if ($this->pattern === null) {
            return $html;
        }

        $parts = preg_split('/(<[^>]*>)/u', $html, -1, PREG_SPLIT_DELIM_CAPTURE) ?: [$html];

        foreach ($parts as $index => $part) {
            if ($part !== '' && $part[0] !== '<') {
                $parts[$index] = preg_replace($this->pattern, '<span class="notranslate">$1</span>', $part);
            }
        }

        return implode('', $parts);
    }

    public function restore(string $html): string
    {
        return preg_replace(self::WRAPPER, '$1', $html) ?? $html;
    }
}
