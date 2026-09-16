<?php

namespace App\Actions\Capability;

use App\Enums\ContentStatus;
use App\Models\Capability;
use App\Services\ActivityLogService;
use Illuminate\Support\Facades\Auth;

class PublishCapability
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(Capability $capability): Capability
    {
        $capability->update([
            'status' => ContentStatus::Published,
            'published_at' => $capability->published_at ?? now(),
            'updated_by' => Auth::id(),
        ]);

        $this->activityLog->record('capability.published', $capability, ['name' => $capability->name]);

        return $capability->fresh();
    }
}
