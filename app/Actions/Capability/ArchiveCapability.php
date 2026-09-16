<?php

namespace App\Actions\Capability;

use App\Enums\ContentStatus;
use App\Models\Capability;
use App\Services\ActivityLogService;
use Illuminate\Support\Facades\Auth;

class ArchiveCapability
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(Capability $capability): Capability
    {
        $capability->update(['status' => ContentStatus::Archived, 'updated_by' => Auth::id()]);

        $this->activityLog->record('capability.updated', $capability, ['name' => $capability->name, 'archived' => true]);

        return $capability->fresh();
    }
}
