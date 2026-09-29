<?php

use App\Enums\CustomerSegment;
use App\Models\Customer;
use App\Models\Media;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

function customerAdmin(array $permissions = ['customers.view', 'customers.create', 'customers.update', 'customers.delete']): User
{
    foreach ($permissions as $permission) {
        Permission::findOrCreate($permission, 'web');
    }

    return tap(User::factory()->create())->givePermissionTo($permissions);
}

test('an admin adds a customer with an uploaded logo', function () {
    Storage::fake('public');

    $this->actingAs(customerAdmin())->post(route('admin.customers.store'), [
        'name' => 'PT Astra Daihatsu Motor',
        'segment' => 'engineering',
        'logo' => UploadedFile::fake()->image('adm.png', 400, 200),
        'is_featured' => true,
    ])->assertSessionHasNoErrors()->assertRedirect(route('admin.customers'));

    $customer = Customer::firstOrFail();

    expect($customer->name)->toBe('PT Astra Daihatsu Motor')
        ->and($customer->logo)->not->toBeNull()
        ->and($customer->is_featured)->toBeTrue()
        ->and($customer->segment)->toBe(CustomerSegment::Engineering);
    Storage::disk('public')->assertExists($customer->logo->path);
});

test('an admin picks a library logo, renames, hides and deletes a customer', function () {
    $media = Media::create(['path' => 'library/tmmin.webp', 'filename' => 'tmmin.webp', 'mime_type' => 'image/webp', 'size' => 10, 'disk' => 'public']);
    $customer = Customer::create(['name' => 'Toyota', 'is_featured' => true, 'order' => 0]);
    $admin = customerAdmin();

    $this->actingAs($admin)->put(route('admin.customers.update', $customer), [
        'name' => 'PT Toyota Motor Manufacturing Indonesia',
        'segment' => 'stamping',
        'logo_path' => 'library/tmmin.webp',
        'is_featured' => false,
    ])->assertSessionHasNoErrors();

    expect($customer->fresh())
        ->name->toBe('PT Toyota Motor Manufacturing Indonesia')
        ->logo_media_id->toBe($media->id)
        ->is_featured->toBeFalse();

    $this->actingAs($admin)->delete(route('admin.customers.destroy', $customer))->assertRedirect();
    expect(Customer::count())->toBe(0);
});

test('the order of customers is saved from the list', function () {
    $a = Customer::create(['name' => 'A', 'order' => 0]);
    $b = Customer::create(['name' => 'B', 'order' => 1]);

    $this->actingAs(customerAdmin())
        ->post(route('admin.customers.reorder'), ['ordered_ids' => [$b->id, $a->id]])
        ->assertSessionHasNoErrors();

    expect(Customer::orderBy('order')->pluck('name')->all())->toBe(['B', 'A']);
});

test('customers need a name and only image logos', function () {
    Storage::fake('public');

    $this->actingAs(customerAdmin())->post(route('admin.customers.store'), [
        'name' => '',
        'segment' => 'painting',
        'logo' => UploadedFile::fake()->create('logo.pdf', 10, 'application/pdf'),
    ])->assertSessionHasErrors(['name', 'segment', 'logo']);
});

test('users without the permission cannot manage customers', function () {
    $user = customerAdmin(['customers.view']);
    $customer = Customer::create(['name' => 'X']);

    $this->actingAs($user)->get(route('admin.customers'))->assertOk();
    $this->actingAs($user)->delete(route('admin.customers.destroy', $customer))->assertForbidden();
    $this->actingAs(User::factory()->create())->get(route('admin.customers'))->assertForbidden();
});

test('the homepage shows shown customers per segment, in order, without links', function () {
    $media = Media::create(['path' => 'library/adm.webp', 'filename' => 'adm.webp', 'mime_type' => 'image/webp', 'size' => 10, 'disk' => 'public']);
    Customer::create(['name' => 'Second', 'segment' => 'stamping', 'is_featured' => true, 'order' => 2]);
    Customer::create(['name' => 'First', 'segment' => 'stamping', 'is_featured' => true, 'order' => 1, 'logo_media_id' => $media->id]);
    Customer::create(['name' => 'Tooling', 'segment' => 'engineering', 'is_featured' => true, 'order' => 0]);
    Customer::create(['name' => 'Hidden', 'segment' => 'stamping', 'is_featured' => false, 'order' => 0]);

    $this->get('/en')->assertOk()->assertInertia(fn ($page) => $page
        ->missing('industries')
        ->has('customers.stamping', 2)
        ->where('customers.stamping.0', ['id' => Customer::where('name', 'First')->value('id'), 'name' => 'First', 'logo' => 'library/adm.webp'])
        ->where('customers.stamping.1.name', 'Second')
        ->has('customers.engineering', 1)
        ->where('customers.engineering.0.name', 'Tooling'));
});

test('existing customers start in Stamping Production', function () {
    $customer = Customer::create(['name' => 'Legacy']);

    expect($customer->fresh()->segment)->toBe(CustomerSegment::Stamping);
});

test('the permission migration gives customers access to the admin roles', function () {
    $super = Role::findOrCreate('Super Admin', 'web');
    $content = Role::findOrCreate('Content Admin', 'web');

    (require database_path('migrations/2026_09_29_000003_add_customer_permissions.php'))->up();

    expect($super->fresh()->hasPermissionTo('customers.delete'))->toBeTrue()
        ->and($content->fresh()->hasPermissionTo('customers.update'))->toBeTrue()
        ->and($content->fresh()->hasPermissionTo('customers.delete'))->toBeFalse();
});
