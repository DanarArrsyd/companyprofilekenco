<?php

use App\Models\Capability;
use App\Models\Certification;
use App\Models\Facility;
use App\Models\Product;
use App\Models\QualityContent;

test('product listing shows only published products', function () {
    Product::factory()->published()->create(['name' => 'Visible Product']);
    Product::factory()->create(['name' => 'Hidden Draft']);

    $response = $this->get('/products');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/products/Index')
        ->has('products.data', 1)
        ->where('products.data.0.name', 'Visible Product')
    );
});

test('product detail page renders for a published product', function () {
    $product = Product::factory()->published()->create(['slug' => 'my-product']);

    $response = $this->get('/products/my-product');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/products/Show')
        ->where('product.id', $product->id)
    );
});

test('capability listing and detail pages render published capabilities only', function () {
    Capability::factory()->published()->create(['name' => 'Welding', 'slug' => 'welding']);
    Capability::factory()->create(['name' => 'Draft Capability']);

    $this->get('/capabilities')->assertInertia(fn ($page) => $page
        ->component('public/capabilities/Index')
        ->has('capabilities', 1)
    );

    $this->get('/capabilities/welding')->assertOk();
});

test('the merged company page renders only published facilities', function () {
    Facility::factory()->published()->create(['name' => 'Visible Facility']);
    Facility::factory()->create(['name' => 'Draft Facility']);

    $response = $this->get('/company');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/company/Index')
        ->has('facilities', 1)
    );
});

test('certifications page renders only published certifications', function () {
    Certification::factory()->published()->create(['name' => 'Visible Cert']);
    Certification::factory()->create(['name' => 'Draft Cert']);

    $response = $this->get('/certifications');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/certifications/Index')
        ->has('certifications', 1)
    );
});

test('quality page renders only published quality content', function () {
    QualityContent::factory()->published()->create(['title' => 'Visible Quality']);
    QualityContent::factory()->create(['title' => 'Draft Quality']);

    $response = $this->get('/quality');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/quality/Index')
        ->has('items', 1)
    );
});
