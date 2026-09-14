<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\HomepageController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\PageSectionController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('admin')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::get('login', [AuthenticatedSessionController::class, 'create'])
            ->name('login');

        Route::post('login', [AuthenticatedSessionController::class, 'store']);

        Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
            ->name('password.request');

        Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
            ->name('password.email');

        Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
            ->name('password.reset');

        Route::post('reset-password', [NewPasswordController::class, 'store'])
            ->name('password.store');
    });

    Route::middleware(['auth', 'active'])->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])
            ->name('dashboard')
            ->middleware('permission:dashboard.view');

        Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
            ->name('password.confirm');

        Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);

        Route::put('password', [PasswordController::class, 'update'])->name('password.update');

        Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
            ->name('logout');

        // Pages CMS
        Route::get('pages', [PageController::class, 'index'])->name('admin.pages')->middleware('permission:pages.view');
        Route::get('pages/create', [PageController::class, 'create'])->name('admin.pages.create')->middleware('permission:pages.create');
        Route::post('pages', [PageController::class, 'store'])->name('admin.pages.store')->middleware('permission:pages.create');
        Route::get('pages/{page}/edit', [PageController::class, 'edit'])->name('admin.pages.edit')->middleware('permission:pages.update');
        Route::put('pages/{page}', [PageController::class, 'update'])->name('admin.pages.update')->middleware('permission:pages.update');
        Route::delete('pages/{page}', [PageController::class, 'destroy'])->name('admin.pages.destroy')->middleware('permission:pages.delete');
        Route::post('pages/{page}/restore', [PageController::class, 'restore'])->name('admin.pages.restore')->middleware('permission:pages.delete');
        Route::post('pages/{page}/publish', [PageController::class, 'publish'])->name('admin.pages.publish')->middleware('permission:pages.update');
        Route::post('pages/{page}/archive', [PageController::class, 'archive'])->name('admin.pages.archive')->middleware('permission:pages.update');
        Route::get('pages/{page}/preview', [PageController::class, 'preview'])->name('admin.pages.preview')->middleware('permission:pages.view');

        Route::post('pages/{page}/sections', [PageSectionController::class, 'store'])->name('admin.pages.sections.store')->middleware('permission:pages.update');
        Route::put('pages/{page}/sections/{section}', [PageSectionController::class, 'update'])->name('admin.pages.sections.update')->middleware('permission:pages.update');
        Route::delete('pages/{page}/sections/{section}', [PageSectionController::class, 'destroy'])->name('admin.pages.sections.destroy')->middleware('permission:pages.update');
        Route::post('pages/{page}/sections/reorder', [PageSectionController::class, 'reorder'])->name('admin.pages.sections.reorder')->middleware('permission:pages.update');

        // Homepage CMS
        Route::get('homepage', [HomepageController::class, 'edit'])->name('admin.homepage')->middleware('permission:pages.view');

        // Module foundation placeholders — Phase 4 builds navigation and
        // layout only. Each module's real CRUD lands in a later phase.
        $placeholders = [
            ['products', 'admin.products', 'products.view', 'Products', 'Manage product catalog.'],
            ['products/categories', 'admin.products.categories', 'products.view', 'Product Categories', 'Manage product categories.'],
            ['capabilities', 'admin.capabilities', 'capabilities.view', 'Capabilities', 'Manage manufacturing capabilities.'],
            ['facilities', 'admin.facilities', 'facilities.view', 'Facilities', 'Manage production facilities.'],
            ['machines', 'admin.machines', 'facilities.view', 'Machines', 'Manage machines per facility.'],
            ['certifications', 'admin.certifications', 'certifications.view', 'Certifications', 'Manage quality certifications.'],
            ['industries', 'admin.industries', 'industries.view', 'Industries', 'Manage industries served.'],
            ['news', 'admin.news', 'news.view', 'Articles', 'Manage news articles.'],
            ['news/categories', 'admin.news.categories', 'news.view', 'News Categories', 'Manage news categories.'],
            ['careers', 'admin.careers', 'careers.manage', 'Job Vacancies', 'Manage job vacancies.'],
            ['careers/applications', 'admin.careers.applications', 'careers.manage', 'Applications', 'Review job applications.'],
            ['inquiries', 'admin.inquiries', 'inquiries.manage', 'Contact Inquiries', 'Review contact form submissions.'],
            ['media', 'admin.media', 'media.manage', 'Media Library', 'Manage uploaded media files.'],
            ['seo', 'admin.seo', 'seo.manage', 'SEO Manager', 'Manage SEO metadata across content.'],
            ['users', 'admin.users', 'users.manage', 'Users', 'Manage admin user accounts.'],
            ['roles', 'admin.roles', 'users.manage', 'Roles', 'Manage roles and permissions.'],
            ['activity-logs', 'admin.activity-logs', 'users.manage', 'Activity Logs', 'Review admin activity history.'],
            ['settings', 'admin.settings', 'settings.manage', 'Website Settings', 'Manage global site settings.'],
        ];

        foreach ($placeholders as [$uri, $name, $permission, $title, $description]) {
            Route::get($uri, fn () => Inertia::render('admin/Placeholder', [
                'title' => $title,
                'description' => $description,
            ]))->name($name)->middleware("permission:{$permission}");
        }
    });
});
