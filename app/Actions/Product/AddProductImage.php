<?php

namespace App\Actions\Product;

use App\Models\Media;
use App\Models\Product;
use App\Models\ProductImage;
use App\Services\MediaUploadService;
use Illuminate\Http\UploadedFile;

class AddProductImage
{
    public function __construct(
        private readonly MediaUploadService $media,
    ) {}

    public function handle(
        Product $product,
        ?UploadedFile $file,
        ?string $mediaPath = null,
        ?string $altText = null,
    ): ProductImage {
        $path = $file
            ? $this->media->storePublicImage($file, 'products/gallery')
            : $mediaPath;

        throw_if(! $path, \InvalidArgumentException::class, 'An image file or Media Library path is required.');

        $nextOrder = ($product->images()->max('order') ?? -1) + 1;

        return $product->images()->create([
            'media_id' => $file ? null : Media::where('path', $path)->value('id'),
            'path' => $path,
            'alt_text' => $altText,
            'order' => $nextOrder,
            'is_primary' => $product->images()->count() === 0,
        ]);
    }
}
