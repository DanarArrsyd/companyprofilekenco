<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

/**
 * Requests the key public pages straight through the HTTP kernel — no network,
 * no CDN — so a deploy can prove the app boots, reaches its database and
 * renders. The staging server cannot reach its own public URL through the
 * Hostinger edge, and the edge sometimes answers GitHub's runners with 403,
 * so this is the check the deploy relies on.
 */
class SmokeCheck extends Command
{
    protected $signature = 'app:smoke {--path=* : Paths to request instead of the defaults}';

    protected $description = 'Render the key pages in-process and fail if any does not answer 2xx';

    private const PATHS = ['/up', '/', '/en', '/company', '/products', '/news', '/contact', '/sitemap.xml', '/robots.txt', '/admin/login'];

    public function handle(Kernel $kernel): int
    {
        $failed = false;

        foreach ($this->option('path') ?: self::PATHS as $path) {
            $request = Request::create($path, 'GET', server: ['HTTPS' => 'on']);
            $response = $kernel->handle($request);
            $kernel->terminate($request, $response);

            $status = $response->getStatusCode();
            $ok = $status >= 200 && $status < 300;
            $failed = $failed || ! $ok;

            $this->line(sprintf('%s %d %s', $ok ? 'ok  ' : 'FAIL', $status, $path));
        }

        return $failed ? self::FAILURE : self::SUCCESS;
    }
}
