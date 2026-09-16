<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Settings\UpdateSettingsRequest;
use App\Services\ActivityLogService;
use App\Services\MediaUploadService;
use App\Services\SettingsService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    private const IMAGE_KEYS = ['logo', 'favicon', 'seo_default_og_image'];

    public function __construct(
        private readonly SettingsService $settings,
        private readonly MediaUploadService $uploader,
        private readonly ActivityLogService $activityLog,
    ) {}

    public function edit(): Response
    {
        return Inertia::render('admin/settings/Edit', [
            'settings' => $this->settings->all(),
        ]);
    }

    public function update(UpdateSettingsRequest $request): RedirectResponse
    {
        $before = $this->settings->all();
        $data = $request->safe()->except(self::IMAGE_KEYS);

        foreach (self::IMAGE_KEYS as $key) {
            if ($request->hasFile($key)) {
                if (! empty($before[$key])) {
                    $this->uploader->deletePublic($before[$key]);
                }
                $data[$key] = $this->uploader->storePublicImage($request->file($key), 'settings');
            }
        }

        $data['maintenance_mode'] = $request->boolean('maintenance_mode');

        $this->settings->setMany($data);

        $this->activityLog->record('settings.updated', null, [
            'old' => $before,
            'new' => $this->settings->all(),
        ]);

        return back()->with('success', 'Settings updated.');
    }
}
