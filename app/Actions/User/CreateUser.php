<?php

namespace App\Actions\User;

use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Support\Facades\Hash;

class CreateUser
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'status' => $data['status'] ?? 'active',
        ]);

        if (! empty($data['roles'])) {
            $user->syncRoles($data['roles']);
        }

        $this->activityLog->record('user.created', $user, ['name' => $user->name, 'email' => $user->email]);

        return $user;
    }
}
