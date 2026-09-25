<?php

namespace App\Console\Commands;

use App\Services\FaviconFileService;
use App\Services\SettingsService;
use Illuminate\Console\Command;

class PublishFavicon extends Command
{
    protected $signature = 'favicon:publish {--web-root= : Directory the web server serves (defaults to public_path())}';

    protected $description = 'Copy the favicon uploaded in Settings to the web root as favicon.ico';

    public function handle(SettingsService $settings, FaviconFileService $favicons): int
    {
        $path = $settings->get('favicon');
        $favicons->publish($path, $this->option('web-root') ?: null);

        $this->info($path ? "Published {$path} as favicon.ico." : 'No favicon set; removed favicon.ico.');

        return self::SUCCESS;
    }
}
