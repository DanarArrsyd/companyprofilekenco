<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Media\CreateMedia;
use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Certification\StoreCertificationRequest;
use App\Http\Requests\Admin\Certification\UpdateCertificationRequest;
use App\Models\Certification;
use App\Models\Media;
use App\Services\ActivityLogService;
use App\Services\MediaUploadService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CertificationController extends Controller
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
        private readonly MediaUploadService $media,
    ) {}

    public function index(Request $request): Response
    {
        $certifications = Certification::query()
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', "%{$request->string('search')}%"))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->orderBy('sort_order')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/certifications/Index', [
            'certifications' => $certifications,
            'filters' => $request->only(['search', 'status']),
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/certifications/Create', [
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function store(StoreCertificationRequest $request, CreateMedia $createMedia): RedirectResponse
    {
        $data = $request->safe()->except(['image', 'image_path', 'document']);

        if ($request->hasFile('image')) {
            $media = $createMedia->handle($request->file('image'));
            $data['media_id'] = $media->id;
        } elseif ($request->filled('image_path')) {
            $data['media_id'] = Media::where('path', $request->validated('image_path'))->value('id');
        }

        if ($request->hasFile('document')) {
            $data['document_path'] = $this->media->storePrivateDocument($request->file('document'), 'certifications/documents');
        }

        $certification = Certification::create($data);

        $this->activityLog->record('certification.created', $certification, ['name' => $certification->name]);

        return redirect()->route('admin.certifications')->with('success', 'Certification created.');
    }

    public function edit(Certification $certification): Response
    {
        $certification->load('media');

        return Inertia::render('admin/certifications/Edit', [
            'certification' => $certification,
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function update(
        UpdateCertificationRequest $request,
        Certification $certification,
        CreateMedia $createMedia,
    ): RedirectResponse {
        $data = $request->safe()->except(['image', 'image_path', 'document']);

        if ($request->hasFile('image')) {
            $media = $createMedia->handle($request->file('image'));
            $data['media_id'] = $media->id;
        } elseif ($request->exists('image_path')) {
            $data['media_id'] = $request->filled('image_path')
                ? Media::where('path', $request->validated('image_path'))->value('id')
                : null;
        }

        if ($request->hasFile('document')) {
            if ($certification->document_path) {
                $this->media->deletePrivate($certification->document_path);
            }
            $data['document_path'] = $this->media->storePrivateDocument($request->file('document'), 'certifications/documents');
        }

        $certification->update($data);

        $this->activityLog->record('certification.updated', $certification, ['name' => $certification->name]);

        return back()->with('success', 'Certification updated.');
    }

    public function destroy(Certification $certification): RedirectResponse
    {
        $certification->delete();

        return redirect()->route('admin.certifications')->with('success', 'Certification deleted.');
    }

    /**
     * Serve the private certification document to an authorized admin only.
     */
    public function downloadDocument(Certification $certification)
    {
        abort_unless($certification->document_path, 404);

        return Storage::disk('local')->download($certification->document_path);
    }
}
