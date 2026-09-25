<?php

namespace App\Models\Concerns;

use App\Enums\ContentStatus;
use Illuminate\Database\Eloquent\Builder;

/**
 * Shared publishing lifecycle scope for public content entities: only
 * status = published AND published_at <= now() counts as publicly visible.
 */
trait HasPublishingLifecycle
{
    /**
     * Content saved as published with no publish date goes live now; a
     * NULL date would otherwise keep it out of every public query even
     * though the admin sees "published". Drafts and chosen dates are kept.
     */
    public static function bootHasPublishingLifecycle(): void
    {
        static::saving(function ($model) {
            if ($model->status === ContentStatus::Published && $model->published_at === null) {
                $model->published_at = now();
            }
        });
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('status', ContentStatus::Published)
            ->where('published_at', '<=', now());
    }

    public function isPublished(): bool
    {
        return $this->status === ContentStatus::Published
            && $this->published_at !== null
            && $this->published_at->lessThanOrEqualTo(now());
    }
}
