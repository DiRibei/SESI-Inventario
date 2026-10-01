<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\InventoryMovement;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_produtos'      => Product::ativo()->count(),
            'estoque_critico'     => Product::ativo()->estoqueCritico()->count(),
            'entradas_hoje'       => InventoryMovement::where('tipo', 'entrada')
                                        ->whereDate('created_at', today())->count(),
            'saidas_hoje'        => InventoryMovement::where('tipo', 'saida')
                                        ->whereDate('created_at', today())->count(),
        ];

        $produtosCriticos = Product::with(['category', 'storageLocation'])
            ->ativo()
            ->estoqueCritico()
            ->orderByRaw('estoque_atual - estoque_minimo ASC')
            ->get();

        $movimentosRecentes = InventoryMovement::with(['product', 'user'])
            ->latest()
            ->limit(10)
            ->get();

        return view('dashboard', compact('stats', 'produtosCriticos', 'movimentosRecentes'));
    }
}
