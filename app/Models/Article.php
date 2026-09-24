<?php

namespace App\Models;

use App\Enums\ContentStatus;
use App\Models\Concerns\HasAuditedBy;
use App\Models\Concerns\HasPublishingLifecycle;
use App\Models\Concerns\HasSeoMetadata;
use App\Services\RichTextSanitizer;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'news_category_id',
    'title',
    'slug',
    'excerpt',
    'content',
    'featured_image',
    'author_id',
    'is_featured',
    'status',
    'published_at',
    'created_by',
    'updated_by',
])]
class Article extends Model
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

    /**
     * Article bodies render as raw HTML on the public site, so every write
     * is cleaned against the editor's allowlist regardless of entry point.
     */
    protected function content(): Attribute
    {
        return Attribute::make(
            set: fn (?string $value) => app(RichTextSanitizer::class)->sanitize($value),
        );
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(NewsCategory::class, 'news_category_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
