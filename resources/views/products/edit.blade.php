@extends('layouts.app')

@section('title', 'Editar: ' . $product->nome)
@section('breadcrumb', 'Produtos → ' . $product->codigo . ' → Editar')

@section('content')
<div class="max-w-3xl">
    <div class="card">
        <h2 class="text-base font-bold mb-6" style="color:#0a0046">Editar Produto</h2>
        <form method="POST" action="{{ route('products.update', $product) }}" class="space-y-5">
            @csrf @method('PUT')

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div class="sm:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Nome do Produto <span class="text-red-500">*</span></label>
                    <input type="text" name="nome" value="{{ old('nome', $product->nome) }}" required
                           class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
                    @error('nome') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Código (SKU) <span class="text-red-500">*</span></label>
                    <input type="text" name="codigo" value="{{ old('codigo', $product->codigo) }}" required
                           class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 font-mono">
                    @error('codigo') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Código de Barras</label>
                    <input type="text" name="codigo_barras" value="{{ old('codigo_barras', $product->codigo_barras) }}"
                           class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 font-mono">
                    @error('codigo_barras') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Categoria <span class="text-red-500">*</span></label>
                    <select name="category_id" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2">
                        @foreach($categories as $cat)
                        <option value="{{ $cat->id }}" {{ old('category_id', $product->category_id) == $cat->id ? 'selected' : '' }}>{{ $cat->nome }}</option>
                        @endforeach
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Unidade de Medida <span class="text-red-500">*</span></label>
                    <select name="unidade_medida" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2">
                        @foreach(['un'=>'Unidade (un)','kg'=>'Quilograma (kg)','lt'=>'Litro (lt)','mt'=>'Metro (mt)','cx'=>'Caixa (cx)','rl'=>'Rolo (rl)','pc'=>'Peça (pc)','pr'=>'Par (pr)','rs'=>'Resma (rs)'] as $val => $label)
                        <option value="{{ $val }}" {{ old('unidade_medida', $product->unidade_medida) == $val ? 'selected' : '' }}>{{ $label }}</option>
                        @endforeach
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Fornecedor</label>
                    <select name="supplier_id" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2">
                        <option value="">Nenhum</option>
                        @foreach($suppliers as $sup)
                        <option value="{{ $sup->id }}" {{ old('supplier_id', $product->supplier_id) == $sup->id ? 'selected' : '' }}>{{ $sup->nome }}</option>
                        @endforeach
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Localização</label>
                    <select name="storage_location_id" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2">
                        <option value="">Nenhuma</option>
                        @foreach($storageLocations as $loc)
                        <option value="{{ $loc->id }}" {{ old('storage_location_id', $product->storage_location_id) == $loc->id ? 'selected' : '' }}>{{ $loc->codigo }} — {{ $loc->nome }}</option>
                        @endforeach
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                    <label class="flex items-center gap-2 cursor-pointer mt-3">
                        <input type="checkbox" name="ativo" value="1" {{ old('ativo', $product->ativo) ? 'checked' : '' }} style="accent-color:#0081fc; width:16px; height:16px;">
                        <span class="text-sm text-gray-700">Produto ativo</span>
                    </label>
                </div>
            </div>

            <hr class="border-gray-100">
            <h3 class="text-sm font-semibold text-gray-600">Preços e Estoque</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Preço de Custo <span class="text-red-500">*</span></label>
                    <div class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                        <input type="number" name="preco_custo" value="{{ old('preco_custo', $product->preco_custo) }}" step="0.01" min="0" required
                               class="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Preço de Venda</label>
                    <div class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                        <input type="number" name="preco_venda" value="{{ old('preco_venda', $product->preco_venda) }}" step="0.01" min="0"
                               class="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Estoque Mínimo <span class="text-red-500">*</span></label>
                    <input type="number" name="estoque_minimo" value="{{ old('estoque_minimo', $product->estoque_minimo) }}" min="0" required
                           class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
                    <p class="text-xs text-gray-400 mt-1">Estoque atual: <strong>{{ $product->estoque_atual }}</strong></p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Estoque Máximo</label>
                    <input type="number" name="estoque_maximo" value="{{ old('estoque_maximo', $product->estoque_maximo) }}" min="0"
                           class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
                <textarea name="descricao" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 resize-none">{{ old('descricao', $product->descricao) }}</textarea>
            </div>

            <div class="flex items-center justify-between pt-2">
                <button type="button"
                        onclick="openDeleteModal('delete-product-form', '{{ addslashes($product->nome) }}', 'Tem certeza que deseja remover este produto do catálogo ativo? O histórico de movimentações será preservado para fins de auditoria.')"
                        class="text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors inline-flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    Excluir produto
                </button>
                <div class="flex items-center gap-3">
                    <a href="{{ route('products.show', $product) }}" class="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</a>
                    <button type="submit" class="btn-primary px-6 py-2.5">Salvar Alterações</button>
                </div>
            </div>
        </form>

        {{-- Standalone delete form to prevent invalid nested form HTML --}}
        <form id="delete-product-form" method="POST" action="{{ route('products.destroy', $product) }}" class="hidden">
            @csrf
            @method('DELETE')
        </form>
    </div>
</div>
@endsection
