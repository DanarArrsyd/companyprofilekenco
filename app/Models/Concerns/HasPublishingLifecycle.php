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
