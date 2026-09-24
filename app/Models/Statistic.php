<?php

namespace App\Models;

use App\Models\Concerns\HasLocalizedContent;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['label', 'value', 'icon', 'order'])]
class Statistic extends Model
{
    use HasLocalizedContent;

    /** @var list<string> CMS text stored per locale (see HasLocalizedContent). */
    public array $translatable = ['label'];
}
