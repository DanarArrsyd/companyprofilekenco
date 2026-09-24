<?php

namespace App\Models;

use App\Models\Concerns\HasLocalizedContent;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug', 'description'])]
class NewsCategory extends Model
{
    use HasFactory, HasLocalizedContent;

    /** @var list<string> CMS text stored per locale (see HasLocalizedContent). */
    public array $translatable = ['name', 'description'];

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class);
    }
}
