<?php

namespace App\Actions\Role;

use App\Services\ActivityLogService;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class UpdateRole
{
    /**
     * Super Admin must always retain full access per ARCHITECTURE.md —
     * its permission set is not editable through this UI.
     */
    public const PROTECTED_ROLES = ['Super Admin'];

    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(Role $role, array $data): Role
    {
        if (in_array($role->name, self::PROTECTED_ROLES, true)) {
            throw ValidationException::withMessages(['permissions' => 'Super Admin permissions cannot be changed.']);
        }

        $role->syncPermissions($data['permissions'] ?? []);

        $this->activityLog->record('role.updated', $role, ['name' => $role->name]);

        return $role->fresh();
    }
}
