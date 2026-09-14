<?php

namespace App\Models;

use App\Enums\ContentStatus;
use App\Models\Concerns\HasPublishingLifecycle;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['name', 'slug', 'description', 'status', 'published_at'])]
class Industry extends Model
{
    use HasFactory, HasPublishingLifecycle, SoftDeletes;

    protected function casts(): array
    {
        return [
            'status' => ContentStatus::class,
            'published_at' => 'datetime',
        ];
    }
}
