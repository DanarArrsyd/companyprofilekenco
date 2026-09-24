<?php

namespace App\Models;

use App\Enums\SectionType;
use App\Models\Concerns\HasLocalizedContent;
use App\Support\LocalizedContent;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['page_id', 'section_type', 'title', 'subtitle', 'content', 'settings_json', 'sort_order', 'is_active'])]
class PageSection extends Model
{
    use HasFactory;
    use HasLocalizedContent {
        attributesToArray as translatableAttributesToArray;
    }

    /** @var list<string> CMS text stored per locale (see HasLocalizedContent). */
    public array $translatable = ['title', 'subtitle'];

    protected function casts(): array
    {
        return [
            'section_type' => SectionType::class,
            'content' => 'array',
            'settings_json' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Section content mixes shared data (images, item IDs) with text that may
     * be stored per locale as {"en": …, "id": …}; serialize it resolved to the
     * current locale. Server code reading $section->content still sees the
     * raw structure.
     */
    public function attributesToArray(): array
    {
        $attributes = $this->translatableAttributesToArray();

        if (array_key_exists('content', $attributes)) {
            $attributes['content'] = LocalizedContent::resolve($attributes['content']);
        }

        return $attributes;
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
