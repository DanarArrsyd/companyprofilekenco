<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Customers got an admin module (2026-09-29, "Customers Served" on the
 * homepage). Deploys run migrations, not seeders, so the permissions are
 * created here with the same split as Industries: Super Admin everything,
 * Content Admin view/create/update.
 */
return new class extends Migration
{
    public function up(): void
    {
        $all = ['customers.view', 'customers.create', 'customers.update', 'customers.delete'];

        foreach ($all as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        Role::where('name', 'Super Admin')->where('guard_name', 'web')->first()?->givePermissionTo($all);
        Role::where('name', 'Content Admin')->where('guard_name', 'web')->first()?->givePermissionTo(['customers.view', 'customers.create', 'customers.update']);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        Permission::whereIn('name', ['customers.view', 'customers.create', 'customers.update', 'customers.delete'])->delete();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
