<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Industry\StoreIndustryRequest;
use App\Http\Requests\Admin\Industry\UpdateIndustryRequest;
use App\Models\Industry;
use App\Services\ActivityLogService;
use App\Services\MediaUploadService;
use App\Support\SlugGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IndustryController extends Controller
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
        private readonly MediaUploadService $media,
    ) {}

    public function index(Request $request): Response
    {
        $industries = Industry::query()
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', "%{$request->string('search')}%"))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->orderBy('sort_order')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/industries/Index', [
            'industries' => $industries,
            'filters' => $request->only(['search', 'status']),
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/industries/Create', [
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function store(StoreIndustryRequest $request): RedirectResponse
    {
        $data = $request->safe()->except('image');
        $data['slug'] = trim($data['slug'] ?? '') !== '' ? $data['slug'] : SlugGenerator::unique('industries', $data['name']);

        if ($request->hasFile('image')) {
            $data['image'] = $this->media->storePublicImage($request->file('image'), 'industries');
        }

        $industry = Industry::create($data);

        $this->activityLog->record('industry.created', $industry, ['name' => $industry->name]);

        return redirect()->route('admin.industries')->with('success', 'Industry created.');
    }

    public function edit(Industry $industry): Response
    {
        return Inertia::render('admin/industries/Edit', [
            'industry' => $industry,
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function update(UpdateIndustryRequest $request, Industry $industry): RedirectResponse
    {
        $data = $request->safe()->except('image');

        if ($request->hasFile('image')) {
            $this->media->deletePublic($industry->image);
            $data['image'] = $this->media->storePublicImage($request->file('image'), 'industries');
        }

        $industry->update($data);

        $this->activityLog->record('industry.updated', $industry, ['name' => $industry->name]);

        return back()->with('success', 'Industry updated.');
    }

    public function destroy(Industry $industry): RedirectResponse
    {
        $industry->delete();

        return redirect()->route('admin.industries')->with('success', 'Industry deleted.');
    }
}
