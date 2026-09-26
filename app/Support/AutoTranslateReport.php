<?php

namespace App\Support;

/**
 * What auto-translate did during the current admin request, so SetLocale can
 * tell the admin: how many texts were regenerated, nothing to do, or why the
 * translator refused. Reset by SetLocale at the start of every request.
 */
final class AutoTranslateReport
{
    private static bool $ran = false;

    private static int $count = 0;

    private static ?string $failure = null;

    public static function reset(): void
    {
        self::$ran = false;
        self::$count = 0;
        self::$failure = null;
    }

    /** A translatable model was saved with auto-translate on. */
    public static function attempted(): void
    {
        self::$ran = true;
    }

    public static function translated(int $texts): void
    {
        self::$ran = true;
        self::$count += $texts;
    }

    public static function failed(string $reason): void
    {
        self::$ran = true;
        self::$failure ??= $reason;
    }

    /** @return array{status: string, count: int, from: string, to: string, reason?: string}|null */
    public static function summary(string $from): ?array
    {
        if (! self::$ran) {
            return null;
        }

        $report = [
            'status' => self::$failure !== null ? 'failed' : (self::$count > 0 ? 'translated' : 'unchanged'),
            'count' => self::$count,
            'from' => $from,
            'to' => $from === 'id' ? 'en' : 'id',
        ];

        return self::$failure !== null ? [...$report, 'reason' => self::$failure] : $report;
    }
}
