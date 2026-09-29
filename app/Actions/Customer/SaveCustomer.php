<?php

namespace App\Actions\Customer;

use App\Actions\Media\CreateMedia;
use App\Models\Customer;
use App\Models\Media;
use App\Services\ActivityLogService;
use Illuminate\Http\UploadedFile;

/**
 * Creates or updates a customer. The logo is a Media library item: an upload
 * becomes a new one, a picked library path points at an existing one, an
 * empty `logo_path` removes the logo and leaving both out keeps it.
 */
class SaveCustomer
{
    public function __construct(
        private readonly CreateMedia $createMedia,
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(array $data, ?Customer $customer = null): Customer
    {
        $attributes = [
            'name' => $data['name'],
            'segment' => $data['segment'],
            'is_featured' => (bool) ($data['is_featured'] ?? $customer?->is_featured ?? true),
        ];

        if (($data['logo'] ?? null) instanceof UploadedFile) {
            $attributes['logo_media_id'] = $this->createMedia->handle($data['logo'], $data['name'])->id;
        } elseif (array_key_exists('logo_path', $data)) {
            $attributes['logo_media_id'] = filled($data['logo_path'])
                ? Media::where('path', $data['logo_path'])->value('id')
                : null;
        }

        if ($customer === null) {
            $attributes['order'] = (int) Customer::where('segment', $data['segment'])->max('order') + 1;
            $customer = Customer::create($attributes);
            $this->activityLog->record('customer.created', $customer, ['name' => $customer->name]);

            return $customer;
        }

        $customer->update($attributes);
        $this->activityLog->record('customer.updated', $customer, ['name' => $customer->name]);

        return $customer;
    }
}
