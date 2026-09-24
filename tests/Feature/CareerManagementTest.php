<?php

use App\Enums\ContentStatus;
use App\Models\JobVacancy;
use App\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Permission::findOrCreate('careers.manage', 'web');
});

test('authorized admin can create a job vacancy', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('careers.manage');

    $response = $this->actingAs($user)->post(route('admin.careers.store'), [
        'title' => 'CNC Machine Operator',
        'status' => 'draft',
        'seo' => [],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('job_vacancies', ['title->en' => 'CNC Machine Operator', 'slug' => 'cnc-machine-operator']);
});

test('unauthorized user cannot manage job vacancies', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('admin.careers'))->assertForbidden();
});

test('published vacancy is publicly visible', function () {
    JobVacancy::factory()->published()->create(['slug' => 'welder']);

    $this->get('/careers/welder')->assertOk();
});

test('draft vacancy is not publicly visible', function () {
    JobVacancy::factory()->create(['slug' => 'draft-vacancy', 'status' => ContentStatus::Draft]);

    $this->get('/careers/draft-vacancy')->assertNotFound();
});

test('expired vacancy is closed for new applications', function () {
    $vacancy = JobVacancy::factory()->published()->create(['closes_at' => now()->subDay()]);

    expect($vacancy->isOpen())->toBeFalse();
});

test('vacancy has polymorphic seo metadata', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('careers.manage');

    $this->actingAs($user)->post(route('admin.careers.store'), [
        'title' => 'SEO Vacancy',
        'status' => 'draft',
        'seo' => ['meta_title' => 'Custom SEO Title'],
    ]);

    $vacancy = JobVacancy::where('title->en', 'SEO Vacancy')->firstOrFail();

    expect($vacancy->seoMetadata)->not->toBeNull()
        ->and($vacancy->seoMetadata->meta_title)->toBe('Custom SEO Title');
});

test('public careers listing shows only published vacancies', function () {
    JobVacancy::factory()->published()->create(['title' => 'Visible Vacancy']);
    JobVacancy::factory()->create(['title' => 'Hidden Vacancy']);

    $response = $this->get('/careers');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/careers/Index')
        ->has('vacancies.data', 1)
        ->where('vacancies.data.0.title', 'Visible Vacancy')
    );
});

test('public careers detail page renders for a published vacancy', function () {
    $vacancy = JobVacancy::factory()->published()->create(['slug' => 'machinist']);

    $response = $this->get('/careers/machinist');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/careers/Show')
        ->where('vacancy.id', $vacancy->id)
    );
});
