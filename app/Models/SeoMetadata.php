<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable([
    'meta_title',
    'meta_description',
    'canonical_url',
    'og_title',
    'og_description',
    'og_image',
    'robots_index',
    'robots_follow',
    'schema_json',
])]
class SeoMetadata extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'robots_index' => 'boolean',
            'robots_follow' => 'boolean',
            'schema_json' => 'array',
        ];
    }

    public function seoable(): MorphTo
    {
        return $this->morphTo();
    }
}
