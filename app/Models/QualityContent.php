<?php

namespace App\Models;

use App\Enums\ContentStatus;
use App\Models\Concerns\HasLocalizedContent;
use App\Models\Concerns\HasPublishingLifecycle;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['title', 'slug', 'summary', 'content', 'image', 'sort_order', 'status', 'published_at'])]
class QualityContent extends Model
{
    use HasFactory, HasLocalizedContent, HasPublishingLifecycle;

    /** @var list<string> CMS text stored per locale (see HasLocalizedContent). */
    public array $translatable = ['title', 'summary', 'content'];

    protected function casts(): array
    {
        return [
            'status' => ContentStatus::class,
            'published_at' => 'datetime',
        ];
    }
}
