<?php

namespace App\Actions\Product;

use App\Enums\ContentStatus;
use App\Models\Product;
use App\Services\ActivityLogService;
use Illuminate\Support\Facades\Auth;

class ArchiveProduct
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(Product $product): Product
    {
        $product->update([
            'status' => ContentStatus::Archived,
            'updated_by' => Auth::id(),
        ]);

        $this->activityLog->record('product.archived', $product, ['name' => $product->name]);

        return $product->fresh();
    }
}
