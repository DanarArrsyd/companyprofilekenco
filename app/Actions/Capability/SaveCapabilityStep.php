<?php

namespace App\Actions\Capability;

use App\Models\Capability;
use App\Models\CapabilityStep;

class SaveCapabilityStep
{
    public function handle(Capability $capability, array $data, ?CapabilityStep $step = null): CapabilityStep
    {
        if ($step) {
            $step->update($data);

            return $step;
        }

        $data['sort_order'] = $data['sort_order'] ?? (($capability->steps()->max('sort_order') ?? -1) + 1);

        return $capability->steps()->create($data);
    }
}
