<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Services\SettingsService;
use Illuminate\Http\RedirectResponse;

/**
 * /favicon.ico — browsers and crawlers request it directly, ignoring the
 * <link rel="icon"> tag, so point it at the icon uploaded in Settings.
 * A short cache keeps a newly uploaded icon from being masked for days.
 */
class FaviconController extends Controller
{
    public function __invoke(SettingsService $settings): RedirectResponse
    {
        $icon = $settings->siteIcon();

        abort_if($icon === null, 404);

        return redirect($icon['url'], 302)->header('Cache-Control', 'public, max-age=3600');
    }
}
