<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Page\ArchivePage;
use App\Actions\Page\CreatePage;
use App\Actions\Page\DeletePage;
use App\Actions\Page\PublishPage;
use App\Actions\Page\RestorePage;
use App\Actions\Page\UpdatePage;
use App\Enums\ContentStatus;
use App\Enums\SectionType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Page\StorePageRequest;
use App\Http\Requests\Admin\Page\UpdatePageRequest;
use App\Models\Page;
use App\Services\SeoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function index(Request $request): Response
    {
        $trashed = $request->boolean('trashed');

        $pages = Page::query()
            ->standard()
            ->when($trashed, fn ($query) => $query->onlyTrashed())
            ->when($request->filled('search'), fn ($query) => $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->string('search')}%")
                    ->orWhere('slug', 'like', "%{$request->string('search')}%");
            }))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->latest('updated_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/pages/Index', [
            'pages' => $pages,
            'filters' => $request->only(['search', 'status', 'trashed']),
            'statusOptions' => array_map(fn ($case) => $case->value, ContentStatus::cases()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/pages/Create', [
            'statusOptions' => array_map(fn ($case) => $case->value, ContentStatus::cases()),
        ]);
    }

    public function store(StorePageRequest $request, CreatePage $action): RedirectResponse
    {
        $page = $action->handle($request->validated());

        return redirect()->route('admin.pages.edit', $page)->with('success', 'Page created.');
    }

    public function edit(Page $page): Response
    {
        $page->load(['sections' => fn ($query) => $query->orderBy('sort_order'), 'seoMetadata']);

        return Inertia::render('admin/pages/Edit', [
            'page' => $page,
            'statusOptions' => array_map(fn ($case) => $case->value, ContentStatus::cases()),
            'sectionTypeOptions' => array_map(
                fn ($case) => ['value' => $case->value, 'label' => $case->label()],
                SectionType::forGenericPage(),
            ),
        ]);
    }

    public function update(UpdatePageRequest $request, Page $page, UpdatePage $action): RedirectResponse
    {
        $action->handle($page, $request->validated());

        return back()->with('success', 'Page updated.');
    }

    public function publish(Page $page, PublishPage $action): RedirectResponse
    {
        $action->handle($page);

        return back()->with('success', 'Page published.');
    }

    public function archive(Page $page, ArchivePage $action): RedirectResponse
    {
        $action->handle($page);

        return back()->with('success', 'Page archived.');
    }

    public function destroy(Page $page, DeletePage $action): RedirectResponse
    {
        $action->handle($page);

        return redirect()->route('admin.pages')->with('success', 'Page moved to trash.');
    }

    public function restore(int $page, RestorePage $action): RedirectResponse
    {
        $model = Page::onlyTrashed()->findOrFail($page);

        $action->handle($model);

        return back()->with('success', 'Page restored.');
    }

    public function preview(Page $page): Response
    {
        $page->load(['sections' => fn ($query) => $query->active()->orderBy('sort_order'), 'seoMetadata']);

        return Inertia::render('public/Page', [
            'page' => $page,
            'seo' => app(SeoService::class)->preview($page->title),
            'preview' => true,
        ]);
    }
}
