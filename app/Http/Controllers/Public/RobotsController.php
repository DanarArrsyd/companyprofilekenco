<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\Response;

/**
 * Dynamic /robots.txt — environment-aware so a staging/local deploy can
 * never get indexed just because someone forgot a checkbox. Production is
 * the only environment that allows crawling and advertises the sitemap.
 */
class RobotsController extends Controller
{
    public function index(): Response
    {
        $lines = app()->environment('production')
            ? [
                'User-agent: *',
                'Allow: /',
                'Disallow: /admin',
                'Disallow: /login',
                '',
                'Sitemap: '.url('/sitemap.xml'),
            ]
            : [
                'User-agent: *',
                'Disallow: /',
            ];

        return response(implode("\n", $lines)."\n", 200)->header('Content-Type', 'text/plain; charset=UTF-8');
    }
}
