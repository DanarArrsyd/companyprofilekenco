<?php

namespace App\Actions\Capability;

use App\Models\Capability;
use Illuminate\Support\Facades\DB;

class ReorderCapabilitySteps
{
    /**
     * @param  array<int, int>  $orderedIds
     */
    public function handle(Capability $capability, array $orderedIds): void
    {
        DB::transaction(function () use ($capability, $orderedIds) {
            foreach ($orderedIds as $index => $stepId) {
                $capability->steps()->whereKey($stepId)->update(['sort_order' => $index]);
            }
        });
    }
}
