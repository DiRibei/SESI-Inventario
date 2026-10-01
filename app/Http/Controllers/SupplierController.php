<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::withCount('products');
        if ($search = $request->input('search')) {
            $query->where('nome', 'like', "%$search%")->orWhere('cnpj', 'like', "%$search%");
        }
        $suppliers = $query->orderBy('nome')->paginate(15)->withQueryString();
        return view('suppliers.index', compact('suppliers'));
    }

    public function create()
    {
        return view('suppliers.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nome'     => 'required|string|max:150',
            'cnpj'     => 'nullable|string|max:18|unique:suppliers,cnpj',
            'email'    => 'nullable|email|max:150',
            'telefone' => 'nullable|string|max:20',
            'contato'  => 'nullable|string|max:100',
            'endereco' => 'nullable|string',
        ]);

        Supplier::create($data + ['ativo' => true]);

        return redirect()->route('suppliers.index')
            ->with('success', 'Fornecedor cadastrado com sucesso!');
    }

    public function edit(Supplier $supplier)
    {
        return view('suppliers.edit', compact('supplier'));
    }

    public function update(Request $request, Supplier $supplier)
    {
        $data = $request->validate([
            'nome'     => 'required|string|max:150',
            'cnpj'     => "nullable|string|max:18|unique:suppliers,cnpj,{$supplier->id}",
            'email'    => 'nullable|email|max:150',
            'telefone' => 'nullable|string|max:20',
            'contato'  => 'nullable|string|max:100',
            'endereco' => 'nullable|string',
            'ativo'    => 'boolean',
        ]);

        $supplier->update($data);

        return redirect()->route('suppliers.index')
            ->with('success', 'Fornecedor atualizado com sucesso!');
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->delete();
        return redirect()->route('suppliers.index')
            ->with('success', 'Fornecedor removido com sucesso!');
    }
}
