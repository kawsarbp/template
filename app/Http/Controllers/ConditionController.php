<?php

namespace App\Http\Controllers;

use App\Actions\Condition\DeleteConditionAction;
use App\Actions\Condition\ListConditionsAction;
use App\Actions\Condition\StoreConditionAction;
use App\Actions\Condition\UpdateConditionAction;
use App\Http\Requests\Condition\StoreConditionRequest;
use App\Http\Requests\Condition\UpdateConditionRequest;
use App\Http\Resources\Condition\ConditionDetailResource;
use App\Http\Resources\Condition\ConditionListResource;
use App\Models\Condition;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;
use Inertia\ResponseFactory;

class ConditionController extends Controller
{
    /**
     * @return Response|ResponseFactory
     */
    public function index(Request $request, ListConditionsAction $listConditionsAction)
    {
        abort_if(! auth()->user()->can('manage condition'), 403);

        $filters = $request->all();

        $conditions = $listConditionsAction->execute(
            filters: $filters,
            perPage: (int) $request->input('limit', 15)
        );

        return inertia('Condition/Conditions', [
            'data' => ConditionListResource::collection($conditions),
        ]);
    }

    public function store(StoreConditionRequest $request, StoreConditionAction $storeConditionAction)
    {
        abort_if(! auth()->user()->can('create condition'), 403);

        $condition = $storeConditionAction->execute($request->validated());

        if ($request->expectsJson()) {
            return new ConditionDetailResource($condition);
        }

        return redirect()->back()->with('success', __('Condition added successfully.'));
    }

    public function show(Condition $condition, Request $request): ConditionDetailResource|Response|ResponseFactory
    {
        abort_if(! auth()->user()->can('manage condition'), 403);

        if ($request->expectsJson()) {
            return new ConditionDetailResource($condition);
        }

        return inertia('Condition/Conditions', ['data' => new ConditionDetailResource($condition)]);
    }

    /**
     * @return RedirectResponse
     */
    public function update(UpdateConditionRequest $request, Condition $condition, UpdateConditionAction $updateConditionAction)
    {
        abort_if(! auth()->user()->can('update condition'), 403);

        $updateConditionAction->execute($condition, $request->validated());

        return redirect()->back()->with('success', __('Condition updated successfully.'));
    }

    /**
     * @return RedirectResponse
     */
    public function destroy(Condition $condition, DeleteConditionAction $deleteConditionAction)
    {
        abort_if(! auth()->user()->can('delete condition'), 403);

        $deleteConditionAction->execute($condition);

        return redirect()->back()->with('success', __('Condition deleted successfully.'));
    }
}
