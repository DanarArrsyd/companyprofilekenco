<?php

namespace App\Models;

use App\Enums\ContentStatus;
use App\Models\Concerns\HasActiveStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug', 'description', 'sort_order', 'status'])]
class ProductCategory extends Model
{
    use HasActiveStatus, HasFactory;

    protected function casts(): array
    {
        return [
            'status' => ContentStatus::class,
        ];
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
