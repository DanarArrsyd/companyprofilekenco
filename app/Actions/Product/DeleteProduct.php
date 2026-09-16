<?php

namespace App\Actions\Product;

use App\Models\Product;
use App\Services\ActivityLogService;

class DeleteProduct
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(Product $product): void
    {
        $this->activityLog->record('product.deleted', $product, ['name' => $product->name]);

        $product->delete();
    }
}
