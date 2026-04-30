<?php

namespace App\Http\Controllers;

use App\Enums\VisibilityStatus;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    public function searchUser(Request $request): JsonResponse
    {
        $query = User::select([
            DB::raw('id AS value'),
            DB::raw('name AS label'),
        ])->where('status', VisibilityStatus::ACTIVE->value);

        if (! empty($request->search)) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $query->orderBy($request->get('sort_by', 'name'), $request->get('sort_direction', 'asc'));

        return response()->json(['data' => $query->limit(20)->get()]);
    }
}
