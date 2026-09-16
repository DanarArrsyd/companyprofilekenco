<?php

namespace App\Models;

use App\Enums\ContentStatus;
use App\Models\Concerns\HasActiveStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable([
    'facility_id', 'name', 'brand', 'model', 'quantity', 'capacity',
    'specification', 'image', 'sort_order', 'status', 'is_active',
])]
class Machine extends Model
{
    use HasActiveStatus, HasFactory;

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'status' => ContentStatus::class,
        ];
    }

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    public function capabilities(): BelongsToMany
    {
        return $this->belongsToMany(Capability::class, 'capability_machine');
    }

    /**
     * Assign capabilities without creating duplicate pivot rows.
     */
    public function syncCapabilities(array $capabilityIds): void
    {
        $this->capabilities()->sync($capabilityIds);
    }
}
