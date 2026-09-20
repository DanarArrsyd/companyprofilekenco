<?php

namespace App\Actions\Product;

use App\Models\Product;
use App\Services\ActivityLogService;
use App\Services\MediaLifecycleService;
use App\Services\MediaUploadService;
use App\Services\SeoService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UpdateProduct
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
        private readonly MediaUploadService $media,
        private readonly MediaLifecycleService $mediaLifecycle,
        private readonly SeoService $seo,
    ) {}

    public function handle(Product $product, array $data): Product
    {
        $featuredImage = $product->featured_image;

        if (isset($data['featured_image']) && $data['featured_image'] !== null) {
            $this->mediaLifecycle->deleteIfUnmanaged($product->featured_image);
            $featuredImage = $this->media->storePublicImage($data['featured_image'], 'products');
        } elseif (! empty($data['featured_image_path'])) {
            if ($data['featured_image_path'] !== $product->featured_image) {
                $this->mediaLifecycle->deleteIfUnmanaged($product->featured_image);
            }
            $featuredImage = $data['featured_image_path'];
        }

        return DB::transaction(function () use ($product, $data, $featuredImage) {
            $product->update([
                'product_category_id' => $data['product_category_id'] ?? null,
                'name' => $data['name'],
                // Slug is intentionally left untouched — see Page CMS pattern.
                'short_description' => $data['short_description'] ?? null,
                'description' => $data['description'] ?? null,
                'material' => $data['material'] ?? null,
                'application' => $data['application'] ?? null,
                'manufacturing_process' => $data['manufacturing_process'] ?? null,
                'featured_image' => $featuredImage,
                'is_featured' => $data['is_featured'] ?? false,
                'status' => $data['status'],
                'published_at' => $data['published_at'] ?? null,
                'updated_by' => Auth::id(),
            ]);

            $this->seo->saveMetadata($product, $data['seo'] ?? [], $this->media, 'seo/products');

            $this->activityLog->record('product.updated', $product, ['name' => $product->name]);

            return $product->fresh();
        });
    }
}
