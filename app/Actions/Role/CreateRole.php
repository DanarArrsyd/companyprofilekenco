<?php

namespace App\Actions\Role;

use App\Services\ActivityLogService;
use Spatie\Permission\Models\Role;

class CreateRole
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(array $data): Role
    {
        $role = Role::create(['name' => $data['name'], 'guard_name' => 'web']);
        $role->syncPermissions($data['permissions'] ?? []);

        $this->activityLog->record('role.created', $role, ['name' => $role->name]);

        return $role;
    }
}
