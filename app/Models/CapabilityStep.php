<?php

namespace App\Models;

use App\Models\Concerns\HasLocalizedContent;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['capability_id', 'title', 'description', 'sort_order'])]
class CapabilityStep extends Model
{
    use HasLocalizedContent;

    /** @var list<string> CMS text stored per locale (see HasLocalizedContent). */
    public array $translatable = ['title', 'description'];

    public function capability(): BelongsTo
    {
        return $this->belongsTo(Capability::class);
    }
}
