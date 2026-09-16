<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\NewsCategory\StoreNewsCategoryRequest;
use App\Http\Requests\Admin\NewsCategory\UpdateNewsCategoryRequest;
use App\Models\NewsCategory;
use App\Support\SlugGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NewsCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $categories = NewsCategory::query()
            ->withCount('articles')
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', "%{$request->string('search')}%"))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/news-categories/Index', [
            'categories' => $categories,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/news-categories/Create');
    }

    public function store(StoreNewsCategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();

        NewsCategory::create([
            'name' => $data['name'],
            'slug' => trim($data['slug'] ?? '') !== '' ? $data['slug'] : SlugGenerator::unique('news_categories', $data['name']),
            'description' => $data['description'] ?? null,
        ]);

        return redirect()->route('admin.news.categories')->with('success', 'News category created.');
    }

    public function edit(NewsCategory $newsCategory): Response
    {
        return Inertia::render('admin/news-categories/Edit', [
            'category' => $newsCategory,
        ]);
    }

    public function update(UpdateNewsCategoryRequest $request, NewsCategory $newsCategory): RedirectResponse
    {
        $newsCategory->update($request->validated());

        return back()->with('success', 'News category updated.');
    }

    public function destroy(NewsCategory $newsCategory): RedirectResponse
    {
        if ($newsCategory->articles()->exists()) {
            return back()->with('error', 'Cannot delete a category that still has articles.');
        }

        $newsCategory->delete();

        return redirect()->route('admin.news.categories')->with('success', 'News category deleted.');
    }
}
