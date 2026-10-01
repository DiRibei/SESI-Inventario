@extends('layouts.app')

@section('title', 'Produtos')
@section('breadcrumb', 'Gerenciamento de produtos')

@section('content')

<div class="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
    {{-- Search / Filter bar --}}
    <form method="GET" action="{{ route('products.index') }}" class="flex flex-1 flex-wrap gap-3">
        <div class="relative flex-1 min-w-48">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Nome, código, código de barras..."
                   class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                   style="--tw-ring-color:#0081fc;">
        </div>
        <select name="category_id" class="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2" style="min-width:160px;">
            <option value="">Todas as categorias</option>
            @foreach($categories as $cat)
            <option value="{{ $cat->id }}" {{ request('category_id') == $cat->id ? 'selected' : '' }}>{{ $cat->nome }}</option>
            @endforeach
        </select>
        <label class="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm cursor-pointer">
            <input type="checkbox" name="critico" value="1" {{ request('critico') ? 'checked' : '' }} style="accent-color:#0081fc;">
            <span class="text-red-600 font-medium">Somente críticos</span>
        </label>
        <button type="submit" class="btn-primary px-4 py-2.5">Filtrar</button>
        @if(request()->hasAny(['search','category_id','critico']))
        <a href="{{ route('products.index') }}" class="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 bg-white hover:bg-gray-50">Limpar</a>
        @endif
    </form>

    <a href="{{ route('products.create') }}" class="btn-primary shrink-0">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        Novo Produto
    </a>
</div>

<div class="card p-0 overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full text-sm">
            <thead>
                <tr style="background:#0a0046;">
                    <th class="text-left px-6 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Produto</th>
                    <th class="text-left px-4 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Categoria</th>
                    <th class="text-center px-4 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Estoque</th>
                    <th class="text-center px-4 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Status</th>
                    <th class="text-right px-4 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Custo</th>
                    <th class="text-right px-6 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Ações</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
                @forelse($products as $product)
                <tr class="hover:bg-gray-50 transition-colors {{ $product->isEstoqueCritico() ? 'bg-red-50/30' : '' }}">
                    <td class="px-6 py-4">
                        <p class="font-semibold text-gray-800">{{ $product->nome }}</p>
                        <p class="text-xs text-gray-400 font-mono">{{ $product->codigo }}
                            @if($product->storageLocation)
                            · <span class="text-gray-500">{{ $product->storageLocation->codigo }}</span>
                            @endif
                        </p>
                    </td>
                    <td class="px-4 py-4">
                        @if($product->category)
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                              style="background-color: {{ $product->category->cor }}">
                            {{ $product->category->nome }}
                        </span>
                        @endif
                    </td>
                    <td class="px-4 py-4 text-center">
                        <div class="flex flex-col items-center">
                            <span class="font-bold text-base {{ $product->isEstoqueCritico() ? 'text-red-600' : 'text-gray-800' }}">
                                {{ $product->estoque_atual }}
                            </span>
                            <span class="text-xs text-gray-400">mín {{ $product->estoque_minimo }} {{ $product->unidade_medida }}</span>
                        </div>
                    </td>
                    <td class="px-4 py-4 text-center">
                        @if($product->isEstoqueCritico())
                        <span class="badge-critical">⚠ Crítico</span>
                        @else
                        <span class="badge-ok">✓ OK</span>
                        @endif
                    </td>
                    <td class="px-4 py-4 text-right text-gray-600">
                        R$ {{ number_format($product->preco_custo, 2, ',', '.') }}
                    </td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                            <a href="{{ route('products.show', $product) }}"
                               class="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                               style="background:#0081fc15; color:#0081fc;"
                               onmouseover="this.style.background='#0081fc25'" onmouseout="this.style.background='#0081fc15'">
                               Ver
                            </a>
                            <a href="{{ route('products.edit', $product) }}"
                               class="text-xs px-3 py-1.5 rounded-lg font-medium border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors">
                               Editar
                            </a>
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="6" class="px-6 py-16 text-center text-gray-400">
                        <svg class="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                        </svg>
                        <p class="font-medium text-gray-500">Nenhum produto encontrado</p>
                        <p class="text-sm mt-1">Tente ajustar os filtros ou <a href="{{ route('products.create') }}" style="color:#0081fc">cadastre um produto</a>.</p>
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    @if($products->hasPages())
    <div class="px-6 py-4 border-t border-gray-100">
        {{ $products->links() }}
    </div>
    @endif
</div>

@endsection
