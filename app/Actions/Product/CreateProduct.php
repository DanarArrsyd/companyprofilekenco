<?php

namespace App\Actions\Product;

use App\Models\Product;
use App\Services\ActivityLogService;
use App\Services\MediaUploadService;
use App\Services\SeoService;
use App\Support\SlugGenerator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CreateProduct
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
        private readonly MediaUploadService $media,
        private readonly SeoService $seo,
    ) {}

    public function handle(array $data): Product
    {
        $slug = trim($data['slug'] ?? '') !== ''
            ? $data['slug']
            : SlugGenerator::unique('products', $data['name']);

        $featuredImage = match (true) {
            isset($data['featured_image']) && $data['featured_image'] !== null => $this->media->storePublicImage($data['featured_image'], 'products'),
            ! empty($data['featured_image_path']) => $data['featured_image_path'],
            default => null,
        };

        return DB::transaction(function () use ($data, $slug, $featuredImage) {
            $product = Product::create([
                'product_category_id' => $data['product_category_id'] ?? null,
                'name' => $data['name'],
                'slug' => $slug,
                'short_description' => $data['short_description'] ?? null,
                'description' => $data['description'] ?? null,
                'material' => $data['material'] ?? null,
                'application' => $data['application'] ?? null,
                'manufacturing_process' => $data['manufacturing_process'] ?? null,
                'featured_image' => $featuredImage,
                'is_featured' => $data['is_featured'] ?? false,
                'status' => $data['status'],
                'published_at' => $data['published_at'] ?? null,
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ]);

            $this->seo->saveMetadata($product, $data['seo'] ?? [], $this->media, 'seo/products');

            $this->activityLog->record('product.created', $product, ['name' => $product->name]);

            return $product;
        });
    }
}
