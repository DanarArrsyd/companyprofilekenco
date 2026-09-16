<?php

namespace App\Http\Controllers\Admin;

use App\Actions\User\CreateUser;
use App\Actions\User\ResetUserPassword;
use App\Actions\User\UpdateUser;
use App\Actions\User\UpdateUserStatus;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\User\ResetUserPasswordRequest;
use App\Http\Requests\Admin\User\StoreUserRequest;
use App\Http\Requests\Admin\User\UpdateUserRequest;
use App\Http\Requests\Admin\User\UpdateUserStatusRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::query()
            ->with('roles:id,name')
            ->when($request->filled('search'), fn ($q) => $q->where(function ($sub) use ($request) {
                $sub->where('name', 'like', "%{$request->string('search')}%")
                    ->orWhere('email', 'like', "%{$request->string('search')}%");
            }))
            ->when($request->filled('role'), fn ($q) => $q->whereHas('roles', fn ($sub) => $sub->where('name', $request->string('role'))))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'status']),
            'roles' => Role::orderBy('name')->pluck('name'),
            'statusOptions' => array_map(fn ($c) => $c->value, UserStatus::cases()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/users/Create', [
            'roles' => Role::orderBy('name')->pluck('name'),
        ]);
    }

    public function store(StoreUserRequest $request, CreateUser $action): RedirectResponse
    {
        $action->handle($request->validated());

        return redirect()->route('admin.users')->with('success', 'User created.');
    }

    public function edit(Request $request, User $user): Response
    {
        $user->load('roles:id,name');

        return Inertia::render('admin/users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'roles' => $user->roles->pluck('name'),
                'last_login_at' => $user->last_login_at,
                'created_at' => $user->created_at,
            ],
            'roles' => Role::orderBy('name')->pluck('name'),
            'isSelf' => $user->is($request->user()),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user, UpdateUser $action): RedirectResponse
    {
        $action->handle($user, $request->validated());

        return back()->with('success', 'User updated.');
    }

    public function updateStatus(UpdateUserStatusRequest $request, User $user, UpdateUserStatus $action): RedirectResponse
    {
        $action->handle($request->user(), $user, UserStatus::from($request->validated('status')));

        return back()->with('success', 'User status updated.');
    }

    public function resetPassword(ResetUserPasswordRequest $request, User $user, ResetUserPassword $action): RedirectResponse
    {
        if ($request->validated('mode') === 'generate') {
            $password = $action->generateTemporary($user);

            return back()->with('success', "Temporary password generated: {$password} (shown once — share it securely).");
        }

        $action->handle($user, $request->validated('password'));

        return back()->with('success', 'Password updated.');
    }
}
