<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Role\CreateRole;
use App\Actions\Role\DeleteRole;
use App\Actions\Role\UpdateRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Role\StoreRoleRequest;
use App\Http\Requests\Admin\Role\UpdateRoleRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(): Response
    {
        $roles = Role::withCount('users')->orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/roles/Index', [
            'roles' => $roles,
            'systemRoles' => DeleteRole::SYSTEM_ROLES,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/roles/Create', [
            'permissionGroups' => $this->groupedPermissions(),
        ]);
    }

    public function store(StoreRoleRequest $request, CreateRole $action): RedirectResponse
    {
        $role = $action->handle($request->validated());

        return redirect()->route('admin.roles.edit', $role)->with('success', 'Role created.');
    }

    public function edit(Role $role): Response
    {
        return Inertia::render('admin/roles/Edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
            ],
            'permissionGroups' => $this->groupedPermissions(),
            'isProtected' => in_array($role->name, UpdateRole::PROTECTED_ROLES, true),
            'isSystemRole' => in_array($role->name, DeleteRole::SYSTEM_ROLES, true),
        ]);
    }

    public function update(UpdateRoleRequest $request, Role $role, UpdateRole $action): RedirectResponse
    {
        $action->handle($role, $request->validated());

        return back()->with('success', 'Role updated.');
    }

    public function destroy(Role $role, DeleteRole $action): RedirectResponse
    {
        $action->handle($role);

        return redirect()->route('admin.roles')->with('success', 'Role deleted.');
    }

    /**
     * Group permission names by their prefix (before the first dot) into a
     * readable structure for the checkbox UI, e.g. "products.view" and
     * "products.create" both land under the "products" group.
     */
    private function groupedPermissions(): array
    {
        return Permission::orderBy('name')->pluck('name')
            ->groupBy(fn (string $name) => str_contains($name, '.') ? explode('.', $name)[0] : 'other')
            ->map(fn ($names, $group) => [
                'label' => ucwords(str_replace(['_', '-'], ' ', $group)),
                'permissions' => $names->values(),
            ])
            ->values()
            ->all();
    }
}
