<?php

namespace App\Actions\User;

use App\Enums\UserStatus;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Validation\ValidationException;

class UpdateUserStatus
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    /**
     * @throws ValidationException when the guardrails below would leave
     *         the system without an active Super Admin, or the actor is
     *         suspending themselves.
     */
    public function handle(User $actor, User $target, UserStatus $status): User
    {
        if ($status === UserStatus::Suspended) {
            if ($actor->is($target)) {
                throw ValidationException::withMessages(['status' => 'You cannot suspend your own account.']);
            }

            if ($target->hasRole('Super Admin') && $this->otherActiveSuperAdmins($target) === 0) {
                throw ValidationException::withMessages(['status' => 'The system must keep at least one active Super Admin.']);
            }
        }

        $target->update(['status' => $status]);

        $this->activityLog->record('user.status_updated', $target, ['name' => $target->name, 'status' => $status->value]);

        return $target->fresh();
    }

    private function otherActiveSuperAdmins(User $excluding): int
    {
        return User::role('Super Admin')
            ->where('status', UserStatus::Active)
            ->where('id', '!=', $excluding->id)
            ->count();
    }
}
