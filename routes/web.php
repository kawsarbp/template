<?php

declare(strict_types=1);

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::inertia('login', 'Auth/Login')->name('login');
    Route::post('login', [AuthController::class, 'login']);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/', function () {
        return inertia('DashboardHome');
    })->name('dashboard');

    /* users related endpoints */
    Route::get('users/export-excel', [UserController::class, 'exportExcel']);
    Route::apiResource('users', UserController::class);
    /* users related endpoints */

    /* activity logs related endpoints */
    Route::get('/activity-logs/list/{type}/{id}', [ActivityLogController::class, 'activityList']);
    Route::get('/activity-logs/{id}/{type}', [ActivityLogController::class, 'show']);
    Route::apiResource('activity-logs', ActivityLogController::class)->only('index');
    /* activity logs related endpoints */

    /* search related endpoints */
    Route::prefix('search')->controller(SearchController::class)
        ->group(function (): void {
            Route::get('users', 'searchUser');
        });
    /* search related endpoints */
});

require __DIR__.'/settings.php';
