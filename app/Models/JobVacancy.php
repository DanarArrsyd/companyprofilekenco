<?php

namespace App\Models;

use App\Enums\ContentStatus;
use App\Models\Concerns\HasAuditedBy;
use App\Models\Concerns\HasLocalizedContent;
use App\Models\Concerns\HasPublishingLifecycle;
use App\Models\Concerns\HasSeoMetadata;
use App\Models\Concerns\RedirectsOldSlugs;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'title',
    'slug',
    'department',
    'location',
    'employment_type',
    'description',
    'requirements',
    'status',
    'published_at',
    'closes_at',
    'created_by',
    'updated_by',
])]
class JobVacancy extends Model
{
    use HasAuditedBy, HasFactory, HasLocalizedContent, HasPublishingLifecycle, HasSeoMetadata, RedirectsOldSlugs, SoftDeletes;

    /** @var list<string> CMS text stored per locale (see HasLocalizedContent). */
    public array $translatable = ['title', 'description', 'requirements'];

    protected function casts(): array
    {
        return [
            'status' => ContentStatus::class,
            'published_at' => 'datetime',
            'closes_at' => 'datetime',
        ];
    }

    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }

    public function isOpen(): bool
    {
        return $this->isPublished()
            && ($this->closes_at === null || $this->closes_at->isFuture());
    }
}
