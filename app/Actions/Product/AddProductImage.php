<?php

namespace App\Actions\Product;

use App\Models\Product;
use App\Models\ProductImage;
use App\Services\MediaUploadService;
use Illuminate\Http\UploadedFile;

class AddProductImage
{
    public function __construct(
        private readonly MediaUploadService $media,
    ) {}

    public function handle(Product $product, UploadedFile $file, ?string $altText = null): ProductImage
    {
        $path = $this->media->storePublicImage($file, 'products/gallery');

        $nextOrder = ($product->images()->max('order') ?? -1) + 1;

        return $product->images()->create([
            'path' => $path,
            'alt_text' => $altText,
            'order' => $nextOrder,
            'is_primary' => $product->images()->count() === 0,
        ]);
    }
}
