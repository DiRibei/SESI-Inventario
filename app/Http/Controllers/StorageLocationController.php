<?php

namespace App\Http\Controllers;

use App\Models\StorageLocation;
use Illuminate\Http\Request;

class StorageLocationController extends Controller
{
    public function index()
    {
        $locations = StorageLocation::withCount('products')->orderBy('nome')->paginate(15);
        return view('storage-locations.index', compact('locations'));
    }

    public function create()
    {
        return view('storage-locations.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nome'      => 'required|string|max:100',
            'codigo'    => 'required|string|max:30|unique:storage_locations,codigo',
            'descricao' => 'nullable|string',
            'tipo'      => 'required|in:galpao,prateleira,armario,sala,externo',
        ]);

        StorageLocation::create($data + ['ativo' => true]);

        return redirect()->route('storage-locations.index')
            ->with('success', 'Localização cadastrada com sucesso!');
    }

    public function edit(StorageLocation $storageLocation)
    {
        return view('storage-locations.edit', compact('storageLocation'));
    }

    public function update(Request $request, StorageLocation $storageLocation)
    {
        $data = $request->validate([
            'nome'      => 'required|string|max:100',
            'codigo'    => "required|string|max:30|unique:storage_locations,codigo,{$storageLocation->id}",
            'descricao' => 'nullable|string',
            'tipo'      => 'required|in:galpao,prateleira,armario,sala,externo',
            'ativo'     => 'boolean',
        ]);

        $storageLocation->update($data);

        return redirect()->route('storage-locations.index')
            ->with('success', 'Localização atualizada com sucesso!');
    }

    public function destroy(StorageLocation $storageLocation)
    {
        $storageLocation->delete();
        return redirect()->route('storage-locations.index')
            ->with('success', 'Localização removida com sucesso!');
    }
}
