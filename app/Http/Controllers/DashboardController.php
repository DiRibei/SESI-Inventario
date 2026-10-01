<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\InventoryMovement;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $valorTotal = Product::ativo()->selectRaw('COALESCE(SUM(estoque_atual * preco_custo), 0) as total')->value('total');

        $stats = [
            'total_produtos'        => Product::ativo()->count(),
            'estoque_critico'       => Product::ativo()->estoqueCritico()->count(),
            'entradas_hoje'         => InventoryMovement::where('tipo', 'entrada')->whereDate('created_at', today())->count(),
            'saidas_hoje'          => InventoryMovement::where('tipo', 'saida')->whereDate('created_at', today())->count(),
            'movimentacoes_mes'    => InventoryMovement::whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count(),
            'valor_total_estoque'   => (float) $valorTotal,
        ];

        // Critical stock alerts (most critical first)
        $produtosCriticos = Product::with(['category', 'storageLocation'])
            ->ativo()
            ->estoqueCritico()
            ->orderByRaw('(estoque_atual - estoque_minimo) ASC')
            ->limit(8)
            ->get();

        // Recent movements
        $movimentosRecentes = InventoryMovement::with(['product.category', 'user', 'storageLocation'])
            ->latest()
            ->limit(10)
            ->get();

        // ── Chart 1: Movements in the last 7 days ─────────────────────────────
        $chartDates = [];
        $chartEntradas = [];
        $chartSaidas = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $chartDates[] = $date->format('d/m');

            $chartEntradas[] = InventoryMovement::where('tipo', 'entrada')
                ->whereDate('created_at', $date)
                ->count();

            $chartSaidas[] = InventoryMovement::where('tipo', 'saida')
                ->whereDate('created_at', $date)
                ->count();
        }

        // ── Chart 2: Category distribution ────────────────────────────────────
        $categoriesData = Category::ativo()
            ->has('products')
            ->withCount('products')
            ->orderByDesc('products_count')
            ->limit(6)
            ->get();

        $chartCategoryLabels = $categoriesData->pluck('nome')->toArray();
        $chartCategoryCounts = $categoriesData->pluck('products_count')->toArray();
        $chartCategoryColors = $categoriesData->pluck('cor')->toArray();

        return view('dashboard', compact(
            'stats',
            'produtosCriticos',
            'movimentosRecentes',
            'chartDates',
            'chartEntradas',
            'chartSaidas',
            'chartCategoryLabels',
            'chartCategoryCounts',
            'chartCategoryColors'
        ));
    }
}
