<?php

use App\Enums\ApplicationStatus;
use App\Enums\ContentStatus;
use App\Models\JobApplication;
use App\Models\JobVacancy;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Storage::fake('local');
    Permission::findOrCreate('careers.manage', 'web');
});

test('valid application is accepted for a published open vacancy', function () {
    $vacancy = JobVacancy::factory()->published()->create(['closes_at' => now()->addWeek()]);

    $response = $this->post(route('public.careers.apply', $vacancy->slug), [
        'name' => 'Jane Applicant',
        'email' => 'jane@example.com',
        'phone' => '08123456789',
        'address' => 'Jl. Industri No. 1',
        'cover_letter' => 'I would like to apply.',
        'cv' => UploadedFile::fake()->create('cv.pdf', 500, 'application/pdf'),
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('job_applications', ['applicant_email' => 'jane@example.com', 'job_vacancy_id' => $vacancy->id]);

    $application = JobApplication::where('applicant_email', 'jane@example.com')->firstOrFail();
    Storage::disk('local')->assertExists($application->cv_path);
});

test('application to a draft vacancy is rejected', function () {
    $vacancy = JobVacancy::factory()->create(['status' => ContentStatus::Draft]);

    $response = $this->post(route('public.careers.apply', $vacancy->slug), [
        'name' => 'Jane Applicant',
        'email' => 'jane@example.com',
        'cv' => UploadedFile::fake()->create('cv.pdf', 500, 'application/pdf'),
    ]);

    $response->assertNotFound();
});

test('application to an expired vacancy is rejected', function () {
    $vacancy = JobVacancy::factory()->published()->create(['closes_at' => now()->subDay()]);

    $response = $this->post(route('public.careers.apply', $vacancy->slug), [
        'name' => 'Jane Applicant',
        'email' => 'jane@example.com',
        'cv' => UploadedFile::fake()->create('cv.pdf', 500, 'application/pdf'),
    ]);

    $response->assertStatus(422);
});

test('invalid CV file type is rejected', function () {
    $vacancy = JobVacancy::factory()->published()->create(['closes_at' => now()->addWeek()]);

    $response = $this->post(route('public.careers.apply', $vacancy->slug), [
        'name' => 'Jane Applicant',
        'email' => 'jane@example.com',
        'cv' => UploadedFile::fake()->create('malware.exe', 100, 'application/x-msdownload'),
    ]);

    $response->assertSessionHasErrors('cv');
});

test('unauthorized user cannot view job applications', function () {
    $user = User::factory()->create();
    $application = JobApplication::factory()->create();

    $this->actingAs($user)->get(route('admin.careers.applications.show', $application))->assertForbidden();
});

test('authorized admin can update application status', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('careers.manage');
    $application = JobApplication::factory()->create();

    $response = $this->actingAs($user)->put(route('admin.careers.applications.status', $application), [
        'status' => 'shortlisted',
        'notes' => 'Strong candidate.',
    ]);

    $response->assertRedirect();
    expect($application->fresh()->status)->toBe(ApplicationStatus::Shortlisted);
});
