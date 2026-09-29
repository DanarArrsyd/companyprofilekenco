<?php

use App\Services\SettingsService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Operating hours became a structured schedule (2026-09-29). The old value was
 * free text; the user asked for Mon–Thu 08:00–16:00, Fri 08:00–16:30,
 * Sat 08:00–13:15, so a free-text value is replaced by that schedule. A value
 * that is already a schedule, or no value at all, is left alone.
 */
return new class extends Migration
{
    public function up(): void
    {
        $value = DB::table('site_settings')->where('key', 'operating_hours')->value('value');

        if (! is_string($value) || trim($value) === '' || is_array(json_decode($value, true))) {
            return;
        }

        app(SettingsService::class)->setMany(['operating_hours' => [
            ['from' => 'mon', 'to' => 'thu', 'open' => '08:00', 'close' => '16:00'],
            ['from' => 'fri', 'to' => 'fri', 'open' => '08:00', 'close' => '16:30'],
            ['from' => 'sat', 'to' => 'sat', 'open' => '08:00', 'close' => '13:15'],
        ]]);
    }

    public function down(): void
    {
        // The free text is gone for good; the schedule stays.
    }
};
