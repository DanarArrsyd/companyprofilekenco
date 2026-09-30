<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

/**
 * Industries were retired on 2026-09-30 (user decision): the /company
 * section, the admin module and the permissions are gone, so the table
 * and the images uploaded straight into it (storage "industries/", never
 * Media library items) go too; activity log entries stay, detached from the
 * removed model. /industries still 301s to /company.
 */
return new class extends Migration
{
    private const PERMISSIONS = ['industries.view', 'industries.create', 'industries.update', 'industries.delete'];

    public function up(): void
    {
        if (Schema::hasTable('industries')) {
            DB::table('industries')
                ->whereNotNull('image')
                ->where('image', 'like', 'industries/%')
                ->pluck('image')
                ->each(fn (string $path) => Storage::disk('public')->delete($path));

            Schema::drop('industries');
        }

        // Keep the activity history, but unhook it from the removed model so
        // eager-loading `subject` on the log page never looks for the class.
        if (Schema::hasTable('activity_logs')) {
            DB::table('activity_logs')
                ->where('subject_type', 'App\\Models\\Industry')
                ->update(['subject_type' => null, 'subject_id' => null]);
        }

        Permission::whereIn('name', self::PERMISSIONS)->delete();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        // Structure only: the retired rows and images are not restored.
        Schema::create('industries', function (Blueprint $table) {
            $table->id();
            $table->text('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('status')->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'published_at']);
        });

        foreach (self::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission, 'web');
        }
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
