<?php

namespace App\Models;

use App\Enums\CustomerSegment;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['name', 'segment', 'logo_media_id', 'website_url', 'is_featured', 'order'])]
class Customer extends Model
{
    /** A new row without a segment reads as Stamping, matching the column default. */
    protected $attributes = ['segment' => 'stamping'];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'segment' => CustomerSegment::class,
        ];
    }

    public function logo(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'logo_media_id');
    }
}
