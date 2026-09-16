<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Media\CreateMedia;
use App\Actions\Media\DeleteMedia;
use App\Actions\Media\ReplaceMediaFile;
use App\Actions\Media\UpdateMediaAltText;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Media\ReplaceMediaFileRequest;
use App\Http\Requests\Admin\Media\StoreMediaRequest;
use App\Http\Requests\Admin\Media\UpdateMediaAltTextRequest;
use App\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('admin/media/Index', [
            'media' => $this->query($request)->paginate(24)->withQueryString(),
            'filters' => $request->only(['search', 'type']),
        ]);
    }

    /**
     * Lightweight JSON listing consumed by the MediaPicker component so it
     * can browse the library from inside a modal without a full page visit.
     */
    public function picker(Request $request): JsonResponse
    {
        $media = $this->query($request)->paginate(24)->withQueryString();

        $media->getCollection()->transform(fn (Media $item) => [
            'id' => $item->id,
            'path' => $item->path,
            'url' => $item->url(),
            'filename' => $item->filename,
            'original_name' => $item->original_name,
            'mime_type' => $item->mime_type,
            'alt_text' => $item->alt_text,
            'is_image' => $item->isImage(),
        ]);

        return response()->json($media);
    }

    public function store(StoreMediaRequest $request, CreateMedia $action): RedirectResponse
    {
        $action->handle($request->file('file'), $request->validated('alt_text'));

        return back()->with('success', 'Media uploaded.');
    }

    public function updateAltText(UpdateMediaAltTextRequest $request, Media $media, UpdateMediaAltText $action): RedirectResponse
    {
        $action->handle($media, $request->validated('alt_text'));

        return back()->with('success', 'Alt text updated.');
    }

    public function replace(ReplaceMediaFileRequest $request, Media $media, ReplaceMediaFile $action): RedirectResponse
    {
        $action->handle($media, $request->file('file'));

        return back()->with('success', 'File replaced.');
    }

    public function destroy(Media $media, DeleteMedia $action): RedirectResponse
    {
        if ($action->isInUse($media)) {
            return back()->with('error', 'This file is still used by published content and cannot be deleted.');
        }

        $action->handle($media);

        return back()->with('success', 'Media deleted.');
    }

    private function query(Request $request)
    {
        return Media::query()
            ->with('uploader:id,name')
            ->when($request->filled('search'), fn ($q) => $q->where(function ($sub) use ($request) {
                $sub->where('original_name', 'like', "%{$request->string('search')}%")
                    ->orWhere('alt_text', 'like', "%{$request->string('search')}%");
            }))
            ->when($request->get('type') === 'image', fn ($q) => $q->images())
            ->when($request->get('type') === 'document', fn ($q) => $q->documents())
            ->latest('created_at');
    }
}
