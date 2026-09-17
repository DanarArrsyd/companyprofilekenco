<?php

/*
|--------------------------------------------------------------------------
| Production front controller — split shared-hosting layout
|--------------------------------------------------------------------------
|
| This is Laravel's own public/index.php (Laravel 13, unmodified logic)
| with exactly one change: every path that used to point one directory up
| (into the Laravel app itself) now points into the sibling "application/"
| directory instead, because on this host (Hostinger shared hosting) the
| web-servable document root is a fixed public_html and cannot be pointed
| at this project's real public/ directory — so the full Laravel
| application lives outside public_html, in a sibling "application/" folder,
| and only this file (plus .htaccess and the built static assets) is
| deployed into public_html itself.
|
| Identical in logic to deploy/staging/public_html/index.php — kept as a
| separate copy (not a shared include) so production and staging can never
| accidentally diverge from a single shared file being edited for one
| environment and silently affecting the other.
|
| Deployed only during the explicit cutover step of scripts/deploy-production.sh
| — do not hand-edit this file directly on the server; edit this source
| copy and redeploy.
*/

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../application/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../application/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../application/bootstrap/app.php';

$app->handleRequest(Request::capture());
