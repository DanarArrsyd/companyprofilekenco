<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Certification;
use App\Services\SeoService;
use Inertia\Inertia;
use Inertia\Response;

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
            ->get(['id', 'name', 'issuer', 'certificate_number', 'issued_at', 'expires_at', 'media_id'])
            ->map(fn (Certification $cert) => [
                'id' => $cert->id,
                'name' => $cert->name,
                'issuer' => $cert->issuer,
                'certificate_number' => $cert->certificate_number,
                'issued_at' => $cert->issued_at,
                'expires_at' => $cert->expires_at,
                'is_expired' => $cert->isExpired(),
                'image' => $cert->media?->path,
            ]);

        return Inertia::render('public/certifications/Index', [
            'certifications' => $certifications,
            'seo' => $this->seo->resolveStatic('Certifications', 'Our quality certifications and accreditations.'),
        ]);
    }
}
