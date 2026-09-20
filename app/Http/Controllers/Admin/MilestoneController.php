<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Milestone\StoreMilestoneRequest;
use App\Http\Requests\Admin\Milestone\UpdateMilestoneRequest;
use App\Models\Milestone;
use App\Services\ActivityLogService;
use App\Services\MediaLifecycleService;
use App\Services\MediaUploadService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MilestoneController extends Controller
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
        private readonly MediaUploadService $media,
        private readonly MediaLifecycleService $mediaLifecycle,
    ) {}

    public function index(Request $request): Response
    {
        $milestones = Milestone::query()
            ->when($request->filled('search'), fn ($q) => $q->where('title', 'like', "%{$request->string('search')}%"))
            ->orderBy('year')
            ->orderBy('order')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/milestones/Index', [
            'milestones' => $milestones,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/milestones/Create');
    }

    public function store(StoreMilestoneRequest $request): RedirectResponse
    {
        $data = $request->safe()->except(['image', 'image_path']);

        $image = match (true) {
            $request->hasFile('image') => $this->media->storePublicImage($request->file('image'), 'milestones'),
            ! empty($request->validated('image_path')) => $request->validated('image_path'),
            default => null,
        };

        $milestone = Milestone::create([...$data, 'image' => $image]);

        $this->activityLog->record('milestone.created', $milestone, ['title' => $milestone->title, 'year' => $milestone->year]);

        return redirect()->route('admin.milestones')->with('success', 'Milestone created.');
    }

    public function edit(Milestone $milestone): Response
    {
        return Inertia::render('admin/milestones/Edit', [
            'milestone' => $milestone,
        ]);
    }

    public function update(UpdateMilestoneRequest $request, Milestone $milestone): RedirectResponse
    {
        $data = $request->safe()->except(['image', 'image_path', 'remove_image']);

        $image = $milestone->image;

        if ($request->hasFile('image')) {
            $this->mediaLifecycle->deleteIfUnmanaged($milestone->image);
            $image = $this->media->storePublicImage($request->file('image'), 'milestones');
        } elseif (! empty($request->validated('image_path'))) {
            if ($request->validated('image_path') !== $milestone->image) {
                $this->mediaLifecycle->deleteIfUnmanaged($milestone->image);
            }
            $image = $request->validated('image_path');
        } elseif ($request->boolean('remove_image')) {
            $this->mediaLifecycle->deleteIfUnmanaged($milestone->image);
            $image = null;
        }

        $milestone->update([...$data, 'image' => $image]);

        $this->activityLog->record('milestone.updated', $milestone, ['title' => $milestone->title, 'year' => $milestone->year]);

        return back()->with('success', 'Milestone updated.');
    }

    public function destroy(Milestone $milestone): RedirectResponse
    {
        $this->activityLog->record('milestone.updated', $milestone, ['title' => $milestone->title, 'deleted' => true]);
        $milestone->delete();

        return redirect()->route('admin.milestones')->with('success', 'Milestone deleted.');
    }
}
