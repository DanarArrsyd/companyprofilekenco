<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Request;

class ActivityLogService
{
    /**
     * Field names that must never be persisted in plain form, wherever
     * they appear in a logged properties payload (top-level or nested,
     * e.g. inside an old/new settings diff).
     */
    private const SENSITIVE_KEYS = [
        'password', 'password_confirmation', 'current_password',
        'token', 'remember_token', 'api_key', 'api_secret', 'secret',
    ];

    /**
     * Record a single activity log entry.
     */
    public function record(string $action, ?Model $subject = null, array $properties = []): ActivityLog
    {
        return ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'subject_type' => $subject?->getMorphClass(),
            'subject_id' => $subject?->getKey(),
            'properties' => $this->sanitize($properties),
            'ip_address' => Request::ip(),
            'created_at' => now(),
        ]);
    }

    /**
     * Recursively strip sensitive values from a properties payload before
     * it's persisted, regardless of nesting depth.
     */
    private function sanitize(array $properties): array
    {
        foreach ($properties as $key => $value) {
            if (is_array($value)) {
                $properties[$key] = $this->sanitize($value);

                continue;
            }

            if (is_string($key) && in_array(strtolower($key), self::SENSITIVE_KEYS, true)) {
                $properties[$key] = '[REDACTED]';
            }
        }

        return $properties;
    }
}
