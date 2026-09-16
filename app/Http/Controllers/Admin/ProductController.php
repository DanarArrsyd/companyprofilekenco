<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Product\ArchiveProduct;
use App\Actions\Product\CreateProduct;
use App\Actions\Product\DeleteProduct;
use App\Actions\Product\PublishProduct;
use App\Actions\Product\RestoreProduct;
use App\Actions\Product\UpdateProduct;
use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Product\StoreProductRequest;
use App\Http\Requests\Admin\Product\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Services\SeoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $trashed = $request->boolean('trashed');

        $products = Product::query()
            ->with('category:id,name')
            ->when($trashed, fn ($q) => $q->onlyTrashed())
            ->when($request->filled('search'), fn ($q) => $q->where(function ($sub) use ($request) {
                $sub->where('name', 'like', "%{$request->string('search')}%")
                    ->orWhere('slug', 'like', "%{$request->string('search')}%");
            }))
            ->when($request->filled('category'), fn ($q) => $q->where('product_category_id', $request->integer('category')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->boolean('featured'), fn ($q) => $q->where('is_featured', true))
            ->latest('updated_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/products/Index', [
            'products' => $products,
            'filters' => $request->only(['search', 'category', 'status', 'featured', 'trashed']),
            'categories' => ProductCategory::orderBy('name')->get(['id', 'name']),
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/products/Create', [
            'categories' => ProductCategory::active()->orderBy('name')->get(['id', 'name']),
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function store(StoreProductRequest $request, CreateProduct $action): RedirectResponse
    {
        $product = $action->handle($request->validated());

        return redirect()->route('admin.products.edit', $product)->with('success', 'Product created.');
    }

    public function edit(Product $product): Response
    {
        $product->load(['images', 'seoMetadata', 'category:id,name']);

        return Inertia::render('admin/products/Edit', [
            'product' => $product,
            'categories' => ProductCategory::active()->orderBy('name')->get(['id', 'name']),
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product, UpdateProduct $action): RedirectResponse
    {
        $action->handle($product, $request->validated());

        return back()->with('success', 'Product updated.');
    }

    public function publish(Product $product, PublishProduct $action): RedirectResponse
    {
        $action->handle($product);

        return back()->with('success', 'Product published.');
    }

    public function archive(Product $product, ArchiveProduct $action): RedirectResponse
    {
        $action->handle($product);

        return back()->with('success', 'Product archived.');
    }

    public function destroy(Product $product, DeleteProduct $action): RedirectResponse
    {
        $action->handle($product);

        return redirect()->route('admin.products')->with('success', 'Product moved to trash.');
    }

    public function restore(int $product, RestoreProduct $action): RedirectResponse
    {
        $action->handle(Product::onlyTrashed()->findOrFail($product));

        return back()->with('success', 'Product restored.');
    }

    public function preview(Product $product, SeoService $seo): Response
    {
        $product->load(['images', 'category:id,name,slug']);

        return Inertia::render('public/products/Show', [
            'product' => $product,
            'seo' => $seo->preview($product->name),
            'breadcrumb' => [
                ['label' => 'Products', 'href' => '/products'],
                ...($product->category ? [['label' => $product->category->name, 'href' => "/products?category={$product->category->slug}"]] : []),
                ['label' => $product->name],
            ],
            'preview' => true,
        ]);
    }
}
