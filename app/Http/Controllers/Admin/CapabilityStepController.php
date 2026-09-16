<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Capability\ReorderCapabilitySteps;
use App\Actions\Capability\SaveCapabilityStep;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Capability\ReorderCapabilityStepsRequest;
use App\Http\Requests\Admin\Capability\StoreCapabilityStepRequest;
use App\Models\Capability;
use App\Models\CapabilityStep;
use Illuminate\Http\RedirectResponse;

class CapabilityStepController extends Controller
{
    public function store(StoreCapabilityStepRequest $request, Capability $capability, SaveCapabilityStep $action): RedirectResponse
    {
        $action->handle($capability, $request->validated());

        return back()->with('success', 'Step added.');
    }

    public function update(StoreCapabilityStepRequest $request, Capability $capability, CapabilityStep $step, SaveCapabilityStep $action): RedirectResponse
    {
        $action->handle($capability, $request->validated(), $step);

        return back()->with('success', 'Step updated.');
    }

    public function destroy(Capability $capability, CapabilityStep $step): RedirectResponse
    {
        $step->delete();

        return back()->with('success', 'Step removed.');
    }

    public function reorder(ReorderCapabilityStepsRequest $request, Capability $capability, ReorderCapabilitySteps $action): RedirectResponse
    {
        $action->handle($capability, $request->validated('ordered_ids'));

        return back()->with('success', 'Step order updated.');
    }
}
