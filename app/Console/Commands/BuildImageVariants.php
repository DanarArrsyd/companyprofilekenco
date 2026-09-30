<?php

namespace App\Console\Commands;

use App\Services\ImageVariantService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

/**
 * Builds the responsive WebP copies of every stored image ahead of time,
 * so the first visitor after an upload or a deploy never waits for PHP to
 * resize one. Existing copies are kept, so re-running only fills gaps.
 * Pages work without it: a missing copy is built on its first request.
 */
class BuildImageVariants extends Command
{
    protected $signature = 'media:variants';

    protected $description = 'Build the missing responsive WebP copies of stored images';

    public function handle(ImageVariantService $variants): int
    {
        $built = 0;
        $failed = 0;
        $disk = Storage::disk('public');
        $current = ImageVariantService::DIRECTORY.'/v'.ImageVariantService::VERSION;

        // Copies made with other encoder settings (older URL versions) are dropped.
        foreach ($disk->directories(ImageVariantService::DIRECTORY) as $directory) {
            if ($directory !== $current) {
                $disk->deleteDirectory($directory);
                $this->info("Removed outdated copies in {$directory}.");
            }
        }
        $disk->delete(ImageVariantService::DIRECTORY.'/VERSION');

        $sources = collect(Storage::disk('public')->allFiles())
            ->filter(fn (string $path) => $variants->isEligible($path));

        foreach ($sources as $source) {
            foreach (ImageVariantService::WIDTHS as $width) {
                $existed = Storage::disk('public')->exists($variants->variantPath($source, $width));

                if ($variants->ensure($source, $width) === null) {
                    $failed++;
                    $this->warn("Could not build w{$width} of {$source}");

                    continue 2;
                }

                $built += $existed ? 0 : 1;
            }
        }

        $this->info("{$sources->count()} images checked, {$built} copies built".($failed ? ", {$failed} unreadable" : '').'.');

        return self::SUCCESS;
    }
}
