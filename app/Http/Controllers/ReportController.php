<?php

namespace App\Http\Controllers;

use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $query = InventoryMovement::with(['product.category', 'user', 'storageLocation'])->latest();

        // Date presets
        $preset = $request->input('preset');
        $from = $request->input('from');
        $to = $request->input('to');

        if ($preset) {
            match($preset) {
                'hoje' => [
                    $from = Carbon::today()->toDateString(),
                    $to   = Carbon::today()->toDateString(),
                ],
                '7dias' => [
                    $from = Carbon::today()->subDays(6)->toDateString(),
                    $to   = Carbon::today()->toDateString(),
                ],
                '30dias' => [
                    $from = Carbon::today()->subDays(29)->toDateString(),
                    $to   = Carbon::today()->toDateString(),
                ],
                'mes_atual' => [
                    $from = Carbon::today()->startOfMonth()->toDateString(),
                    $to   = Carbon::today()->endOfMonth()->toDateString(),
                ],
                default => null,
            };
        }

        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }

        if ($tipo = $request->input('tipo')) {
            $query->where('tipo', $tipo);
        }

        if ($productId = $request->input('product_id')) {
            $query->where('product_id', $productId);
        }

        if ($categoryId = $request->input('category_id')) {
            $query->whereHas('product', fn ($q) => $q->where('category_id', $categoryId));
        }

        if ($userId = $request->input('user_id')) {
            $query->where('user_id', $userId);
        }

        // Summary calculations
        $summaryQuery = clone $query;
        $allMovements = $summaryQuery->get();

        $totalRegistros = $allMovements->count();
        $totalEntradas = $allMovements->where('tipo', 'entrada')->sum(fn($m) => abs($m->quantidade));
        $totalSaidas   = $allMovements->where('tipo', 'saida')->sum(fn($m) => abs($m->quantidade));
        $saldoLiquido  = $totalEntradas - $totalSaidas;
        $valorTotalEstimado = $allMovements->sum(function ($m) {
            $preco = $m->preco_unitario ?? ($m->product->preco_custo ?? 0);
            return abs($m->quantidade) * $preco;
        });

        // For print preview, load all; otherwise paginate
        $isPrint = $request->boolean('print');
        $movements = $isPrint ? $query->get() : $query->paginate(25)->withQueryString();

        $products   = Product::ativo()->orderBy('nome')->get(['id', 'nome', 'codigo']);
        $categories = Category::ativo()->orderBy('nome')->get(['id', 'nome']);
        $users      = User::where('ativo', true)->orderBy('name')->get(['id', 'name']);

        return view('reports.index', compact(
            'movements',
            'products',
            'categories',
            'users',
            'totalRegistros',
            'totalEntradas',
            'totalSaidas',
            'saldoLiquido',
            'valorTotalEstimado',
            'from',
            'to',
            'preset',
            'isPrint'
        ));
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $query = InventoryMovement::with(['product.category', 'user', 'storageLocation'])->latest();

        if ($from = $request->input('from')) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to = $request->input('to')) {
            $query->whereDate('created_at', '<=', $to);
        }
        if ($tipo = $request->input('tipo')) {
            $query->where('tipo', $tipo);
        }
        if ($productId = $request->input('product_id')) {
            $query->where('product_id', $productId);
        }
        if ($categoryId = $request->input('category_id')) {
            $query->whereHas('product', fn ($q) => $q->where('category_id', $categoryId));
        }
        if ($userId = $request->input('user_id')) {
            $query->where('user_id', $userId);
        }

        $movements = $query->get();
        $filename = 'relatorio-movimentacoes-' . now()->format('Y-m-d-His') . '.csv';

        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma'              => 'no-cache',
            'Cache-Control'       => 'must-revalidate, post-check=0, pre-check=0',
            'Expires'             => '0',
        ];

        return response()->stream(function () use ($movements) {
            $handle = fopen('php://output', 'w');

            // UTF-8 BOM for Microsoft Excel
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            // Header row
            fputcsv($handle, [
                'ID',
                'Data / Hora',
                'Tipo',
                'Código Produto',
                'Nome Produto',
                'Categoria',
                'Quantidade',
                'Estoque Anterior',
                'Estoque Posterior',
                'Unidade',
                'Preço Unitário (R$)',
                'Localização',
                'Documento/NF',
                'Motivo',
                'Lote',
                'Responsável'
            ], ';');

            foreach ($movements as $m) {
                fputcsv($handle, [
                    $m->id,
                    $m->created_at->format('d/m/Y H:i:s'),
                    strtoupper($m->tipo),
                    $m->product->codigo ?? '-',
                    $m->product->nome ?? '-',
                    $m->product->category->nome ?? '-',
                    $m->quantidade,
                    $m->estoque_antes,
                    $m->estoque_depois,
                    $m->product->unidade_medida ?? 'UN',
                    number_format($m->preco_unitario ?? $m->product->preco_custo ?? 0, 2, ',', '.'),
                    $m->storageLocation->codigo ?? '-',
                    $m->documento ?? '-',
                    $m->motivo ?? '-',
                    $m->lote ?? '-',
                    $m->user->name ?? '-',
                ], ';');
            }

            fclose($handle);
        }, 200, $headers);
    }
}
