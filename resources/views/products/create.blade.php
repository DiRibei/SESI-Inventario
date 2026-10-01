@extends('layouts.app')

@section('title', 'Novo Produto')
@section('breadcrumb', 'Produtos → Cadastrar')

@section('content')
<div class="max-w-3xl">
    <div class="card">
        <h2 class="text-base font-bold mb-6" style="color:#0a0046">Informações do Produto</h2>
        <form method="POST" action="{{ route('products.store') }}" class="space-y-5">
            @csrf

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div class="sm:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Nome do Produto <span class="text-red-500">*</span></label>
                    <input type="text" name="nome" value="{{ old('nome') }}" required
                           class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                           placeholder="Ex: Cabo Elétrico Flexível 2,5mm²">
                    @error('nome') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Código (SKU) <span class="text-red-500">*</span></label>
                    <input type="text" name="codigo" value="{{ old('codigo') }}" required
                           class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 font-mono"
                           placeholder="ELE-001">
                    @error('codigo') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Código de Barras</label>
                    <input type="text" name="codigo_barras" value="{{ old('codigo_barras') }}"
                           class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 font-mono"
                           placeholder="7891234560001">
                    @error('codigo_barras') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Categoria <span class="text-red-500">*</span></label>
                    <select name="category_id" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2">
                        <option value="">Selecione...</option>
                        @foreach($categories as $cat)
                        <option value="{{ $cat->id }}" {{ old('category_id') == $cat->id ? 'selected' : '' }}>{{ $cat->nome }}</option>
                        @endforeach
                    </select>
                    @error('category_id') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Unidade de Medida <span class="text-red-500">*</span></label>
                    <select name="unidade_medida" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2">
                        @foreach(['un'=>'Unidade (un)','kg'=>'Quilograma (kg)','lt'=>'Litro (lt)','mt'=>'Metro (mt)','cx'=>'Caixa (cx)','rl'=>'Rolo (rl)','pc'=>'Peça (pc)','pr'=>'Par (pr)','rs'=>'Resma (rs)'] as $val => $label)
                        <option value="{{ $val }}" {{ old('unidade_medida', 'un') == $val ? 'selected' : '' }}>{{ $label }}</option>
                        @endforeach
                    </select>
                    @error('unidade_medida') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Fornecedor</label>
                    <select name="supplier_id" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2">
                        <option value="">Nenhum</option>
                        @foreach($suppliers as $sup)
                        <option value="{{ $sup->id }}" {{ old('supplier_id') == $sup->id ? 'selected' : '' }}>{{ $sup->nome }}</option>
                        @endforeach
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Localização</label>
                    <select name="storage_location_id" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2">
                        <option value="">Nenhuma</option>
                        @foreach($storageLocations as $loc)
                        <option value="{{ $loc->id }}" {{ old('storage_location_id') == $loc->id ? 'selected' : '' }}>{{ $loc->codigo }} — {{ $loc->nome }}</option>
                        @endforeach
                    </select>
                </div>
            </div>

            <hr class="border-gray-100">
            <h3 class="text-sm font-semibold text-gray-600">Preços e Estoque</h3>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Preço de Custo <span class="text-red-500">*</span></label>
                    <div class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                        <input type="number" name="preco_custo" value="{{ old('preco_custo', '0.00') }}" step="0.01" min="0" required
                               class="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Preço de Venda</label>
                    <div class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                        <input type="number" name="preco_venda" value="{{ old('preco_venda') }}" step="0.01" min="0"
                               class="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Estoque Atual <span class="text-red-500">*</span></label>
                    <input type="number" name="estoque_atual" value="{{ old('estoque_atual', 0) }}" min="0" required
                           class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Estoque Mínimo <span class="text-red-500">*</span></label>
                    <input type="number" name="estoque_minimo" value="{{ old('estoque_minimo', 5) }}" min="0" required
                           class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
                <textarea name="descricao" rows="3"
                          class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 resize-none"
                          placeholder="Detalhes adicionais sobre o produto...">{{ old('descricao') }}</textarea>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
                <a href="{{ route('products.index') }}" class="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</a>
                <button type="submit" class="btn-primary px-6 py-2.5">Salvar Produto</button>
            </div>
        </form>
    </div>
</div>
@endsection
