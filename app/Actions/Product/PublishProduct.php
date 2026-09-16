<?php

namespace App\Actions\Product;

use App\Enums\ContentStatus;
use App\Models\Product;
use App\Services\ActivityLogService;
use Illuminate\Support\Facades\Auth;

class PublishProduct
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(Product $product): Product
    {
        $product->update([
            'status' => ContentStatus::Published,
            'published_at' => $product->published_at ?? now(),
            'updated_by' => Auth::id(),
        ]);

        $this->activityLog->record('product.published', $product, ['name' => $product->name]);

        return $product->fresh();
    }
}
