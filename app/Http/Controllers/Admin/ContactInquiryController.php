<?php

namespace App\Http\Controllers\Admin;

use App\Actions\ContactInquiry\UpdateInquiryStatus;
use App\Enums\InquiryStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ContactInquiry\UpdateInquiryStatusRequest;
use App\Models\ContactInquiry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactInquiryController extends Controller
{
    public function index(Request $request): Response
    {
        $inquiries = ContactInquiry::query()
            ->when($request->filled('search'), fn ($q) => $q->where(function ($sub) use ($request) {
                $sub->where('name', 'like', "%{$request->string('search')}%")
                    ->orWhere('email', 'like', "%{$request->string('search')}%");
            }))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('date'), fn ($q) => $q->whereDate('created_at', $request->string('date')))
            ->latest('created_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/inquiries/Index', [
            'inquiries' => $inquiries,
            'filters' => $request->only(['search', 'status', 'date']),
            'statusOptions' => array_map(fn ($c) => $c->value, InquiryStatus::cases()),
        ]);
    }

    public function show(ContactInquiry $inquiry): Response
    {
        return Inertia::render('admin/inquiries/Show', [
            'inquiry' => $inquiry,
            'statusOptions' => array_map(fn ($c) => $c->value, InquiryStatus::cases()),
        ]);
    }

    public function updateStatus(UpdateInquiryStatusRequest $request, ContactInquiry $inquiry, UpdateInquiryStatus $action): RedirectResponse
    {
        $action->handle($inquiry, $request->validated()['status']);

        return back()->with('success', 'Inquiry status updated.');
    }
}
