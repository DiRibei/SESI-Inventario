<?php

namespace App\Http\Controllers;

use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\StorageLocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryMovementController extends Controller
{
    public function index(Request $request)
    {
        $query = InventoryMovement::with(['product', 'user', 'storageLocation'])->latest();

        if ($search = $request->input('search')) {
            $query->whereHas('product', fn ($q) => $q->where('nome', 'like', "%$search%")
                ->orWhere('codigo', 'like', "%$search%"));
        }

        if ($tipo = $request->input('tipo')) {
            $query->where('tipo', $tipo);
        }

        if ($from = $request->input('from')) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to = $request->input('to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        $movements = $query->paginate(20)->withQueryString();

        return view('inventory-movements.index', compact('movements'));
    }

    public function create(Request $request)
    {
        $products         = Product::ativo()->orderBy('nome')->get();
        $storageLocations = StorageLocation::ativo()->orderBy('nome')->get();
        $selectedProduct  = $request->input('product_id')
            ? Product::find($request->input('product_id'))
            : null;

        return view('inventory-movements.create', compact('products', 'storageLocations', 'selectedProduct'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id'          => 'required|exists:products,id',
            'tipo'                => 'required|in:entrada,saida,ajuste,transferencia',
            'quantidade'          => 'required|integer|min:1',
            'motivo'              => 'nullable|string|max:255',
            'documento'           => 'nullable|string|max:100',
            'lote'                => 'nullable|string|max:50',
            'data_validade'       => 'nullable|date',
            'preco_unitario'      => 'nullable|numeric|min:0',
            'storage_location_id' => 'nullable|exists:storage_locations,id',
        ]);

        // Wrap everything in a transaction to guarantee atomicity
        DB::transaction(function () use ($data, $request) {
            $product = Product::lockForUpdate()->findOrFail($data['product_id']);

            $quantidade = (int) $data['quantidade'];
            $estoque_antes = $product->estoque_atual;

            if (in_array($data['tipo'], ['saida', 'ajuste']) && $data['tipo'] !== 'ajuste') {
                // Prevent negative inventory for saída
                if (! $product->hasSufficientStock($quantidade)) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'quantidade' => "Estoque insuficiente. Disponível: {$product->estoque_atual} {$product->unidade_medida}.",
                    ]);
                }
            }

            // Calculate signed delta
            $delta = match($data['tipo']) {
                'entrada'       =>  $quantidade,
                'saida'         => -$quantidade,
                'ajuste'        => ($request->input('ajuste_tipo') === 'reducao') ? -$quantidade : $quantidade,
                'transferencia' =>  0, // stock same location change only
            };

            // Block negative inventory absolutely
            if ($estoque_antes + $delta < 0) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'quantidade' => "Operação resultaria em estoque negativo ({$estoque_antes} + ({$delta}) < 0). Verifique a quantidade.",
                ]);
            }

            $estoque_depois = $estoque_antes + $delta;

            // Update product stock
            $product->update(['estoque_atual' => $estoque_depois]);

            // Write immutable movement record
            InventoryMovement::create([
                'product_id'          => $product->id,
                'user_id'             => auth()->id(),
                'tipo'                => $data['tipo'],
                'quantidade'          => $delta,   // signed
                'estoque_antes'       => $estoque_antes,
                'estoque_depois'      => $estoque_depois,
                'motivo'              => $data['motivo'] ?? null,
                'documento'           => $data['documento'] ?? null,
                'lote'                => $data['lote'] ?? null,
                'data_validade'       => $data['data_validade'] ?? null,
                'preco_unitario'      => $data['preco_unitario'] ?? null,
                'storage_location_id' => $data['storage_location_id'] ?? null,
            ]);
        });

        return redirect()->route('inventory-movements.index')
            ->with('success', 'Movimentação registrada com sucesso!');
    }

    public function show(InventoryMovement $inventoryMovement)
    {
        $inventoryMovement->load(['product.category', 'user', 'storageLocation']);

        return view('inventory-movements.show', compact('inventoryMovement'));
    }
}
