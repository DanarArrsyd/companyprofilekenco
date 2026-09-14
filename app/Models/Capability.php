<?php

namespace App\Models;

use App\Enums\ContentStatus;
use App\Models\Concerns\HasAuditedBy;
use App\Models\Concerns\HasPublishingLifecycle;
use App\Models\Concerns\HasSeoMetadata;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['name', 'slug', 'summary', 'description', 'status', 'published_at', 'created_by', 'updated_by'])]
class Capability extends Model
{
    use HasAuditedBy, HasFactory, HasPublishingLifecycle, HasSeoMetadata, SoftDeletes;

    protected function casts(): array
    {
        return [
            'status' => ContentStatus::class,
            'published_at' => 'datetime',
        ];
    }

    public function steps(): HasMany
    {
        return $this->hasMany(CapabilityStep::class)->orderBy('order');
    }

    public function machines(): BelongsToMany
    {
        return $this->belongsToMany(Machine::class, 'capability_machine');
    }
}
