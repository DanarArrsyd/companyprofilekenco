<?php

namespace App\Actions\User;

use App\Models\User;
use App\Services\ActivityLogService;

class UpdateUser
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(User $user, array $data): User
    {
        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
        ]);

        $user->syncRoles($data['roles'] ?? []);

        $this->activityLog->record('user.updated', $user, ['name' => $user->name, 'email' => $user->email]);

        return $user->fresh();
    }
}
