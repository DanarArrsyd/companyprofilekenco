<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Machine\StoreMachineRequest;
use App\Http\Requests\Admin\Machine\UpdateMachineRequest;
use App\Models\Capability;
use App\Models\Facility;
use App\Models\Machine;
use App\Services\ActivityLogService;
use App\Services\MediaUploadService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MachineController extends Controller
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
        private readonly MediaUploadService $media,
    ) {}

    public function index(Request $request): Response
    {
        $machines = Machine::query()
            ->with('facility:id,name')
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', "%{$request->string('search')}%"))
            ->when($request->filled('facility'), fn ($q) => $q->where('facility_id', $request->integer('facility')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->orderBy('sort_order')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/machines/Index', [
            'machines' => $machines,
            'filters' => $request->only(['search', 'facility', 'status']),
            'facilities' => Facility::orderBy('name')->get(['id', 'name']),
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/machines/Create', [
            'facilities' => Facility::active()->orderBy('name')->get(['id', 'name']),
            'capabilities' => Capability::active()->orderBy('name')->get(['id', 'name']),
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function store(StoreMachineRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $this->media->storePublicImage($request->file('image'), 'machines');
        }

        $capabilityIds = $data['capability_ids'] ?? [];
        unset($data['capability_ids']);

        $machine = Machine::create($data);
        $machine->syncCapabilities($capabilityIds);

        $this->activityLog->record('machine.created', $machine, ['name' => $machine->name]);

        return redirect()->route('admin.machines')->with('success', 'Machine created.');
    }

    public function edit(Machine $machine): Response
    {
        $machine->load('capabilities:id,name');

        return Inertia::render('admin/machines/Edit', [
            'machine' => $machine,
            'facilities' => Facility::active()->orderBy('name')->get(['id', 'name']),
            'capabilities' => Capability::active()->orderBy('name')->get(['id', 'name']),
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function update(UpdateMachineRequest $request, Machine $machine): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $this->media->deletePublic($machine->image);
            $data['image'] = $this->media->storePublicImage($request->file('image'), 'machines');
        }

        $capabilityIds = $data['capability_ids'] ?? [];
        unset($data['capability_ids']);

        $machine->update($data);
        $machine->syncCapabilities($capabilityIds);

        $this->activityLog->record('machine.updated', $machine, ['name' => $machine->name]);

        return back()->with('success', 'Machine updated.');
    }

    public function destroy(Machine $machine): RedirectResponse
    {
        $machine->delete();

        return redirect()->route('admin.machines')->with('success', 'Machine deleted.');
    }
}
