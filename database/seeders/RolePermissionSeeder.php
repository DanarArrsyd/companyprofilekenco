<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Baseline permissions for content and platform modules.
     *
     * @var array<int, string>
     */
    private const PERMISSIONS = [
        'dashboard.view',

        'pages.view',
        'pages.create',
        'pages.update',
        'pages.delete',

        'products.view',
        'products.create',
        'products.update',
        'products.delete',

        'capabilities.view',
        'capabilities.create',
        'capabilities.update',
        'capabilities.delete',

        'facilities.view',
        'facilities.create',
        'facilities.update',
        'facilities.delete',

        'certifications.view',
        'certifications.create',
        'certifications.update',
        'certifications.delete',

        'industries.view',
        'industries.create',
        'industries.update',
        'industries.delete',

        'news.view',
        'news.create',
        'news.update',
        'news.delete',

        'careers.manage',
        'inquiries.manage',
        'media.manage',
        'seo.manage',
        'settings.manage',
        'users.manage',
    ];

    /**
     * Permissions granted to Content Admin: full view/create/update across
     * content modules, no delete and no platform-level administration.
     *
     * @var array<int, string>
     */
    private const CONTENT_ADMIN_PERMISSIONS = [
        'dashboard.view',
        'pages.view',
        'pages.create',
        'pages.update',
        'products.view',
        'products.create',
        'products.update',
        'capabilities.view',
        'capabilities.create',
        'capabilities.update',
        'facilities.view',
        'facilities.create',
        'facilities.update',
        'certifications.view',
        'certifications.create',
        'certifications.update',
        'industries.view',
        'industries.create',
        'industries.update',
        'news.view',
        'news.create',
        'news.update',
        'careers.manage',
        'inquiries.manage',
        'media.manage',
    ];

    /**
     * Seed roles and permissions.
     */
    public function run(): void
    {
        foreach (self::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $superAdmin = Role::findOrCreate('Super Admin', 'web');
        $superAdmin->syncPermissions(self::PERMISSIONS);

        $contentAdmin = Role::findOrCreate('Content Admin', 'web');
        $contentAdmin->syncPermissions(self::CONTENT_ADMIN_PERMISSIONS);
    }
}
