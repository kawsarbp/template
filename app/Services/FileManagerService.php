<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;

class FileManagerService
{
    public function upload(UploadedFile $file, $path = 'uploads', $fileName = null): false|string
    {
        try {
            if ($fileName == null) {
                $fileName = Str::random(10).time().'.'.$file->getClientOriginalExtension();
            }

            return $file->storeAS($path, $fileName, ['visibility' => 'public']);
        } catch (\Exception $e) {
            return false;
        }
    }

    public function delete($filePath): bool
    {
        $success = true;
        try {
            if (! @unlink(Storage::url($filePath))) {
                $success = false;
            }
        } catch (\Exception $e) {
            $success = false;
        }

        return $success;
    }

    public function uploadPhoto($file, $path = 'uploads', $fileName = null, $ht = 960): string
    {
        if ($fileName == null) {
            $fileName = Str::random(10).time().'.jpg';
        }

        $image = ImageManager::gd()->read($file);

        if (! endsWith($path, '/')) {
            $path .= '/';
        }

        // resize for main image
        $height = $image->height() > $ht ? $ht : $image->height();
        $image->scale(null, $height)->toJpeg();

        Storage::put($path.$fileName, $image->encode(), ['visibility' => 'public']);

        return $path.$fileName;
    }

    public function uploadPhotoWithThumbnail($file, $path = 'uploads', $fileName = null): string
    {
        if ($fileName == null) {
            $fileName = Str::random(10).time().'.jpg';
        }

        $image = ImageManager::gd()->read($file);
        $originalImage = clone $image;

        if (! endsWith($path, '/')) {
            $path .= '/';
        }

        // resize for main image
        $height = $image->height() > 960 ? 960 : $image->height();
        $image->scale(null, $height)->toJpeg();
        Storage::put($path.$fileName, $image->encode(), ['visibility' => 'public']);

        // save thumbnail
        $height = $originalImage->height() > 240 ? 240 : $originalImage->height();
        $originalImage->scale(null, $height)->toJpeg();
        Storage::put($path.'thumb-'.$fileName, $originalImage->encode(), ['visibility' => 'public']);

        return $path.$fileName;
    }
}
