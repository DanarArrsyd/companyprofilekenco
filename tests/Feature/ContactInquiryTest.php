<?php

use App\Enums\InquiryStatus;
use App\Models\ContactInquiry;
use App\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Permission::findOrCreate('inquiries.manage', 'web');
});

test('valid contact inquiry is accepted', function () {
    $response = $this->post(route('public.contact.store'), [
        'name' => 'John Doe',
        'company' => 'Acme Corp',
        'email' => 'john@example.com',
        'phone' => '08123456789',
        'subject' => 'Product inquiry',
        'message' => 'I would like a quote.',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('contact_inquiries', ['email' => 'john@example.com', 'subject' => 'Product inquiry']);
});

test('contact inquiry stores ip address and user agent without exposing them publicly', function () {
    $this->post(route('public.contact.store'), [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'message' => 'Hello there.',
    ]);

    $inquiry = ContactInquiry::where('email', 'john@example.com')->firstOrFail();

    expect($inquiry->ip_address)->not->toBeNull();
});

test('invalid contact inquiry data is rejected', function () {
    $response = $this->post(route('public.contact.store'), [
        'name' => '',
        'email' => 'not-an-email',
        'message' => '',
    ]);

    $response->assertSessionHasErrors(['name', 'email', 'message']);
});

test('honeypot field rejects bot submissions', function () {
    $response = $this->post(route('public.contact.store'), [
        'name' => 'Bot',
        'email' => 'bot@example.com',
        'message' => 'Spam message.',
        'website' => 'https://spam.example.com',
    ]);

    $response->assertSessionHasErrors('website');
});

test('contact form submission is rate limited', function () {
    for ($i = 0; $i < 5; $i++) {
        $this->post(route('public.contact.store'), [
            'name' => "User {$i}",
            'email' => "user{$i}@example.com",
            'message' => 'Hello.',
        ]);
    }

    $response = $this->post(route('public.contact.store'), [
        'name' => 'One Too Many',
        'email' => 'toomany@example.com',
        'message' => 'Hello.',
    ]);

    $response->assertStatus(429);
});

test('unauthorized user cannot view contact inquiries', function () {
    $user = User::factory()->create();
    $inquiry = ContactInquiry::factory()->create();

    $this->actingAs($user)->get(route('admin.inquiries.show', $inquiry))->assertForbidden();
});

test('authorized admin can view and update inquiry status', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('inquiries.manage');
    $inquiry = ContactInquiry::factory()->create();

    $this->actingAs($user)->get(route('admin.inquiries.show', $inquiry))->assertOk();

    $response = $this->actingAs($user)->put(route('admin.inquiries.status', $inquiry), ['status' => 'replied']);

    $response->assertRedirect();
    expect($inquiry->fresh()->status)->toBe(InquiryStatus::Replied);
});
