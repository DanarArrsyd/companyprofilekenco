<?php

namespace App\Models;

use App\Enums\ContentStatus;
use App\Models\Concerns\HasPublishingLifecycle;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['name', 'issuer', 'issued_at', 'expires_at', 'media_id', 'status', 'published_at'])]
class Certification extends Model
{
    use HasPublishingLifecycle, SoftDeletes;

    protected function casts(): array
    {
        return [
            'status' => ContentStatus::class,
            'published_at' => 'datetime',
            'issued_at' => 'date',
            'expires_at' => 'date',
        ];
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }
}
