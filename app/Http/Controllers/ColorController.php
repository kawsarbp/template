<?php

namespace App\Http\Controllers;

use App\Actions\Color\DeleteColorAction;
use App\Actions\Color\ListColorsAction;
use App\Actions\Color\StoreColorAction;
use App\Actions\Color\UpdateColorAction;
use App\Http\Requests\Color\StoreColorRequest;
use App\Http\Requests\Color\UpdateColorRequest;
use App\Http\Resources\Color\ColorDetailResource;
use App\Http\Resources\Color\ColorListResource;
use App\Models\Color;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;
use Inertia\ResponseFactory;

class ColorController extends Controller
{
    /**
     * @return Response|ResponseFactory
     */
    public function index(Request $request, ListColorsAction $listColorsAction)
    {
        $filters = $request->all();

        $colors = $listColorsAction->execute(
            filters: $filters,
            perPage: (int) $request->input('limit', 15)
        );

        return inertia('Color/Colors', [
            'data' => ColorListResource::collection($colors),
        ]);
    }

    /**
     * @return RedirectResponse
     */
    public function store(StoreColorRequest $request, StoreColorAction $storeColorAction)
    {
        $storeColorAction->execute($request->validated());

        return redirect()->back()->with('success', __('Color added successfully.'));
    }

    public function show(Color $color, Request $request): ColorDetailResource|Response|ResponseFactory
    {

        if ($request->expectsJson()) {
            return new ColorDetailResource($color);
        }

        return inertia('Color/Colors', ['data' => new ColorDetailResource($color)]);
    }

    /**
     * @return RedirectResponse
     */
    public function update(UpdateColorRequest $request, Color $color, UpdateColorAction $updateColorAction)
    {
        $updateColorAction->execute($color, $request->validated());

        return redirect()->back()->with('success', __('Color updated successfully.'));
    }

    /**
     * @return RedirectResponse
     */
    public function destroy(Color $color, DeleteColorAction $deleteColorAction)
    {
        $deleteColorAction->execute($color);

        return redirect()->back()->with('success', __('Color deleted successfully.'));
    }
}
