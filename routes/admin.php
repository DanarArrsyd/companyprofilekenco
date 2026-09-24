<?php

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\ArticleController;
use App\Http\Controllers\Admin\CapabilityController;
use App\Http\Controllers\Admin\CapabilityStepController;
use App\Http\Controllers\Admin\CertificationController;
use App\Http\Controllers\Admin\ContactInquiryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FacilityCategoryController;
use App\Http\Controllers\Admin\FacilityController;
use App\Http\Controllers\Admin\HomepageController;
use App\Http\Controllers\Admin\IndustryController;
use App\Http\Controllers\Admin\JobApplicationController;
use App\Http\Controllers\Admin\JobVacancyController;
use App\Http\Controllers\Admin\MachineController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\MilestoneController;
use App\Http\Controllers\Admin\NewsCategoryController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\PageSectionController;
use App\Http\Controllers\Admin\ProductCategoryController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProductImageController;
use App\Http\Controllers\Admin\QualityContentController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\UserController;
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
            ->middleware('throttle:6,1')
            ->name('password.email');

        Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
            ->name('password.reset');

        Route::post('reset-password', [NewPasswordController::class, 'store'])
            ->middleware('throttle:6,1')
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

        // Product Categories
        Route::middleware('permission:products.view')->group(function () {
            Route::get('products/categories', [ProductCategoryController::class, 'index'])->name('admin.products.categories');
            Route::get('products/categories/{category}/edit', [ProductCategoryController::class, 'edit'])->name('admin.products.categories.edit');
        });
        Route::middleware('permission:products.create')->group(function () {
            Route::get('products/categories/create', [ProductCategoryController::class, 'create'])->name('admin.products.categories.create');
            Route::post('products/categories', [ProductCategoryController::class, 'store'])->name('admin.products.categories.store');
        });
        Route::put('products/categories/{category}', [ProductCategoryController::class, 'update'])->name('admin.products.categories.update')->middleware('permission:products.update');
        Route::delete('products/categories/{category}', [ProductCategoryController::class, 'destroy'])->name('admin.products.categories.destroy')->middleware('permission:products.delete');

        // Products
        Route::get('products', [ProductController::class, 'index'])->name('admin.products')->middleware('permission:products.view');
        Route::get('products/create', [ProductController::class, 'create'])->name('admin.products.create')->middleware('permission:products.create');
        Route::post('products', [ProductController::class, 'store'])->name('admin.products.store')->middleware('permission:products.create');
        Route::get('products/{product}/edit', [ProductController::class, 'edit'])->name('admin.products.edit')->middleware('permission:products.update');
        Route::put('products/{product}', [ProductController::class, 'update'])->name('admin.products.update')->middleware('permission:products.update');
        Route::delete('products/{product}', [ProductController::class, 'destroy'])->name('admin.products.destroy')->middleware('permission:products.delete');
        Route::post('products/{product}/restore', [ProductController::class, 'restore'])->name('admin.products.restore')->middleware('permission:products.delete');
        Route::post('products/{product}/publish', [ProductController::class, 'publish'])->name('admin.products.publish')->middleware('permission:products.update');
        Route::post('products/{product}/archive', [ProductController::class, 'archive'])->name('admin.products.archive')->middleware('permission:products.update');
        Route::get('products/{product}/preview', [ProductController::class, 'preview'])->name('admin.products.preview')->middleware('permission:products.view');

        Route::post('products/{product}/images', [ProductImageController::class, 'store'])->name('admin.products.images.store')->middleware('permission:products.update');
        Route::delete('products/{product}/images/{image}', [ProductImageController::class, 'destroy'])->name('admin.products.images.destroy')->middleware('permission:products.update');

        // Capabilities
        Route::get('capabilities', [CapabilityController::class, 'index'])->name('admin.capabilities')->middleware('permission:capabilities.view');
        Route::get('capabilities/create', [CapabilityController::class, 'create'])->name('admin.capabilities.create')->middleware('permission:capabilities.create');
        Route::post('capabilities', [CapabilityController::class, 'store'])->name('admin.capabilities.store')->middleware('permission:capabilities.create');
        Route::get('capabilities/{capability}/edit', [CapabilityController::class, 'edit'])->name('admin.capabilities.edit')->middleware('permission:capabilities.update');
        Route::put('capabilities/{capability}', [CapabilityController::class, 'update'])->name('admin.capabilities.update')->middleware('permission:capabilities.update');
        Route::delete('capabilities/{capability}', [CapabilityController::class, 'destroy'])->name('admin.capabilities.destroy')->middleware('permission:capabilities.delete');
        Route::post('capabilities/{capability}/restore', [CapabilityController::class, 'restore'])->name('admin.capabilities.restore')->middleware('permission:capabilities.delete');
        Route::post('capabilities/{capability}/publish', [CapabilityController::class, 'publish'])->name('admin.capabilities.publish')->middleware('permission:capabilities.update');
        Route::post('capabilities/{capability}/archive', [CapabilityController::class, 'archive'])->name('admin.capabilities.archive')->middleware('permission:capabilities.update');
        Route::post('capabilities/{capability}/machines', [CapabilityController::class, 'syncMachines'])->name('admin.capabilities.machines')->middleware('permission:capabilities.update');
        Route::get('capabilities/{capability}/preview', [CapabilityController::class, 'preview'])->name('admin.capabilities.preview')->middleware('permission:capabilities.view');

        Route::post('capabilities/{capability}/steps', [CapabilityStepController::class, 'store'])->name('admin.capabilities.steps.store')->middleware('permission:capabilities.update');
        Route::put('capabilities/{capability}/steps/{step}', [CapabilityStepController::class, 'update'])->name('admin.capabilities.steps.update')->middleware('permission:capabilities.update');
        Route::delete('capabilities/{capability}/steps/{step}', [CapabilityStepController::class, 'destroy'])->name('admin.capabilities.steps.destroy')->middleware('permission:capabilities.update');
        Route::post('capabilities/{capability}/steps/reorder', [CapabilityStepController::class, 'reorder'])->name('admin.capabilities.steps.reorder')->middleware('permission:capabilities.update');

        // Facility Categories
        Route::middleware('permission:facilities.view')->group(function () {
            Route::get('facilities/categories', [FacilityCategoryController::class, 'index'])->name('admin.facilities.categories');
            Route::get('facilities/categories/{category}/edit', [FacilityCategoryController::class, 'edit'])->name('admin.facilities.categories.edit');
        });
        Route::middleware('permission:facilities.create')->group(function () {
            Route::get('facilities/categories/create', [FacilityCategoryController::class, 'create'])->name('admin.facilities.categories.create');
            Route::post('facilities/categories', [FacilityCategoryController::class, 'store'])->name('admin.facilities.categories.store');
        });
        Route::put('facilities/categories/{category}', [FacilityCategoryController::class, 'update'])->name('admin.facilities.categories.update')->middleware('permission:facilities.update');
        Route::delete('facilities/categories/{category}', [FacilityCategoryController::class, 'destroy'])->name('admin.facilities.categories.destroy')->middleware('permission:facilities.delete');

        // Facilities
        Route::get('facilities', [FacilityController::class, 'index'])->name('admin.facilities')->middleware('permission:facilities.view');
        Route::get('facilities/create', [FacilityController::class, 'create'])->name('admin.facilities.create')->middleware('permission:facilities.create');
        Route::post('facilities', [FacilityController::class, 'store'])->name('admin.facilities.store')->middleware('permission:facilities.create');
        Route::get('facilities/{facility}/edit', [FacilityController::class, 'edit'])->name('admin.facilities.edit')->middleware('permission:facilities.update');
        Route::put('facilities/{facility}', [FacilityController::class, 'update'])->name('admin.facilities.update')->middleware('permission:facilities.update');
        Route::delete('facilities/{facility}', [FacilityController::class, 'destroy'])->name('admin.facilities.destroy')->middleware('permission:facilities.delete');

        // Machines
        Route::get('machines', [MachineController::class, 'index'])->name('admin.machines')->middleware('permission:facilities.view');
        Route::get('machines/create', [MachineController::class, 'create'])->name('admin.machines.create')->middleware('permission:facilities.create');
        Route::post('machines', [MachineController::class, 'store'])->name('admin.machines.store')->middleware('permission:facilities.create');
        Route::get('machines/{machine}/edit', [MachineController::class, 'edit'])->name('admin.machines.edit')->middleware('permission:facilities.update');
        Route::put('machines/{machine}', [MachineController::class, 'update'])->name('admin.machines.update')->middleware('permission:facilities.update');
        Route::delete('machines/{machine}', [MachineController::class, 'destroy'])->name('admin.machines.destroy')->middleware('permission:facilities.delete');

        // Certifications
        Route::get('certifications', [CertificationController::class, 'index'])->name('admin.certifications')->middleware('permission:certifications.view');
        Route::get('certifications/create', [CertificationController::class, 'create'])->name('admin.certifications.create')->middleware('permission:certifications.create');
        Route::post('certifications', [CertificationController::class, 'store'])->name('admin.certifications.store')->middleware('permission:certifications.create');
        Route::get('certifications/{certification}/edit', [CertificationController::class, 'edit'])->name('admin.certifications.edit')->middleware('permission:certifications.update');
        Route::put('certifications/{certification}', [CertificationController::class, 'update'])->name('admin.certifications.update')->middleware('permission:certifications.update');
        Route::delete('certifications/{certification}', [CertificationController::class, 'destroy'])->name('admin.certifications.destroy')->middleware('permission:certifications.delete');
        Route::get('certifications/{certification}/document', [CertificationController::class, 'downloadDocument'])->name('admin.certifications.document')->middleware('permission:certifications.view');

        // Quality Content
        Route::get('quality-content', [QualityContentController::class, 'index'])->name('admin.quality-content')->middleware('permission:certifications.view');
        Route::get('quality-content/create', [QualityContentController::class, 'create'])->name('admin.quality-content.create')->middleware('permission:certifications.create');
        Route::post('quality-content', [QualityContentController::class, 'store'])->name('admin.quality-content.store')->middleware('permission:certifications.create');
        Route::get('quality-content/{qualityContent}/edit', [QualityContentController::class, 'edit'])->name('admin.quality-content.edit')->middleware('permission:certifications.update');
        Route::put('quality-content/{qualityContent}', [QualityContentController::class, 'update'])->name('admin.quality-content.update')->middleware('permission:certifications.update');
        Route::delete('quality-content/{qualityContent}', [QualityContentController::class, 'destroy'])->name('admin.quality-content.destroy')->middleware('permission:certifications.delete');

        // Industries
        Route::get('industries', [IndustryController::class, 'index'])->name('admin.industries')->middleware('permission:industries.view');
        Route::get('industries/create', [IndustryController::class, 'create'])->name('admin.industries.create')->middleware('permission:industries.create');
        Route::post('industries', [IndustryController::class, 'store'])->name('admin.industries.store')->middleware('permission:industries.create');
        Route::get('industries/{industry}/edit', [IndustryController::class, 'edit'])->name('admin.industries.edit')->middleware('permission:industries.update');
        Route::put('industries/{industry}', [IndustryController::class, 'update'])->name('admin.industries.update')->middleware('permission:industries.update');
        Route::delete('industries/{industry}', [IndustryController::class, 'destroy'])->name('admin.industries.destroy')->middleware('permission:industries.delete');

        // Milestones
        Route::get('milestones', [MilestoneController::class, 'index'])->name('admin.milestones')->middleware('permission:milestones.view');
        Route::get('milestones/create', [MilestoneController::class, 'create'])->name('admin.milestones.create')->middleware('permission:milestones.create');
        Route::post('milestones', [MilestoneController::class, 'store'])->name('admin.milestones.store')->middleware('permission:milestones.create');
        Route::get('milestones/{milestone}/edit', [MilestoneController::class, 'edit'])->name('admin.milestones.edit')->middleware('permission:milestones.update');
        Route::put('milestones/{milestone}', [MilestoneController::class, 'update'])->name('admin.milestones.update')->middleware('permission:milestones.update');
        Route::delete('milestones/{milestone}', [MilestoneController::class, 'destroy'])->name('admin.milestones.destroy')->middleware('permission:milestones.delete');

        // News Categories
        Route::get('news/categories', [NewsCategoryController::class, 'index'])->name('admin.news.categories')->middleware('permission:news.view');
        Route::get('news/categories/create', [NewsCategoryController::class, 'create'])->name('admin.news.categories.create')->middleware('permission:news.create');
        Route::post('news/categories', [NewsCategoryController::class, 'store'])->name('admin.news.categories.store')->middleware('permission:news.create');
        Route::get('news/categories/{newsCategory}/edit', [NewsCategoryController::class, 'edit'])->name('admin.news.categories.edit')->middleware('permission:news.update');
        Route::put('news/categories/{newsCategory}', [NewsCategoryController::class, 'update'])->name('admin.news.categories.update')->middleware('permission:news.update');
        Route::delete('news/categories/{newsCategory}', [NewsCategoryController::class, 'destroy'])->name('admin.news.categories.destroy')->middleware('permission:news.delete');

        // Articles / News
        Route::get('news', [ArticleController::class, 'index'])->name('admin.news')->middleware('permission:news.view');
        Route::get('news/create', [ArticleController::class, 'create'])->name('admin.news.create')->middleware('permission:news.create');
        Route::post('news', [ArticleController::class, 'store'])->name('admin.news.store')->middleware('permission:news.create');
        Route::get('news/{article}/edit', [ArticleController::class, 'edit'])->name('admin.news.edit')->middleware('permission:news.update');
        Route::put('news/{article}', [ArticleController::class, 'update'])->name('admin.news.update')->middleware('permission:news.update');
        Route::delete('news/{article}', [ArticleController::class, 'destroy'])->name('admin.news.destroy')->middleware('permission:news.delete');
        Route::post('news/{article}/restore', [ArticleController::class, 'restore'])->name('admin.news.restore')->middleware('permission:news.delete');
        Route::post('news/{article}/publish', [ArticleController::class, 'publish'])->name('admin.news.publish')->middleware('permission:news.update');
        Route::post('news/{article}/archive', [ArticleController::class, 'archive'])->name('admin.news.archive')->middleware('permission:news.update');
        Route::get('news/{article}/preview', [ArticleController::class, 'preview'])->name('admin.news.preview')->middleware('permission:news.view');

        // Job Vacancies
        Route::get('careers', [JobVacancyController::class, 'index'])->name('admin.careers')->middleware('permission:careers.manage');
        Route::get('careers/create', [JobVacancyController::class, 'create'])->name('admin.careers.create')->middleware('permission:careers.manage');
        Route::post('careers', [JobVacancyController::class, 'store'])->name('admin.careers.store')->middleware('permission:careers.manage');
        Route::get('careers/applications', [JobApplicationController::class, 'index'])->name('admin.careers.applications')->middleware('permission:careers.manage');
        Route::get('careers/applications/{application}', [JobApplicationController::class, 'show'])->name('admin.careers.applications.show')->middleware('permission:careers.manage');
        Route::put('careers/applications/{application}/status', [JobApplicationController::class, 'updateStatus'])->name('admin.careers.applications.status')->middleware('permission:careers.manage');
        Route::get('careers/applications/{application}/cv', [JobApplicationController::class, 'downloadCv'])->name('admin.careers.applications.cv')->middleware('permission:careers.manage');
        Route::get('careers/{vacancy}/edit', [JobVacancyController::class, 'edit'])->name('admin.careers.edit')->middleware('permission:careers.manage');
        Route::put('careers/{vacancy}', [JobVacancyController::class, 'update'])->name('admin.careers.update')->middleware('permission:careers.manage');
        Route::delete('careers/{vacancy}', [JobVacancyController::class, 'destroy'])->name('admin.careers.destroy')->middleware('permission:careers.manage');
        Route::post('careers/{vacancy}/restore', [JobVacancyController::class, 'restore'])->name('admin.careers.restore')->middleware('permission:careers.manage');
        Route::post('careers/{vacancy}/publish', [JobVacancyController::class, 'publish'])->name('admin.careers.publish')->middleware('permission:careers.manage');
        Route::post('careers/{vacancy}/archive', [JobVacancyController::class, 'archive'])->name('admin.careers.archive')->middleware('permission:careers.manage');
        Route::get('careers/{vacancy}/preview', [JobVacancyController::class, 'preview'])->name('admin.careers.preview')->middleware('permission:careers.manage');

        // Contact Inquiries
        Route::get('inquiries', [ContactInquiryController::class, 'index'])->name('admin.inquiries')->middleware('permission:inquiries.manage');
        Route::get('inquiries/{inquiry}', [ContactInquiryController::class, 'show'])->name('admin.inquiries.show')->middleware('permission:inquiries.manage');
        Route::put('inquiries/{inquiry}/status', [ContactInquiryController::class, 'updateStatus'])->name('admin.inquiries.status')->middleware('permission:inquiries.manage');

        // Media Library
        Route::get('media', [MediaController::class, 'index'])->name('admin.media')->middleware('permission:media.manage');
        Route::get('media/picker', [MediaController::class, 'picker'])->name('admin.media.picker')->middleware('permission:media.manage');
        Route::post('media', [MediaController::class, 'store'])->name('admin.media.store')->middleware('permission:media.manage');
        Route::put('media/{media}/alt-text', [MediaController::class, 'updateAltText'])->name('admin.media.alt-text')->middleware('permission:media.manage');
        Route::post('media/{media}/replace', [MediaController::class, 'replace'])->name('admin.media.replace')->middleware('permission:media.manage');
        Route::delete('media/{media}', [MediaController::class, 'destroy'])->name('admin.media.destroy')->middleware('permission:media.manage');

        // Website Settings
        Route::get('settings', [SettingsController::class, 'edit'])->name('admin.settings')->middleware('permission:settings.manage');
        Route::put('settings', [SettingsController::class, 'update'])->name('admin.settings.update')->middleware('permission:settings.manage');

        // Users
        Route::get('users', [UserController::class, 'index'])->name('admin.users')->middleware('permission:users.manage');
        Route::get('users/create', [UserController::class, 'create'])->name('admin.users.create')->middleware('permission:users.manage');
        Route::post('users', [UserController::class, 'store'])->name('admin.users.store')->middleware('permission:users.manage');
        Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('admin.users.edit')->middleware('permission:users.manage');
        Route::put('users/{user}', [UserController::class, 'update'])->name('admin.users.update')->middleware('permission:users.manage');
        Route::put('users/{user}/status', [UserController::class, 'updateStatus'])->name('admin.users.status')->middleware('permission:users.manage');
        Route::put('users/{user}/password', [UserController::class, 'resetPassword'])->name('admin.users.password')->middleware('permission:users.manage');

        // Roles
        Route::get('roles', [RoleController::class, 'index'])->name('admin.roles')->middleware('permission:users.manage');
        Route::get('roles/create', [RoleController::class, 'create'])->name('admin.roles.create')->middleware('permission:users.manage');
        Route::post('roles', [RoleController::class, 'store'])->name('admin.roles.store')->middleware('permission:users.manage');
        Route::get('roles/{role}/edit', [RoleController::class, 'edit'])->name('admin.roles.edit')->middleware('permission:users.manage');
        Route::put('roles/{role}', [RoleController::class, 'update'])->name('admin.roles.update')->middleware('permission:users.manage');
        Route::delete('roles/{role}', [RoleController::class, 'destroy'])->name('admin.roles.destroy')->middleware('permission:users.manage');

        // Activity Logs
        Route::get('activity-logs', [ActivityLogController::class, 'index'])->name('admin.activity-logs')->middleware('permission:users.manage');

        // Module foundation placeholders — modules not yet built land here.
        $placeholders = [
            ['seo', 'admin.seo', 'seo.manage', 'SEO Manager', 'Manage SEO metadata across content.'],
        ];

        foreach ($placeholders as [$uri, $name, $permission, $title, $description]) {
            Route::get($uri, fn () => Inertia::render('admin/Placeholder', [
                'title' => $title,
                'description' => $description,
            ]))->name($name)->middleware("permission:{$permission}");
        }
    });
});
