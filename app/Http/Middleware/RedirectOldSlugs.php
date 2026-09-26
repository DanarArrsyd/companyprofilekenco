<?php

namespace App\Http\Middleware;

use App\Support\Locale;
use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * On a public detail route (`{prefix}/{slug}`) that would 404, look the slug
 * up among renamed models and redirect permanently to the current address.
 * Live slugs never reach the lookup, so valid pages cost no extra query.
 *
 * Usage: ->middleware('slug.redirect:'.Product::class.',products')
 */
class RedirectOldSlugs
{
    /** @param  class-string<Model>  $model */
    public function handle(Request $request, Closure $next, string $model, string $prefix): Response
    {
        $response = $next($request);

        if ($response->getStatusCode() !== 404 || ! is_string($slug = $request->route('slug'))) {
            return $response;
        }

        $target = $model::findByOldSlug($slug);

        return $target
            ? redirect(Locale::path("/{$prefix}/{$target->slug}"), 301)
            : $response;
    }
}
