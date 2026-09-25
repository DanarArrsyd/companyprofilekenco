<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Settings\UpdateSettingsRequest;
use App\Services\ActivityLogService;
use App\Services\FaviconFileService;
use App\Services\MediaLifecycleService;
use App\Services\MediaUploadService;
use App\Services\SettingsService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    private const IMAGE_KEYS = ['logo', 'favicon', 'seo_default_og_image'];

    private const IMAGE_PATH_KEYS = [
        'logo' => 'logo_path',
        'seo_default_og_image' => 'seo_default_og_image_path',
    ];

    public function __construct(
        private readonly SettingsService $settings,
        private readonly MediaUploadService $uploader,
        private readonly MediaLifecycleService $mediaLifecycle,
        private readonly ActivityLogService $activityLog,
        private readonly FaviconFileService $favicons,
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
        $data = $request->safe()->except([
            ...self::IMAGE_KEYS,
            ...array_values(self::IMAGE_PATH_KEYS),
        ]);

        foreach (self::IMAGE_KEYS as $key) {
            $oldPath = $before[$key] ?? null;
            $nextPath = $oldPath;

            if ($request->hasFile($key)) {
                $nextPath = $key === 'favicon'
                    ? $this->uploader->storePublicImageAsIs($request->file($key), 'settings')
                    : $this->uploader->storePublicImage($request->file($key), 'settings');
            } elseif (isset(self::IMAGE_PATH_KEYS[$key]) && $request->exists(self::IMAGE_PATH_KEYS[$key])) {
                $nextPath = $request->validated(self::IMAGE_PATH_KEYS[$key]);
            }

            if ($nextPath !== $oldPath) {
                $this->mediaLifecycle->deleteIfUnmanaged($oldPath);
                $data[$key] = $nextPath;
            }
        }

        $data['maintenance_mode'] = $request->boolean('maintenance_mode');

        $this->settings->setMany($data);

        if (array_key_exists('favicon', $data)) {
            $this->favicons->publish($data['favicon']);
        }

        $this->activityLog->record('settings.updated', null, [
            'old' => $before,
            'new' => $this->settings->all(),
        ]);

        return back()->with('success', 'Settings updated.');
    }
}
