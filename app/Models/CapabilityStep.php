<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['capability_id', 'title', 'description', 'sort_order'])]
class CapabilityStep extends Model
{
    public function capability(): BelongsTo
    {
        return $this->belongsTo(Capability::class);
    }
}
