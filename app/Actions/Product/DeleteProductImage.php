<?php

namespace App\Actions\Product;

use App\Models\ProductImage;
use App\Services\MediaUploadService;

class DeleteProductImage
{
    public function __construct(
        private readonly MediaUploadService $media,
    ) {}

    public function handle(ProductImage $image): void
    {
        $this->media->deletePublic($image->path);

        $image->delete();
    }
}
