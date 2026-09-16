<?php

namespace App\Models;

use App\Enums\ContentStatus;
use App\Models\Concerns\HasAuditedBy;
use App\Models\Concerns\HasPublishingLifecycle;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'facility_category_id',
    'name',
    'slug',
    'location',
    'description',
    'image',
    'sort_order',
    'status',
    'published_at',
    'created_by',
    'updated_by',
])]
class Facility extends Model
{
    use HasAuditedBy, HasFactory, HasPublishingLifecycle, SoftDeletes;

    protected function casts(): array
    {
        return [
            'status' => ContentStatus::class,
            'published_at' => 'datetime',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(FacilityCategory::class, 'facility_category_id');
    }

    public function machines(): HasMany
    {
        return $this->hasMany(Machine::class);
    }
}
