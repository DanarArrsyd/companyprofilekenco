<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Certification;
use App\Services\SeoService;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class CertificationController extends Controller
{
    public function __construct(
        private readonly SeoService $seo,
    ) {}

    public function index(): Response
    {
        $certifications = Certification::query()
            ->published()
            ->with('media:id,path')
            ->orderBy('sort_order')
            ->get(['id', 'name', 'issuer', 'certificate_number', 'issued_at', 'expires_at', 'media_id', 'document_path'])
            ->map(fn (Certification $cert) => [
                'id' => $cert->id,
                'name' => $cert->name,
                'issuer' => $cert->issuer,
                'certificate_number' => $cert->certificate_number,
                'issued_at' => $cert->issued_at,
                'expires_at' => $cert->expires_at,
                'is_expired' => $cert->isExpired(),
                'image' => $cert->media?->path,
                'has_document' => $cert->document_path !== null,
            ]);

        return Inertia::render('public/certifications/Index', [
            'certifications' => $certifications,
            'seo' => $this->seo->resolveStatic(__('Certifications'), __('Our quality certifications and accreditations.')),
        ]);
    }

    public function document(int $certification): BinaryFileResponse
    {
        $cert = Certification::query()->published()->findOrFail($certification);
        $path = $cert->document_path;

        abort_unless(
            $path && preg_match('#\Acertifications/documents/[A-Za-z0-9][A-Za-z0-9._-]*\.pdf\z#i', $path) === 1
                && Storage::disk('local')->exists($path),
            404,
        );

        return response()->file(Storage::disk('local')->path($path), [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="certification-'.$cert->id.'.pdf"',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, max-age=300',
        ]);
    }
}
