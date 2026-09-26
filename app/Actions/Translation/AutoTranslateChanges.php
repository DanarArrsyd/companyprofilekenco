<?php

namespace App\Actions\Translation;

use App\Models\Contracts\HasTranslatableContent;
use App\Services\Translation\TranslationFailed;
use App\Services\Translation\Translator;
use App\Support\AutoTranslateReport;
use App\Support\LocalizedContent;
use Illuminate\Database\Eloquent\Model;

/**
 * Fills the other language of a translatable model before it is saved. The
 * language tab the admin saved from is the source (LocalizedContent::
 * $autoTranslateSource); for each text — a translatable attribute, or a text
 * value inside `content` for HasTranslatableContent models:
 *
 * - the other language was edited in this save -> kept as typed
 * - otherwise, source filled                   -> other language regenerated
 *   from the source, even when neither changed, so both tabs always match
 * - source empty                               -> other language left alone
 *
 * One request per save and direction.
 */
class AutoTranslateChanges
{
    private const SOURCE = 'en';

    private const TARGET = 'id';

    private const LOCALES = [self::SOURCE, self::TARGET];

    public function __construct(private readonly Translator $translator) {}

    /**
     * @param  Model&\App\Models\Concerns\HasLocalizedContent  $model
     *
     * @throws TranslationFailed
     */
    public function handle(Model $model): void
    {
        AutoTranslateReport::attempted();

        $pending = [];
        $content = null;

        foreach ($model->getTranslatableAttributes() as $field) {
            $this->queue(
                $pending,
                self::locales($model->getAttributes()[$field] ?? null),
                $model->exists ? self::locales($model->getRawOriginal($field)) : [],
                fn (string $locale, string $text) => $model->setTranslation($field, $locale, $text),
            );
        }

        if ($model instanceof HasTranslatableContent) {
            $content = self::decode($model->getAttributes()['content'] ?? null);
            $original = $model->exists ? self::decode($model->getRawOriginal('content')) : [];

            foreach ($this->contentKeys($model->translatableContentPaths(), $content) as $keys) {
                $this->queue(
                    $pending,
                    self::locales(data_get($content, $keys)),
                    self::locales(data_get($original, $keys)),
                    function (string $locale, string $text) use (&$content, $keys) {
                        $value = self::locales(data_get($content, $keys));
                        $value[$locale] = $text;
                        data_set($content, $keys, [self::SOURCE => $value[self::SOURCE] ?? '', self::TARGET => $value[self::TARGET] ?? '']);
                    },
                );
            }
        }

        foreach ($pending as $direction => $jobs) {
            [$from, $to] = explode('>', $direction);
            $translated = $this->translator->translate(array_column($jobs, 'text'), $from, $to);

            foreach ($jobs as $index => $job) {
                ($job['apply'])($to, $translated[$index]);
            }

            AutoTranslateReport::translated(count($jobs));
        }

        if ($content !== null && $pending !== []) {
            $model->setAttribute('content', $content);
        }
    }

    /**
     * @param  array<string, list<array{text: string, apply: callable}>>  $pending
     * @param  array<string, string>  $now
     * @param  array<string, string>  $before
     */
    private function queue(array &$pending, array $now, array $before, callable $apply): void
    {
        $from = in_array(LocalizedContent::$autoTranslateSource, self::LOCALES, true) ? LocalizedContent::$autoTranslateSource : self::SOURCE;
        $to = $from === self::SOURCE ? self::TARGET : self::SOURCE;

        $sourceText = $now[$from] ?? '';
        $targetEdited = ($now[$to] ?? '') !== ($before[$to] ?? '');

        if ($sourceText !== '' && ! $targetEdited) {
            $pending["{$from}>{$to}"][] = ['text' => $sourceText, 'apply' => $apply];
        }
    }

    /**
     * Concrete dot paths for the declared content paths, e.g. `items.*.label`
     * becomes `items.0.label`, `items.1.label`, ….
     *
     * @param  list<string>  $paths
     * @return list<string>
     */
    private function contentKeys(array $paths, array $content): array
    {
        $keys = [];

        foreach ($paths as $path) {
            if (! str_contains($path, '.*.')) {
                if (array_key_exists($path, $content)) {
                    $keys[] = $path;
                }

                continue;
            }

            [$list, $key] = explode('.*.', $path, 2);

            foreach ((array) ($content[$list] ?? []) as $index => $item) {
                if (is_array($item) && array_key_exists($key, $item)) {
                    $keys[] = "{$list}.{$index}.{$key}";
                }
            }
        }

        return $keys;
    }

    private static function decode(mixed $raw): array
    {
        $decoded = is_string($raw) ? json_decode($raw, true) : $raw;

        return is_array($decoded) ? $decoded : [];
    }

    /**
     * A text value as locale => non-empty text. A plain string is English;
     * a JSON-encoded attribute or an {"en","id"} array is split by locale.
     *
     * @return array<string, string>
     */
    private static function locales(mixed $raw): array
    {
        if ($raw === null || $raw === '') {
            return [];
        }

        $decoded = is_string($raw) && str_starts_with($raw, '{') ? json_decode($raw, true) : $raw;

        if (! is_array($decoded)) {
            return is_string($raw) ? [self::SOURCE => trim($raw)] : [];
        }

        return array_filter(
            array_map(fn ($value) => is_string($value) ? trim($value) : '', $decoded),
            fn (string $value) => $value !== '',
        );
    }
}
