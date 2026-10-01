@extends('layouts.app')
@section('title', isset($category) ? 'Editar Categoria' : 'Nova Categoria')
@section('content')
<div class="max-w-lg">
<div class="card">
    <h2 class="text-base font-bold mb-6" style="color:#0a0046">{{ isset($category) ? 'Editar' : 'Nova' }} Categoria</h2>
    <form method="POST" action="{{ isset($category) ? route('categories.update', $category) : route('categories.store') }}" class="space-y-5">
        @csrf @if(isset($category)) @method('PUT') @endif
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Nome <span class="text-red-500">*</span></label>
            <input type="text" name="nome" value="{{ old('nome', $category->nome ?? '') }}" required
                   class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" placeholder="Ex: Elétrica e Eletrônica">
            @error('nome') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
            <textarea name="descricao" rows="2" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 resize-none">{{ old('descricao', $category->descricao ?? '') }}</textarea>
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Cor do Badge <span class="text-red-500">*</span></label>
            <div class="flex items-center gap-3">
                <input type="color" name="cor" value="{{ old('cor', $category->cor ?? '#2263c8') }}"
                       class="w-12 h-10 rounded-xl border border-gray-200 cursor-pointer p-1">
                <span class="text-sm text-gray-400">Escolha a cor do badge desta categoria</span>
            </div>
            @error('cor') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
        </div>
        @if(isset($category))
        <div>
            <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="ativo" value="1" {{ old('ativo', $category->ativo) ? 'checked' : '' }} style="accent-color:#0081fc; width:16px; height:16px;">
                <span class="text-sm text-gray-700">Categoria ativa</span>
            </label>
        </div>
        @endif
        <div class="flex items-center justify-end gap-3 pt-2">
            <a href="{{ route('categories.index') }}" class="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</a>
            <button type="submit" class="btn-primary px-6 py-2.5">{{ isset($category) ? 'Salvar Alterações' : 'Criar Categoria' }}</button>
        </div>
    </form>
</div>
</div>
@endsection
