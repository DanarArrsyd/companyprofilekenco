<?php

namespace App\Models;

use App\Enums\ContentStatus;
use App\Models\Concerns\HasAuditedBy;
use App\Models\Concerns\HasPublishingLifecycle;
use App\Models\Concerns\HasSeoMetadata;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'name', 'slug', 'summary', 'description', 'featured_image', 'icon',
    'is_featured', 'sort_order', 'status', 'published_at', 'created_by', 'updated_by',
])]
class Capability extends Model
{
    use HasAuditedBy, HasFactory, HasPublishingLifecycle, HasSeoMetadata, SoftDeletes;

    protected function casts(): array
    {
        return [
            'status' => ContentStatus::class,
            'published_at' => 'datetime',
            'is_featured' => 'boolean',
        ];
    }

    public function steps(): HasMany
    {
        return $this->hasMany(CapabilityStep::class)->orderBy('sort_order');
    }

    public function machines(): BelongsToMany
    {
        return $this->belongsToMany(Machine::class, 'capability_machine');
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }
}
