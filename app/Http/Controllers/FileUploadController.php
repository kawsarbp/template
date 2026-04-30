<?php

namespace App\Http\Controllers;

use App\Services\FileManagerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileUploadController extends Controller
{
    public function __construct(protected FileManagerService $fileManagerService) {}

    public function uploadAttachment(Request $request): JsonResponse
    {
        $path = match (true) {
            request()->is('cashflow-transactions*') => 'uploads/cashflow/attachments',
            request()->is('advanced-accounts*') => 'uploads/advance-payment/attachments',
            request()->is('stocks*') => 'uploads/stocks/attachments',
            request()->is('sales*') => 'uploads/stocks/attachments',
            default => 'uploads/attachments',
        };

        $request->validate([
            'attachment' => 'required|file|mimes:jpg,jpeg,png,pdf',
        ]);

        try {
            $upload = $this->fileManagerService->upload($request->attachment, $path);

            if (! $upload) {
                return response()->json(['success' => false, 'url' => null, 'message' => 'Failed to file upload'], 400);
            }

            return response()->json(['success' => true, 'url' => Storage::url($upload)]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload file.',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    public function uploadPhoto(Request $request): JsonResponse
    {
        $path = match (true) {
            request()->is('products*') => 'uploads/product/photo',
            default => 'uploads/photo',
        };

        $request->validate([
            'photo' => 'required|file|mimes:jpg,jpeg,png',
        ]);

        try {
            $upload = $this->fileManagerService->upload($request->photo, $path);

            if (! $upload) {
                return response()->json(['success' => false, 'url' => null, 'message' => 'Failed to file upload'], 400);
            }

            return response()->json(['success' => true, 'url' => Storage::url($upload)]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload file.',
                'error' => $e->getMessage(),
            ], 400);
        }
    }
}
