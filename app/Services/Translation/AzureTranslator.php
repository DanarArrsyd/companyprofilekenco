<?php

namespace App\Services\Translation;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

/**
 * Azure AI Translator v3. Every text is sent as HTML so glossary terms can be
 * marked notranslate; plain texts are escaped (line breaks as <br>) on the
 * way out and decoded on the way back.
 */
final class AzureTranslator implements Translator
{
    /** @param  array{key?: ?string, region?: ?string, endpoint?: ?string, timeout?: int}  $config */
    public function __construct(
        private readonly GlossaryProtector $glossary,
        private readonly array $config,
    ) {}

    public function isConfigured(): bool
    {
        return filled($this->config['key'] ?? null);
    }

    public function translate(array $texts, string $from, string $to): array
    {
        if ($texts === []) {
            return [];
        }

        if (! $this->isConfigured()) {
            throw new TranslationFailed('Azure Translator is not configured.');
        }

        $texts = array_values($texts);
        $isHtml = array_map(fn (string $text) => $text !== strip_tags($text), $texts);
        $body = array_map(
            fn (string $text, bool $html) => ['Text' => $this->glossary->protect($html ? $text : str_replace(["\r\n", "\n"], '<br>', e($text)))],
            $texts,
            $isHtml,
        );

        try {
            $response = Http::timeout($this->config['timeout'] ?? 10)
                ->withHeaders(array_filter([
                    'Ocp-Apim-Subscription-Key' => $this->config['key'],
                    'Ocp-Apim-Subscription-Region' => $this->config['region'] ?? null,
                ]))
                ->withQueryParameters(['api-version' => '3.0', 'from' => $from, 'to' => $to, 'textType' => 'html'])
                ->post(rtrim($this->config['endpoint'] ?? '', '/').'/translate', $body);
        } catch (ConnectionException $exception) {
            throw new TranslationFailed('Azure Translator could not be reached: '.$exception->getMessage(), previous: $exception);
        }

        if ($response->failed()) {
            // Azure explains itself, e.g. 401000 (wrong key), 401001/401015 (region), 403001 (free quota used up).
            $error = $response->json('error');
            $detail = is_array($error) ? trim(($error['code'] ?? '').': '.($error['message'] ?? ''), ': ') : '';

            throw new TranslationFailed("Azure Translator rejected the request (HTTP {$response->status()}".($detail !== '' ? ", error {$detail}" : '').').');
        }

        $translated = array_map(fn ($item) => $item['translations'][0]['text'] ?? null, (array) $response->json());

        if (count($translated) !== count($texts) || in_array(null, $translated, true)) {
            throw new TranslationFailed('Azure Translator returned an unexpected response.');
        }

        return array_map(function (string $text, bool $html) {
            $text = $this->glossary->restore($text);

            return $html ? $text : html_entity_decode(preg_replace('/<br\s*\/?>/i', "\n", $text), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        }, $translated, $isHtml);
    }
}
