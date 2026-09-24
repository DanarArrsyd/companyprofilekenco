<?php

namespace App\Models;

use App\Enums\ContentStatus;
use App\Models\Concerns\HasLocalizedContent;
use App\Models\Concerns\HasPublishingLifecycle;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['name', 'slug', 'description', 'image', 'sort_order', 'status', 'published_at'])]
class Industry extends Model
{
    use HasFactory, HasLocalizedContent, HasPublishingLifecycle, SoftDeletes;

    /** @var list<string> CMS text stored per locale (see HasLocalizedContent). */
    public array $translatable = ['name', 'description'];

    protected function casts(): array
    {
        return [
            'status' => ContentStatus::class,
            'published_at' => 'datetime',
        ];
    }
}
