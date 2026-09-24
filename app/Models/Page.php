<?php

namespace App\Models;

use App\Enums\ContentStatus;
use App\Enums\PageType;
use App\Models\Concerns\HasAuditedBy;
use App\Models\Concerns\HasLocalizedContent;
use App\Models\Concerns\HasPublishingLifecycle;
use App\Models\Concerns\HasSeoMetadata;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['title', 'slug', 'page_type', 'status', 'published_at', 'created_by', 'updated_by'])]
class Page extends Model
{
    use HasAuditedBy, HasFactory, HasLocalizedContent, HasPublishingLifecycle, HasSeoMetadata, SoftDeletes;

    /** @var list<string> CMS text stored per locale (see HasLocalizedContent). */
    public array $translatable = ['title'];

    protected function casts(): array
    {
        return [
            'page_type' => PageType::class,
            'status' => ContentStatus::class,
            'published_at' => 'datetime',
        ];
    }

    public function sections(): HasMany
    {
        return $this->hasMany(PageSection::class)->orderBy('sort_order');
    }

    /**
     * Standard editable pages, excluding the singleton homepage record.
     */
    public function scopeStandard(Builder $query): Builder
    {
        return $query->where('page_type', PageType::Standard);
    }
}
