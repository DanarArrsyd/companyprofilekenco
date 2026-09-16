<?php

namespace App\Models\Concerns;

use App\Enums\ContentStatus;
use Illuminate\Database\Eloquent\Builder;

/**
 * Lightweight status scope for supporting/organizational models that have a
 * status column but no publishing date (categories, machines): visible
 * whenever status is Published, with no date gating.
 */
trait HasActiveStatus
{
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', ContentStatus::Published);
    }
}
