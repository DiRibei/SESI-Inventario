@extends('layouts.app')
@section('title', 'Editar Localização')
@section('content')
<div class="max-w-lg"><div class="card">
    <h2 class="text-base font-bold mb-6" style="color:#0a0046">Editar Localização</h2>
    <form method="POST" action="{{ route('storage-locations.update', $storageLocation) }}" class="space-y-5">
        @csrf @method('PUT')
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Nome <span class="text-red-500">*</span></label>
            <input type="text" name="nome" value="{{ old('nome', $storageLocation->nome) }}" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Código <span class="text-red-500">*</span></label>
            <input type="text" name="codigo" value="{{ old('codigo', $storageLocation->codigo) }}" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2">
            @error('codigo') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Tipo <span class="text-red-500">*</span></label>
            <select name="tipo" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2">
                @foreach(['galpao'=>'Galpão','prateleira'=>'Prateleira','armario'=>'Armário','sala'=>'Sala','externo'=>'Externo'] as $val => $label)
                <option value="{{ $val }}" {{ old('tipo', $storageLocation->tipo) === $val ? 'selected' : '' }}>{{ $label }}</option>
                @endforeach
            </select>
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
            <input type="text" name="descricao" value="{{ old('descricao', $storageLocation->descricao) }}" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
        </div>
        <div class="flex items-center justify-end gap-3 pt-2">
            <a href="{{ route('storage-locations.index') }}" class="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</a>
            <button type="submit" class="btn-primary px-6 py-2.5">Salvar</button>
        </div>
    </form>
</div></div>
@endsection
