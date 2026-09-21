<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Product\AddProductImage;
use App\Actions\Product\DeleteProductImage;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Product\StoreProductImageRequest;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\RedirectResponse;

class ProductImageController extends Controller
{
    public function store(StoreProductImageRequest $request, Product $product, AddProductImage $action): RedirectResponse
    {
        $action->handle(
            $product,
            $request->file('image'),
            $request->validated('media_path'),
            $request->validated('alt_text'),
        );

        return back()->with('success', 'Image added.');
    }

    public function destroy(Product $product, ProductImage $image, DeleteProductImage $action): RedirectResponse
    {
        $action->handle($image);

        return back()->with('success', 'Image removed.');
    }
}
