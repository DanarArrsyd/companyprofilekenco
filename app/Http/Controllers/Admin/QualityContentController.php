<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\QualityContent\StoreQualityContentRequest;
use App\Http\Requests\Admin\QualityContent\UpdateQualityContentRequest;
use App\Models\QualityContent;
use App\Services\MediaLifecycleService;
use App\Services\MediaUploadService;
use App\Support\SlugGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QualityContentController extends Controller
{
    public function __construct(
        private readonly MediaUploadService $media,
        private readonly MediaLifecycleService $mediaLifecycle,
    ) {}

    public function index(Request $request): Response
    {
        $items = QualityContent::query()
            ->when($request->filled('search'), fn ($q) => $q->where('title', 'like', "%{$request->string('search')}%"))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->orderBy('sort_order')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/quality-content/Index', [
            'items' => $items,
            'filters' => $request->only(['search', 'status']),
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/quality-content/Create', [
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function store(StoreQualityContentRequest $request): RedirectResponse
    {
        $data = $request->safe()->except(['image', 'image_path']);
        $data['slug'] = trim($data['slug'] ?? '') !== '' ? $data['slug'] : SlugGenerator::unique('quality_contents', $data['title']);

        if ($request->hasFile('image')) {
            $data['image'] = $this->media->storePublicImage($request->file('image'), 'quality');
        } elseif ($request->filled('image_path')) {
            $data['image'] = $request->validated('image_path');
        }

        QualityContent::create($data);

        return redirect()->route('admin.quality-content')->with('success', 'Quality content created.');
    }

    public function edit(QualityContent $qualityContent): Response
    {
        return Inertia::render('admin/quality-content/Edit', [
            'item' => $qualityContent,
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function update(UpdateQualityContentRequest $request, QualityContent $qualityContent): RedirectResponse
    {
        $data = $request->safe()->except(['image', 'image_path']);
        $nextImage = $qualityContent->image;

        if ($request->hasFile('image')) {
            $nextImage = $this->media->storePublicImage($request->file('image'), 'quality');
        } elseif ($request->exists('image_path')) {
            $nextImage = $request->validated('image_path');
        }

        if ($nextImage !== $qualityContent->image) {
            $this->mediaLifecycle->deleteIfUnmanaged($qualityContent->image);
            $data['image'] = $nextImage;
        }

        $qualityContent->update($data);

        return back()->with('success', 'Quality content updated.');
    }

    public function destroy(QualityContent $qualityContent): RedirectResponse
    {
        $qualityContent->delete();

        return redirect()->route('admin.quality-content')->with('success', 'Quality content deleted.');
    }
}
