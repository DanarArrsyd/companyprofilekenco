<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Services\SeoService;
use App\Services\StructuredDataService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        private readonly SeoService $seo,
        private readonly StructuredDataService $structuredData,
    ) {}

    public function index(Request $request): Response
    {
        $products = Product::query()
            ->published()
            ->with('category:id,name,slug')
            ->when($request->filled('category'), fn ($q) => $q->whereHas(
                'category',
                fn ($c) => $c->where('slug', $request->string('category')),
            ))
            ->orderByDesc('is_featured')
            ->latest('published_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('public/products/Index', [
            'products' => $products,
            'categories' => ProductCategory::active()->orderBy('name')->get(['id', 'name', 'slug']),
            'filters' => $request->only('category'),
            'seo' => $this->seo->resolveStatic(__('Products'), __('Explore our manufacturing product catalog.')),
        ]);
    }

    public function show(string $slug): Response
    {
        $product = Product::query()
            ->published()
            ->with(['category:id,name,slug', 'images'])
            ->where('slug', $slug)
            ->firstOrFail();

        $breadcrumb = [
            ['label' => __('Products'), 'href' => '/products'],
            ...($product->category ? [['label' => $product->category->name, 'href' => "/products?category={$product->category->slug}"]] : []),
            ['label' => $product->name],
        ];

        $seo = $this->seo->resolve($product, $product->name, $product->short_description, $product->featured_image);

        return Inertia::render('public/products/Show', [
            'product' => $product,
            'seo' => $seo,
            'breadcrumb' => $breadcrumb,
            'schema' => $this->structuredData->breadcrumbList($breadcrumb),
            'preview' => false,
        ]);
    }
}
