<?php

use App\Models\Certification;
use Illuminate\Support\Facades\Storage;

beforeEach(fn () => Storage::fake('local'));

test('a published certification PDF is available for its public preview in both locales', function () {
    $path = 'certifications/documents/visible.pdf';
    Storage::disk('local')->put($path, '%PDF-1.4 test preview');
    $certification = Certification::factory()->published()->create(['document_path' => $path]);

    foreach (['public.certifications.document', 'en.public.certifications.document'] as $name) {
        $this->get(route($name, $certification->id))
            ->assertOk()
            ->assertHeader('Content-Type', 'application/pdf')
            ->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    $this->get('/certifications')->assertInertia(fn ($page) => $page
        ->component('public/certifications/Index')
        ->where('certifications.0.has_document', true)
    );
});

test('draft, scheduled, missing and out-of-directory PDFs cannot be previewed publicly', function () {
    $path = 'certifications/documents/private.pdf';
    Storage::disk('local')->put($path, '%PDF-1.4 test preview');
    Storage::disk('local')->put('certifications/applications/private.pdf', '%PDF-1.4 private document');

    $draft = Certification::factory()->create(['document_path' => $path]);
    $scheduled = Certification::factory()->published()->create([
        'document_path' => $path,
        'published_at' => now()->addDay(),
    ]);
    $missing = Certification::factory()->published()->create([
        'document_path' => 'certifications/documents/missing.pdf',
    ]);
    $outside = Certification::factory()->published()->create([
        'document_path' => 'other/private.pdf',
    ]);
    $traversal = Certification::factory()->published()->create([
        'document_path' => 'certifications/documents/../applications/private.pdf',
    ]);

    foreach ([$draft, $scheduled, $missing, $outside, $traversal] as $certification) {
        $this->get(route('public.certifications.document', $certification->id))->assertNotFound();
    }
});
