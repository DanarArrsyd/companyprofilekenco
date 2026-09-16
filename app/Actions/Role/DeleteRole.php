<?php

namespace App\Actions\Role;

use App\Services\ActivityLogService;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class DeleteRole
{
    public const SYSTEM_ROLES = ['Super Admin', 'Content Admin'];

    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(Role $role): void
    {
        if (in_array($role->name, self::SYSTEM_ROLES, true)) {
            throw ValidationException::withMessages(['role' => 'System roles cannot be deleted.']);
        }

        if ($role->users()->exists()) {
            throw ValidationException::withMessages(['role' => 'This role is still assigned to users.']);
        }

        $name = $role->name;
        $role->delete();

        $this->activityLog->record('role.deleted', null, ['name' => $name]);
    }
}
