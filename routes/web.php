<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\StorageLocationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\InventoryMovementController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ProfileController;
use App\Http\Middleware\EnsureIsAdmin;
use App\Http\Middleware\EnsureIsOperador;
use Illuminate\Support\Facades\Route;

// ── Root redirect ──────────────────────────────────────────────────────────────
Route::get('/', fn () => redirect()->route('login'));

// ── Authenticated routes ───────────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard (accessible by both Admin and Operador)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ── Profile ────────────────────────────────────────────────────────────────
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ── Admin-Only Routes ──────────────────────────────────────────────────────
    Route::middleware(EnsureIsAdmin::class)->group(function () {
        // Product creation and editing (must come before {product} wildcard)
        Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

        // Master Data Management
        Route::resource('categories', CategoryController::class);
        Route::resource('suppliers', SupplierController::class);
        Route::resource('storage-locations', StorageLocationController::class);
        Route::resource('users', UserController::class)->except(['show']);
    });

    // ── Products Consultation (Admin + Operador) ──────────────────────────────
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');

    // ── Inventory Movements (Admin + Operador) ─────────────────────────────────
    Route::resource('inventory-movements', InventoryMovementController::class)
        ->only(['index', 'create', 'store', 'show']);

    // ── Reports & History (Admin + Operador) ───────────────────────────────────
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/export-csv', [ReportController::class, 'exportCsv'])->name('reports.export-csv');

    // ── In-App Manual do Usuário & Documentação ───────────────────────────────
    Route::get('/manual', function () {
        return view('manual.index');
    })->name('manual.index');
});

require __DIR__ . '/auth.php';
