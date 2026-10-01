<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\StorageLocationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\InventoryMovementController;
use App\Http\Middleware\EnsureIsAdmin;
use App\Http\Middleware\EnsureIsOperador;
use Illuminate\Support\Facades\Route;

// ── Root redirect ──────────────────────────────────────────────────────────────
Route::get('/', fn () => redirect()->route('login'));

// ── Authenticated routes ───────────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard (everyone authenticated)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ── Operador + Admin: Inventory Movements ──────────────────────────────────
    Route::middleware(EnsureIsOperador::class)->group(function () {
        Route::resource('inventory-movements', InventoryMovementController::class)
            ->only(['index', 'create', 'store', 'show']);
    });

    // ── Admin only ─────────────────────────────────────────────────────────────
    Route::middleware(EnsureIsAdmin::class)->group(function () {
        Route::resource('products', ProductController::class);
        Route::resource('categories', CategoryController::class);
        Route::resource('suppliers', SupplierController::class);
        Route::resource('storage-locations', StorageLocationController::class);
        Route::resource('users', UserController::class)->except(['show']);
    });
});

require __DIR__ . '/auth.php';
