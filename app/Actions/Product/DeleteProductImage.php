<?php

namespace App\Actions\Product;

use App\Models\ProductImage;
use App\Services\MediaLifecycleService;

class DeleteProductImage
{
    public function __construct(
        private readonly MediaLifecycleService $mediaLifecycle,
    ) {}

    public function handle(ProductImage $image): void
    {
        $this->mediaLifecycle->deleteIfUnmanaged($image->path);

        $image->delete();
    }
}
