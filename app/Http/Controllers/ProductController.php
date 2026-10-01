<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\StorageLocation;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'supplier', 'storageLocation'])->ativo();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nome', 'like', "%$search%")
                  ->orWhere('codigo', 'like', "%$search%")
                  ->orWhere('codigo_barras', 'like', "%$search%");
            });
        }

        if ($cat = $request->input('category_id')) {
            $query->where('category_id', $cat);
        }

        if ($request->input('critico') === '1') {
            $query->estoqueCritico();
        }

        $products   = $query->orderBy('nome')->paginate(15)->withQueryString();
        $categories = Category::ativo()->orderBy('nome')->get();

        return view('products.index', compact('products', 'categories'));
    }

    public function create()
    {
        $categories      = Category::ativo()->orderBy('nome')->get();
        $suppliers       = Supplier::ativo()->orderBy('nome')->get();
        $storageLocations = StorageLocation::ativo()->orderBy('nome')->get();

        return view('products.create', compact('categories', 'suppliers', 'storageLocations'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nome'                => 'required|string|max:200',
            'codigo'              => 'required|string|max:50|unique:products,codigo',
            'codigo_barras'       => 'nullable|string|max:50|unique:products,codigo_barras',
            'descricao'           => 'nullable|string',
            'unidade_medida'      => 'required|string|max:20',
            'preco_custo'         => 'required|numeric|min:0',
            'preco_venda'         => 'nullable|numeric|min:0',
            'estoque_atual'       => 'required|integer|min:0',
            'estoque_minimo'      => 'required|integer|min:0',
            'estoque_maximo'      => 'nullable|integer|min:0',
            'category_id'         => 'required|exists:categories,id',
            'supplier_id'         => 'nullable|exists:suppliers,id',
            'storage_location_id' => 'nullable|exists:storage_locations,id',
        ]);

        Product::create($data + ['ativo' => true]);

        return redirect()->route('products.index')
            ->with('success', 'Produto cadastrado com sucesso!');
    }

    public function show(Product $product)
    {
        $product->load(['category', 'supplier', 'storageLocation', 'inventoryMovements.user']);
        $movements = $product->inventoryMovements()->with('user')->latest()->paginate(10);

        return view('products.show', compact('product', 'movements'));
    }

    public function edit(Product $product)
    {
        $categories      = Category::ativo()->orderBy('nome')->get();
        $suppliers       = Supplier::ativo()->orderBy('nome')->get();
        $storageLocations = StorageLocation::ativo()->orderBy('nome')->get();

        return view('products.edit', compact('product', 'categories', 'suppliers', 'storageLocations'));
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'nome'                => 'required|string|max:200',
            'codigo'              => "required|string|max:50|unique:products,codigo,{$product->id}",
            'codigo_barras'       => "nullable|string|max:50|unique:products,codigo_barras,{$product->id}",
            'descricao'           => 'nullable|string',
            'unidade_medida'      => 'required|string|max:20',
            'preco_custo'         => 'required|numeric|min:0',
            'preco_venda'         => 'nullable|numeric|min:0',
            'estoque_minimo'      => 'required|integer|min:0',
            'estoque_maximo'      => 'nullable|integer|min:0',
            'category_id'         => 'required|exists:categories,id',
            'supplier_id'         => 'nullable|exists:suppliers,id',
            'storage_location_id' => 'nullable|exists:storage_locations,id',
            'ativo'               => 'boolean',
        ]);

        $product->update($data);

        return redirect()->route('products.show', $product)
            ->with('success', 'Produto atualizado com sucesso!');
    }

    public function destroy(Product $product)
    {
        $product->delete(); // soft delete

        return redirect()->route('products.index')
            ->with('success', 'Produto removido com sucesso!');
    }
}
