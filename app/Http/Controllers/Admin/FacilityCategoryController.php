<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\FacilityCategory\StoreFacilityCategoryRequest;
use App\Http\Requests\Admin\FacilityCategory\UpdateFacilityCategoryRequest;
use App\Models\FacilityCategory;
use App\Support\SlugGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FacilityCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $categories = FacilityCategory::query()
            ->withCount('facilities')
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', "%{$request->string('search')}%"))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/facility-categories/Index', [
            'categories' => $categories,
            'filters' => $request->only(['search', 'status']),
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/facility-categories/Create', [
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function store(StoreFacilityCategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['slug'] = trim($data['slug'] ?? '') !== '' ? $data['slug'] : SlugGenerator::unique('facility_categories', $data['name']);

        FacilityCategory::create($data);

        return redirect()->route('admin.facilities.categories')->with('success', 'Category created.');
    }

    public function edit(FacilityCategory $category): Response
    {
        return Inertia::render('admin/facility-categories/Edit', [
            'category' => $category,
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function update(UpdateFacilityCategoryRequest $request, FacilityCategory $category): RedirectResponse
    {
        $category->update($request->validated());

        return back()->with('success', 'Category updated.');
    }

    public function destroy(FacilityCategory $category): RedirectResponse
    {
        $category->delete();

        return back()->with('success', 'Category deleted.');
    }
}
