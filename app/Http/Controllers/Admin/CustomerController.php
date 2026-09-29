<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Customer\SaveCustomer;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Customer\SaveCustomerRequest;
use App\Models\Customer;
use App\Services\ActivityLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/** Customers Served (homepage logo wall): add, edit, order, hide, delete. */
class CustomerController extends Controller
{
    public function __construct(private readonly ActivityLogService $activityLog) {}

    public function index(): Response
    {
        return Inertia::render('admin/customers/Index', [
            'customers' => Customer::query()->with('logo:id,path')->orderBy('order')->orderBy('id')->get()
                ->map(fn (Customer $customer) => $this->row($customer)),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/customers/Form', ['customer' => null]);
    }

    public function store(SaveCustomerRequest $request, SaveCustomer $save): RedirectResponse
    {
        $save->handle($request->validated() + ['logo' => $request->file('logo')]);

        return redirect()->route('admin.customers')->with('success', 'Pelanggan ditambahkan.');
    }

    public function edit(Customer $customer): Response
    {
        return Inertia::render('admin/customers/Form', ['customer' => $this->row($customer->load('logo:id,path'))]);
    }

    public function update(SaveCustomerRequest $request, Customer $customer, SaveCustomer $save): RedirectResponse
    {
        $save->handle($request->validated() + ['logo' => $request->file('logo')], $customer);

        return redirect()->route('admin.customers')->with('success', 'Pelanggan disimpan.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $ids = $request->validate([
            'ordered_ids' => ['required', 'array'],
            'ordered_ids.*' => ['integer', 'exists:customers,id'],
        ])['ordered_ids'];

        DB::transaction(function () use ($ids) {
            foreach (array_values($ids) as $position => $id) {
                Customer::whereKey($id)->update(['order' => $position]);
            }
        });

        return back()->with('success', 'Urutan pelanggan disimpan.');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        $customer->delete();
        $this->activityLog->record('customer.deleted', null, ['name' => $customer->name]);

        return redirect()->route('admin.customers')->with('success', 'Pelanggan dihapus.');
    }

    /** @return array{id: int, name: string, logo: string|null, is_featured: bool} */
    private function row(Customer $customer): array
    {
        return [
            'id' => $customer->id,
            'name' => $customer->name,
            'logo' => $customer->logo?->path,
            'is_featured' => $customer->is_featured,
        ];
    }
}
