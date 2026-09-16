<?php

namespace App\Http\Controllers\Public;

use App\Actions\ContactInquiry\SubmitContactInquiry;
use App\Http\Controllers\Controller;
use App\Http\Requests\Public\SubmitContactInquiryRequest;
use App\Services\SeoService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function __construct(
        private readonly SeoService $seo,
    ) {}

    public function show(): Response
    {
        return Inertia::render('public/contact/Index', [
            'seo' => $this->seo->resolveStatic('Contact', 'Get in touch with our team.'),
        ]);
    }

    public function store(SubmitContactInquiryRequest $request, SubmitContactInquiry $action): RedirectResponse
    {
        $action->handle([
            ...$request->validated(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Your message has been sent. We will get back to you soon.');
    }
}
