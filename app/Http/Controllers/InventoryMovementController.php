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
            $estoque_antes = (int) $product->estoque_atual;

            // Strict Business Rule 1: Prevent negative inventory on Saída
            if ($data['tipo'] === 'saida') {
                if (! $product->hasSufficientStock($quantidade)) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'quantidade' => "Estoque insuficiente para \"{$product->nome}\". Saldo atual disponível: {$product->estoque_atual} {$product->unidade_medida}. A quantidade solicitada ({$quantidade}) geraria saldo negativo.",
                    ]);
                }
            }

            // Strict Business Rule 2: Prevent negative inventory on Ajuste (redução)
            if ($data['tipo'] === 'ajuste' && $request->input('ajuste_tipo') === 'reducao') {
                if (! $product->hasSufficientStock($quantidade)) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'quantidade' => "Redução de inventário inválida para \"{$product->nome}\". O corte de {$quantidade} {$product->unidade_medida} é maior que o saldo em estoque ({$product->estoque_atual} {$product->unidade_medida}).",
                    ]);
                }
            }

            // Calculate signed delta
            $delta = match($data['tipo']) {
                'entrada'       =>  $quantidade,
                'saida'         => -$quantidade,
                'ajuste'        => ($request->input('ajuste_tipo') === 'reducao') ? -$quantidade : $quantidade,
                'transferencia' =>  0, // stock quantity remains unchanged, physical location is updated
            };

            $estoque_depois = $estoque_antes + $delta;

            // Strict Business Rule 3: Global safety check to absolutely prevent negative inventory
            if ($estoque_depois < 0) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'quantidade' => "Operação não autorizada: o saldo final resultaria em valor negativo ({$estoque_depois} {$product->unidade_medida}).",
                ]);
            }

            // Update product stock and optionally storage location on transfer
            $updateData = ['estoque_atual' => $estoque_depois];
            if ($data['tipo'] === 'transferencia' && !empty($data['storage_location_id'])) {
                $updateData['storage_location_id'] = $data['storage_location_id'];
            }
            $product->update($updateData);

            // Write immutable movement record for audit
            InventoryMovement::create([
                'product_id'          => $product->id,
                'user_id'             => auth()->id(),
                'tipo'                => $data['tipo'],
                'quantidade'          => $delta,   // signed delta (+/-)
                'estoque_antes'       => $estoque_antes,
                'estoque_depois'      => $estoque_depois,
                'motivo'              => $data['motivo'] ?? null,
                'documento'           => $data['documento'] ?? null,
                'lote'                => $data['lote'] ?? null,
                'data_validade'       => $data['data_validade'] ?? null,
                'preco_unitario'      => $data['preco_unitario'] ?? null,
                'storage_location_id' => $data['storage_location_id'] ?? $product->storage_location_id,
            ]);
        });

        return redirect()->route('inventory-movements.index')
            ->with('success', 'Movimentação registrada com sucesso no almoxarifado!');
    }

    public function show(InventoryMovement $inventoryMovement)
    {
        $inventoryMovement->load(['product.category', 'user', 'storageLocation']);

        return view('inventory-movements.show', compact('inventoryMovement'));
    }
}
