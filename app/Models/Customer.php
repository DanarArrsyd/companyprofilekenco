<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['name', 'logo_media_id', 'website_url', 'is_featured', 'order'])]
class Customer extends Model
{
    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
        ];
    }

    public function logo(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'logo_media_id');
    }
}
