<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $logs = ActivityLog::query()
            ->with(['user:id,name', 'subject'])
            ->when($request->filled('user'), fn ($q) => $q->where('user_id', $request->integer('user')))
            ->when($request->filled('module'), fn ($q) => $q->where('action', 'like', "{$request->string('module')}.%"))
            ->when($request->filled('search'), fn ($q) => $q->where('action', 'like', "%{$request->string('search')}%"))
            ->when($request->filled('from'), fn ($q) => $q->whereDate('created_at', '>=', $request->string('from')))
            ->when($request->filled('to'), fn ($q) => $q->whereDate('created_at', '<=', $request->string('to')))
            ->latest('created_at')
            ->paginate(25)
            ->withQueryString();

        $logs->getCollection()->transform(fn (ActivityLog $log) => [
            'id' => $log->id,
            'action' => $log->action,
            'module' => explode('.', $log->action)[0],
            'user' => $log->user?->name,
            'subject_type' => $log->subject_type ? class_basename($log->subject_type) : null,
            'subject_label' => $this->subjectLabel($log),
            'ip_address' => $log->ip_address,
            'created_at' => $log->created_at,
            'old_values' => $log->properties['old'] ?? null,
            'new_values' => $log->properties['new'] ?? null,
            'properties' => collect($log->properties ?? [])->except(['old', 'new'])->all(),
        ]);

        return Inertia::render('admin/activity-logs/Index', [
            'logs' => $logs,
            'filters' => $request->only(['user', 'module', 'search', 'from', 'to']),
            'users' => User::orderBy('name')->get(['id', 'name']),
            'modules' => ActivityLog::query()->pluck('action')
                ->map(fn ($action) => explode('.', $action)[0])
                ->unique()
                ->sort()
                ->values(),
        ]);
    }

    private function subjectLabel(ActivityLog $log): ?string
    {
        $subject = $log->subject;

        if (! $subject) {
            return null;
        }

        return $subject->name ?? $subject->title ?? $subject->email ?? "#{$subject->getKey()}";
    }
}
