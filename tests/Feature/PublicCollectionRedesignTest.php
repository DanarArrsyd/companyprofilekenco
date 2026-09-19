<?php

use App\Models\Capability;
use App\Models\Certification;
use App\Models\Facility;
use App\Models\Machine;
use App\Models\Product;

test('facility machine specs are publicly visible when the relationship exists', function () {
    $facility = Facility::factory()->published()->create(['name' => 'Main Plant']);
    Machine::factory()->create([
        'facility_id' => $facility->id,
        'name' => 'CNC Mill',
        'brand' => 'Haas',
        'model' => 'VF-2',
        'is_active' => true,
    ]);
    Machine::factory()->create([
        'facility_id' => $facility->id,
        'name' => 'Inactive Machine',
        'status' => 'draft',
    ]);

    $response = $this->get('/company');

    $response->assertInertia(fn ($page) => $page
        ->component('public/company/Index')
        ->where('facilities.0.machines.0.name', 'CNC Mill')
        ->where('facilities.0.machines.0.brand', 'Haas')
        ->has('facilities.0.machines', 1)
    );
});

test('facility with no machines renders safely without inventing data', function () {
    Facility::factory()->published()->create(['name' => 'Empty Facility']);

    $response = $this->get('/company');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/company/Index')
        ->has('facilities.0.machines', 0)
    );
});

test('product gallery images render on the product detail page', function () {
    $product = Product::factory()->published()->create(['slug' => 'gallery-product']);
    $product->images()->create(['path' => 'products/gallery/a.jpg', 'alt_text' => 'Angle A', 'order' => 0]);
    $product->images()->create(['path' => 'products/gallery/b.jpg', 'alt_text' => 'Angle B', 'order' => 1]);

    $response = $this->get('/products/gallery-product');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/products/Show')
        ->has('product.images', 2)
    );
});

test('featured capability image is passed through on the capabilities index', function () {
    Capability::factory()->published()->create(['name' => 'CNC Machining', 'featured_image' => 'capabilities/cnc.jpg']);

    $response = $this->get('/capabilities');

    $response->assertInertia(fn ($page) => $page
        ->component('public/capabilities/Index')
        ->where('capabilities.0.featured_image', 'capabilities/cnc.jpg')
    );
});

test('capability detail exposes structured machine specs, not just names', function () {
    $capability = Capability::factory()->published()->create(['slug' => 'welding']);
    $machine = Machine::factory()->create(['name' => 'Welding Robot', 'brand' => 'Fanuc', 'capacity' => '6-axis']);
    $capability->machines()->attach($machine->id);

    $response = $this->get('/capabilities/welding');

    $response->assertInertia(fn ($page) => $page
        ->component('public/capabilities/Show')
        ->where('capability.machines.0.brand', 'Fanuc')
        ->where('capability.machines.0.capacity', '6-axis')
    );
});

test('certification status and detail data render on the public index', function () {
    Certification::factory()->published()->create(['name' => 'Active Cert', 'expires_at' => now()->addYear()]);
    Certification::factory()->published()->expired()->create(['name' => 'Expired Cert']);

    $response = $this->get('/certifications');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/certifications/Index')
        ->has('certifications', 2)
        ->where('certifications', fn ($certs) => collect($certs)->firstWhere('name', 'Active Cert')['is_expired'] === false
            && collect($certs)->firstWhere('name', 'Expired Cert')['is_expired'] === true)
    );
});
