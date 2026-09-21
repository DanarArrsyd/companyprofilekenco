<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Facility\StoreFacilityRequest;
use App\Http\Requests\Admin\Facility\UpdateFacilityRequest;
use App\Models\Facility;
use App\Models\FacilityCategory;
use App\Services\ActivityLogService;
use App\Services\MediaLifecycleService;
use App\Services\MediaUploadService;
use App\Support\SlugGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class FacilityController extends Controller
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
        private readonly MediaUploadService $media,
        private readonly MediaLifecycleService $mediaLifecycle,
    ) {}

    public function index(Request $request): Response
    {
        $facilities = Facility::query()
            ->with('category:id,name')
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', "%{$request->string('search')}%"))
            ->when($request->filled('category'), fn ($q) => $q->where('facility_category_id', $request->integer('category')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->orderBy('sort_order')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/facilities/Index', [
            'facilities' => $facilities,
            'filters' => $request->only(['search', 'category', 'status']),
            'categories' => FacilityCategory::orderBy('name')->get(['id', 'name']),
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/facilities/Create', [
            'categories' => FacilityCategory::active()->orderBy('name')->get(['id', 'name']),
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function store(StoreFacilityRequest $request): RedirectResponse
    {
        $data = $request->safe()->except(['image', 'image_path']);
        $data['slug'] = trim($data['slug'] ?? '') !== '' ? $data['slug'] : SlugGenerator::unique('facilities', $data['name']);

        if ($request->hasFile('image')) {
            $data['image'] = $this->media->storePublicImage($request->file('image'), 'facilities');
        } elseif ($request->filled('image_path')) {
            $data['image'] = $request->validated('image_path');
        }

        $data['created_by'] = Auth::id();
        $data['updated_by'] = Auth::id();

        $facility = Facility::create($data);

        $this->activityLog->record('facility.created', $facility, ['name' => $facility->name]);

        return redirect()->route('admin.facilities')->with('success', 'Facility created.');
    }

    public function edit(Facility $facility): Response
    {
        return Inertia::render('admin/facilities/Edit', [
            'facility' => $facility,
            'categories' => FacilityCategory::active()->orderBy('name')->get(['id', 'name']),
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function update(UpdateFacilityRequest $request, Facility $facility): RedirectResponse
    {
        $data = $request->safe()->except(['image', 'image_path']);
        $nextImage = $facility->image;

        if ($request->hasFile('image')) {
            $nextImage = $this->media->storePublicImage($request->file('image'), 'facilities');
        } elseif ($request->exists('image_path')) {
            $nextImage = $request->validated('image_path');
        }

        if ($nextImage !== $facility->image) {
            $this->mediaLifecycle->deleteIfUnmanaged($facility->image);
            $data['image'] = $nextImage;
        }

        $data['updated_by'] = Auth::id();

        $facility->update($data);

        $this->activityLog->record('facility.updated', $facility, ['name' => $facility->name]);

        return back()->with('success', 'Facility updated.');
    }

    public function destroy(Facility $facility): RedirectResponse
    {
        $facility->delete();

        return redirect()->route('admin.facilities')->with('success', 'Facility deleted.');
    }
}
