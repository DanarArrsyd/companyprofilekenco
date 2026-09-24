<?php

namespace App\Models;

use App\Enums\ContentStatus;
use App\Models\Concerns\HasActiveStatus;
use App\Models\Concerns\HasLocalizedContent;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug', 'description', 'sort_order', 'status'])]
class FacilityCategory extends Model
{
    use HasActiveStatus, HasFactory, HasLocalizedContent;

    /** @var list<string> CMS text stored per locale (see HasLocalizedContent). */
    public array $translatable = ['name', 'description'];

    protected function casts(): array
    {
        return [
            'status' => ContentStatus::class,
        ];
    }

    public function facilities(): HasMany
    {
        return $this->hasMany(Facility::class);
    }
}
