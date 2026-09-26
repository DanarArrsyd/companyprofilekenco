<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/** An old slug of a RedirectsOldSlugs model, pointing at the model itself (not a slug), so chains never form. */
#[Fillable(['sluggable_type', 'sluggable_id', 'old_slug'])]
class SlugRedirect extends Model
{
    public function sluggable(): MorphTo
    {
        return $this->morphTo();
    }
}
