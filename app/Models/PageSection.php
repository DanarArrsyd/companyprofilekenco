<?php

namespace App\Models;

use App\Enums\SectionType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['page_id', 'section_type', 'title', 'subtitle', 'content', 'settings_json', 'sort_order', 'is_active'])]
class PageSection extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'section_type' => SectionType::class,
            'content' => 'array',
            'settings_json' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
