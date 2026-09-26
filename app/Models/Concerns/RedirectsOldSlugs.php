<?php

namespace App\Models\Concerns;

use App\Models\SlugRedirect;

/**
 * Remembers a model's previous slugs when an admin renames it, so its old
 * public address redirects to the current one (RedirectOldSlugs middleware).
 */
trait RedirectsOldSlugs
{
    public static function bootRedirectsOldSlugs(): void
    {
        static::updated(function ($model) {
            if (! $model->wasChanged('slug')) {
                return;
            }

            $type = $model->getMorphClass();
            $old = $model->getOriginal('slug');

            // The new slug is live again: it must never redirect elsewhere.
            SlugRedirect::where('sluggable_type', $type)->where('old_slug', $model->slug)->delete();

            if (filled($old)) {
                SlugRedirect::updateOrCreate(
                    ['sluggable_type' => $type, 'old_slug' => $old],
                    ['sluggable_id' => $model->getKey()],
                );
            }
        });
    }

    /** The published model an old slug now belongs to, if any. */
    public static function findByOldSlug(string $slug): ?static
    {
        $id = SlugRedirect::where('sluggable_type', (new static)->getMorphClass())->where('old_slug', $slug)->value('sluggable_id');

        return $id === null ? null : static::query()->published()->find($id);
    }
}
