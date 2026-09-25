<?php

namespace App\Actions\Translation;

use App\Services\Translation\TranslationFailed;
use App\Services\Translation\Translator;
use Illuminate\Database\Eloquent\Model;

/**
 * Fills the other language of a translatable model before it is saved, per
 * field, compared with the stored value:
 *
 * - English changed only    -> Indonesian regenerated from English
 * - Indonesian changed only -> English regenerated from Indonesian
 * - both changed            -> both kept as typed
 * - neither, Indonesian empty -> Indonesian filled from English
 *
 * An empty source is never translated, so clearing one language does not
 * wipe the other. One request per direction.
 */
class AutoTranslateChanges
{
    private const SOURCE = 'en';

    private const TARGET = 'id';

    public function __construct(private readonly Translator $translator) {}

    /**
     * @param  Model&\App\Models\Concerns\HasLocalizedContent  $model
     *
     * @throws TranslationFailed
     */
    public function handle(Model $model): void
    {
        $pending = [];

        foreach ($model->getTranslatableAttributes() as $field) {
            $now = self::locales($model->getAttributes()[$field] ?? null);
            $before = $model->exists ? self::locales($model->getRawOriginal($field)) : [];

            $en = $now[self::SOURCE] ?? '';
            $id = $now[self::TARGET] ?? '';
            $enChanged = $en !== ($before[self::SOURCE] ?? '');
            $idChanged = $id !== ($before[self::TARGET] ?? '');

            $direction = match (true) {
                $enChanged && ! $idChanged && $en !== '' => [self::SOURCE, self::TARGET],
                $idChanged && ! $enChanged && $id !== '' => [self::TARGET, self::SOURCE],
                ! $enChanged && ! $idChanged && $en !== '' && $id === '' => [self::SOURCE, self::TARGET],
                default => null,
            };

            if ($direction !== null) {
                $pending[implode('>', $direction)][$field] = $now[$direction[0]];
            }
        }

        foreach ($pending as $direction => $texts) {
            [$from, $to] = explode('>', $direction);
            $translated = $this->translator->translate(array_values($texts), $from, $to);

            foreach (array_keys($texts) as $index => $field) {
                $model->setTranslation($field, $to, $translated[$index]);
            }
        }
    }

    /** @return array<string, string> Locale => non-empty text. */
    private static function locales(mixed $raw): array
    {
        if ($raw === null || $raw === '') {
            return [];
        }

        $decoded = is_string($raw) ? json_decode($raw, true) : $raw;

        if (! is_array($decoded)) {
            return [self::SOURCE => (string) $raw];
        }

        return array_filter(
            array_map(fn ($value) => is_string($value) ? trim($value) : '', $decoded),
            fn (string $value) => $value !== '',
        );
    }
}
