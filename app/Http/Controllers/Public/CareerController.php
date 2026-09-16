<?php

namespace App\Http\Controllers\Public;

use App\Actions\JobApplication\SubmitJobApplication;
use App\Http\Controllers\Controller;
use App\Http\Requests\Public\SubmitJobApplicationRequest;
use App\Models\JobVacancy;
use App\Services\SeoService;
use App\Services\StructuredDataService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CareerController extends Controller
{
    public function __construct(
        private readonly SeoService $seo,
        private readonly StructuredDataService $structuredData,
    ) {}

    public function index(Request $request): Response
    {
        $vacancies = JobVacancy::query()
            ->published()
            ->when($request->filled('department'), fn ($q) => $q->where('department', $request->string('department')))
            ->when($request->filled('employment_type'), fn ($q) => $q->where('employment_type', $request->string('employment_type')))
            ->orderByDesc('published_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('public/careers/Index', [
            'vacancies' => $vacancies,
            'departments' => JobVacancy::published()->whereNotNull('department')->distinct()->orderBy('department')->pluck('department'),
            'filters' => $request->only(['department', 'employment_type']),
            'seo' => $this->seo->resolveStatic('Careers', 'Explore open positions and join our team.'),
        ]);
    }

    public function show(string $slug): Response
    {
        $vacancy = JobVacancy::query()
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();

        $breadcrumb = [
            ['label' => 'Careers', 'href' => '/careers'],
            ['label' => $vacancy->title],
        ];

        return Inertia::render('public/careers/Show', [
            'vacancy' => $vacancy,
            'seo' => $this->seo->resolve($vacancy, $vacancy->title),
            'breadcrumb' => $breadcrumb,
            'schema' => [
                $this->structuredData->breadcrumbList($breadcrumb),
                $this->structuredData->jobPosting($vacancy),
            ],
            'preview' => false,
        ]);
    }

    public function apply(SubmitJobApplicationRequest $request, string $slug, SubmitJobApplication $action): RedirectResponse
    {
        $vacancy = JobVacancy::query()->published()->where('slug', $slug)->firstOrFail();

        abort_unless($vacancy->isOpen(), 422, 'This vacancy is no longer accepting applications.');

        $action->handle($vacancy, [
            ...$request->validated(),
            'cv' => $request->file('cv'),
        ]);

        return back()->with('success', 'Your application has been submitted.');
    }
}
