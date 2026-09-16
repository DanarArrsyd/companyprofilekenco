<?php

namespace App\Http\Controllers\Admin;

use App\Actions\JobVacancy\ArchiveJobVacancy;
use App\Actions\JobVacancy\CreateJobVacancy;
use App\Actions\JobVacancy\DeleteJobVacancy;
use App\Actions\JobVacancy\PublishJobVacancy;
use App\Actions\JobVacancy\RestoreJobVacancy;
use App\Actions\JobVacancy\UpdateJobVacancy;
use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\JobVacancy\StoreJobVacancyRequest;
use App\Http\Requests\Admin\JobVacancy\UpdateJobVacancyRequest;
use App\Models\JobVacancy;
use App\Services\SeoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobVacancyController extends Controller
{
    public function index(Request $request): Response
    {
        $trashed = $request->boolean('trashed');

        $vacancies = JobVacancy::query()
            ->when($trashed, fn ($q) => $q->onlyTrashed())
            ->when($request->filled('search'), fn ($q) => $q->where('title', 'like', "%{$request->string('search')}%"))
            ->when($request->filled('department'), fn ($q) => $q->where('department', $request->string('department')))
            ->when($request->filled('employment_type'), fn ($q) => $q->where('employment_type', $request->string('employment_type')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->latest('updated_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/careers/Index', [
            'vacancies' => $vacancies,
            'filters' => $request->only(['search', 'department', 'employment_type', 'status', 'trashed']),
            'departments' => JobVacancy::query()->whereNotNull('department')->distinct()->orderBy('department')->pluck('department'),
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/careers/Create', [
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function store(StoreJobVacancyRequest $request, CreateJobVacancy $action): RedirectResponse
    {
        $vacancy = $action->handle($request->validated());

        return redirect()->route('admin.careers.edit', $vacancy)->with('success', 'Job vacancy created.');
    }

    public function edit(JobVacancy $vacancy): Response
    {
        $vacancy->load('seoMetadata');

        return Inertia::render('admin/careers/Edit', [
            'vacancy' => $vacancy,
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function update(UpdateJobVacancyRequest $request, JobVacancy $vacancy, UpdateJobVacancy $action): RedirectResponse
    {
        $action->handle($vacancy, $request->validated());

        return back()->with('success', 'Job vacancy updated.');
    }

    public function publish(JobVacancy $vacancy, PublishJobVacancy $action): RedirectResponse
    {
        $action->handle($vacancy);

        return back()->with('success', 'Job vacancy published.');
    }

    public function archive(JobVacancy $vacancy, ArchiveJobVacancy $action): RedirectResponse
    {
        $action->handle($vacancy);

        return back()->with('success', 'Job vacancy archived.');
    }

    public function destroy(JobVacancy $vacancy, DeleteJobVacancy $action): RedirectResponse
    {
        $action->handle($vacancy);

        return redirect()->route('admin.careers')->with('success', 'Job vacancy moved to trash.');
    }

    public function restore(int $vacancy, RestoreJobVacancy $action): RedirectResponse
    {
        $action->handle(JobVacancy::onlyTrashed()->findOrFail($vacancy));

        return back()->with('success', 'Job vacancy restored.');
    }

    public function preview(JobVacancy $vacancy, SeoService $seo): Response
    {
        return Inertia::render('public/careers/Show', [
            'vacancy' => $vacancy,
            'seo' => $seo->preview($vacancy->title),
            'breadcrumb' => [['label' => 'Careers', 'href' => '/careers'], ['label' => $vacancy->title]],
            'preview' => true,
        ]);
    }
}
