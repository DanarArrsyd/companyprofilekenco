<?php

namespace App\Http\Controllers\Admin;

use App\Actions\PageSection\DeletePageSection;
use App\Actions\PageSection\ReorderPageSections;
use App\Actions\PageSection\SavePageSection;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PageSection\ReorderPageSectionsRequest;
use App\Http\Requests\Admin\PageSection\StorePageSectionRequest;
use App\Http\Requests\Admin\PageSection\UpdatePageSectionRequest;
use App\Models\Page;
use App\Models\PageSection;
use Illuminate\Http\RedirectResponse;

class PageSectionController extends Controller
{
    public function store(StorePageSectionRequest $request, Page $page, SavePageSection $action): RedirectResponse
    {
        $action->handle($page, $request->validated());

        return back()->with('success', 'Section added.');
    }

    public function update(UpdatePageSectionRequest $request, Page $page, PageSection $section, SavePageSection $action): RedirectResponse
    {
        $action->handle($page, $request->validated(), $section);

        return back()->with('success', 'Section updated.');
    }

    public function destroy(Page $page, PageSection $section, DeletePageSection $action): RedirectResponse
    {
        $action->handle($section);

        return back()->with('success', 'Section removed.');
    }

    public function reorder(ReorderPageSectionsRequest $request, Page $page, ReorderPageSections $action): RedirectResponse
    {
        $action->handle($page, $request->validated()['ordered_ids']);

        return back()->with('success', 'Section order updated.');
    }
}
