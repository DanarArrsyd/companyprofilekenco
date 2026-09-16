<?php

namespace App\Http\Controllers\Admin;

use App\Actions\JobApplication\UpdateApplicationStatus;
use App\Enums\ApplicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\JobApplication\UpdateApplicationStatusRequest;
use App\Models\JobApplication;
use App\Models\JobVacancy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

class JobApplicationController extends Controller
{
    public function index(Request $request): Response
    {
        $applications = JobApplication::query()
            ->with('jobVacancy:id,title')
            ->when($request->filled('search'), fn ($q) => $q->where('applicant_name', 'like', "%{$request->string('search')}%"))
            ->when($request->filled('vacancy'), fn ($q) => $q->where('job_vacancy_id', $request->integer('vacancy')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('date'), fn ($q) => $q->whereDate('created_at', $request->string('date')))
            ->latest('created_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/careers/applications/Index', [
            'applications' => $applications,
            'filters' => $request->only(['search', 'vacancy', 'status', 'date']),
            'vacancies' => JobVacancy::orderBy('title')->get(['id', 'title']),
            'statusOptions' => array_map(fn ($c) => $c->value, ApplicationStatus::cases()),
        ]);
    }

    public function show(JobApplication $application): Response
    {
        $application->load('jobVacancy:id,title');

        return Inertia::render('admin/careers/applications/Show', [
            'application' => $application,
            'statusOptions' => array_map(fn ($c) => $c->value, ApplicationStatus::cases()),
        ]);
    }

    public function updateStatus(UpdateApplicationStatusRequest $request, JobApplication $application, UpdateApplicationStatus $action): RedirectResponse
    {
        $action->handle($application, $request->validated());

        return back()->with('success', 'Application status updated.');
    }

    public function downloadCv(JobApplication $application): StreamedResponse
    {
        abort_unless(Storage::disk('local')->exists($application->cv_path), 404);

        return Storage::disk('local')->download($application->cv_path, "{$application->applicant_name}-cv.".pathinfo($application->cv_path, PATHINFO_EXTENSION));
    }
}
