<?php

namespace App\Actions\User;

use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ResetUserPassword
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    /**
     * Set an explicit new password chosen by the admin.
     */
    public function handle(User $user, string $password): void
    {
        $user->update(['password' => Hash::make($password)]);

        $this->activityLog->record('user.password_reset', $user, ['name' => $user->name]);
    }

    /**
     * Generate a random temporary password and return it once so the admin
     * can hand it to the user out-of-band — it is never stored in plain
     * text or logged.
     */
    public function generateTemporary(User $user): string
    {
        $password = Str::password(16);

        $user->update(['password' => Hash::make($password)]);

        $this->activityLog->record('user.password_reset', $user, ['name' => $user->name, 'method' => 'generated']);

        return $password;
    }
}
