<?php

namespace App\Actions\Product;

use App\Models\Product;
use App\Services\ActivityLogService;

class RestoreProduct
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(Product $product): Product
    {
        $product->restore();

        $this->activityLog->record('product.updated', $product, ['name' => $product->name, 'restored' => true]);

        return $product;
    }
}
