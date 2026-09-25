<?php

namespace App\Services\Translation;

interface Translator
{
    public function isConfigured(): bool;

    /**
     * Translate each text from one locale to another, keeping the order.
     * Texts containing HTML keep their markup; plain texts stay plain.
     *
     * @param  list<string>  $texts
     * @return list<string>
     *
     * @throws TranslationFailed
     */
    public function translate(array $texts, string $from, string $to): array;
}
