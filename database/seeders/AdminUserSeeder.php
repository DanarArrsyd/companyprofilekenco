<?php

namespace Database\Seeders;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed a single Super Admin account for local development.
     *
     * Credentials are read from the environment. If ADMIN_DEV_PASSWORD is not
     * set, a random password is generated and printed once to the console —
     * never hardcode a real password here.
     */
    public function run(): void
    {
        $email = env('ADMIN_DEV_EMAIL', 'admin@kenco.test');
        $password = env('ADMIN_DEV_PASSWORD');

        $generated = false;

        if (! $password) {
            $password = Str::password(16);
            $generated = true;
        }

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Super Admin',
                'password' => $password,
                'status' => UserStatus::Active,
                'email_verified_at' => now(),
            ],
        );

        $user->syncRoles(['Super Admin']);

        if ($generated) {
            $this->command?->warn("Generated Super Admin password for {$email}: {$password}");
            $this->command?->warn('Set ADMIN_DEV_PASSWORD in .env to use a fixed value instead.');
        } else {
            $this->command?->info("Super Admin ready: {$email}");
        }
    }
}
