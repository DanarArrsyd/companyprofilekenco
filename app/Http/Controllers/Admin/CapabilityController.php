<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Capability\ArchiveCapability;
use App\Actions\Capability\CreateCapability;
use App\Actions\Capability\PublishCapability;
use App\Actions\Capability\UpdateCapability;
use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Capability\StoreCapabilityRequest;
use App\Http\Requests\Admin\Capability\SyncCapabilityMachinesRequest;
use App\Http\Requests\Admin\Capability\UpdateCapabilityRequest;
use App\Models\Capability;
use App\Models\Machine;
use App\Services\ActivityLogService;
use App\Services\SeoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CapabilityController extends Controller
{
    public function index(Request $request): Response
    {
        $trashed = $request->boolean('trashed');

        $capabilities = Capability::query()
            ->when($trashed, fn ($q) => $q->onlyTrashed())
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', "%{$request->string('search')}%"))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->boolean('featured'), fn ($q) => $q->where('is_featured', true))
            ->orderBy('sort_order')
            ->latest('updated_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/capabilities/Index', [
            'capabilities' => $capabilities,
            'filters' => $request->only(['search', 'status', 'featured', 'trashed']),
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/capabilities/Create', [
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function store(StoreCapabilityRequest $request, CreateCapability $action): RedirectResponse
    {
        $capability = $action->handle($request->validated());

        return redirect()->route('admin.capabilities.edit', $capability)->with('success', 'Capability created.');
    }

    public function edit(Capability $capability): Response
    {
        $capability->load(['steps', 'machines:id,name', 'seoMetadata']);

        return Inertia::render('admin/capabilities/Edit', [
            'capability' => $capability,
            'availableMachines' => Machine::active()->orderBy('name')->get(['id', 'name']),
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function update(UpdateCapabilityRequest $request, Capability $capability, UpdateCapability $action): RedirectResponse
    {
        $action->handle($capability, $request->validated());

        return back()->with('success', 'Capability updated.');
    }

    public function publish(Capability $capability, PublishCapability $action): RedirectResponse
    {
        $action->handle($capability);

        return back()->with('success', 'Capability published.');
    }

    public function archive(Capability $capability, ArchiveCapability $action): RedirectResponse
    {
        $action->handle($capability);

        return back()->with('success', 'Capability archived.');
    }

    public function destroy(Capability $capability, ActivityLogService $activityLog): RedirectResponse
    {
        $activityLog->record('capability.updated', $capability, ['name' => $capability->name, 'deleted' => true]);
        $capability->delete();

        return redirect()->route('admin.capabilities')->with('success', 'Capability moved to trash.');
    }

    public function restore(int $capability): RedirectResponse
    {
        Capability::onlyTrashed()->findOrFail($capability)->restore();

        return back()->with('success', 'Capability restored.');
    }

    public function syncMachines(SyncCapabilityMachinesRequest $request, Capability $capability): RedirectResponse
    {
        $capability->machines()->sync($request->validated('machine_ids', []));

        return back()->with('success', 'Machine assignments updated.');
    }

    public function preview(Capability $capability, SeoService $seo): Response
    {
        $capability->load(['steps', 'machines:id,name']);

        return Inertia::render('public/capabilities/Show', [
            'capability' => $capability,
            'seo' => $seo->preview($capability->name),
            'breadcrumb' => [['label' => 'Capabilities', 'href' => '/capabilities'], ['label' => $capability->name]],
            'preview' => true,
        ]);
    }
}
