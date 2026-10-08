@extends('layouts.app')

@section('title', 'Catálogo de Produtos')
@section('breadcrumb', 'Consulta e gerenciamento do acervo do almoxarifado')

@section('content')

<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    {{-- Search / Filter bar --}}
    <form method="GET" action="{{ route('products.index') }}" class="flex flex-1 flex-wrap gap-2.5">
        <div class="relative flex-1 min-w-48">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Buscar por código, nome ou barras..."
                   class="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white">
        </div>

        <select name="category_id" class="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
            <option value="">Todas as categorias</option>
            @foreach($categories as $cat)
            <option value="{{ $cat->id }}" {{ request('category_id') == $cat->id ? 'selected' : '' }}>{{ $cat->nome }}</option>
            @endforeach
        </select>

        <label class="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs cursor-pointer select-none">
            <input type="checkbox" name="critico" value="1" {{ request('critico') ? 'checked' : '' }} class="rounded text-blue-600 focus:ring-0">
            <span class="text-rose-600 font-semibold">⚠ Somente Críticos</span>
        </label>

        <button type="submit" class="btn-primary px-4 py-2 text-xs">Filtrar</button>
        
        @if(request()->hasAny(['search','category_id','critico']))
        <a href="{{ route('products.index') }}" class="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 bg-white hover:bg-slate-50 font-semibold">Limpar</a>
        @endif
    </form>

    @if(auth()->user()->isAdmin())
    <a href="{{ route('products.create') }}" class="btn-primary shrink-0 text-xs px-4 py-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        Novo Produto
    </a>
    @endif
</div>

<div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
            <thead class="text-slate-400 uppercase tracking-wider bg-slate-50/80 border-b border-slate-100 font-semibold">
                <tr>
                    <th class="px-5 py-3.5">Material / Produto</th>
                    <th class="px-4 py-3.5">Categoria</th>
                    <th class="px-4 py-3.5 text-center">Saldo em Estoque</th>
                    <th class="px-4 py-3.5 text-center">Status Operacional</th>
                    <th class="px-4 py-3.5 text-right">Custo Médio</th>
                    <th class="px-5 py-3.5 text-right">Ações</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
                @forelse($products as $product)
                <tr class="hover:bg-slate-50 transition-colors {{ $product->isEstoqueCritico() ? 'bg-rose-50/30' : '' }}">
                    <td class="px-5 py-4">
                        <div class="font-bold text-slate-900 text-sm">{{ $product->nome }}</div>
                        <div class="text-[11px] text-slate-400 font-mono mt-0.5">
                            SKU: <span class="font-bold text-slate-600">{{ $product->codigo }}</span>
                            @if($product->storageLocation)
                            · Local: <span class="text-blue-600 font-semibold">{{ $product->storageLocation->codigo }}</span>
                            @endif
                        </div>
                    </td>
                    <td class="px-4 py-4 whitespace-nowrap">
                        @if($product->category)
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white shadow-2xs"
                              style="background-color: {{ $product->category->cor }}">
                            {{ $product->category->nome }}
                        </span>
                        @endif
                    </td>
                    <td class="px-4 py-4 text-center whitespace-nowrap">
                        <div class="flex flex-col items-center">
                            <span class="font-mono font-extrabold text-base {{ $product->isEstoqueCritico() ? 'text-rose-600' : 'text-slate-900' }}">
                                {{ $product->estoque_atual }} {{ $product->unidade_medida }}
                            </span>
                            <span class="text-[10px] text-slate-400">mínimo: {{ $product->estoque_minimo }} {{ $product->unidade_medida }}</span>
                        </div>
                    </td>
                    <td class="px-4 py-4 text-center whitespace-nowrap">
                        @if($product->isEstoqueCritico())
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 animate-pulse">
                            ⚠ Estoque Crítico
                        </span>
                        @else
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            ✓ Saldo Adequado
                        </span>
                        @endif
                    </td>
                    <td class="px-4 py-4 text-right font-mono text-slate-700 whitespace-nowrap">
                        R$ {{ number_format($product->preco_custo, 2, ',', '.') }}
                    </td>
                    <td class="px-5 py-4 text-right whitespace-nowrap">
                        <div class="flex items-center justify-end gap-1.5">
                            {{-- View details --}}
                            <a href="{{ route('products.show', $product) }}"
                               class="text-xs px-2.5 py-1.5 rounded-lg font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                                Detalhes
                            </a>

                            {{-- Quick Movement button --}}
                            <a href="{{ route('inventory-movements.create', ['product_id' => $product->id]) }}"
                               class="text-xs px-2.5 py-1.5 rounded-lg font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                               title="Lançar Entrada ou Saída">
                                + Movimentar
                            </a>

                            @if(auth()->user()->isAdmin())
                            {{-- Edit --}}
                            <a href="{{ route('products.edit', $product) }}"
                               class="text-xs px-2.5 py-1.5 rounded-lg font-semibold border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
                                Editar
                            </a>
                            @endif
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="6" class="p-0">
                        @if(request()->hasAny(['search', 'category_id', 'critico']))
                        <x-empty-state
                            title="Nenhum produto encontrado"
                            description="Nenhum material do almoxarifado corresponde aos filtros ou termos de pesquisa aplicados."
                            actionText="Limpar Filtros"
                            :actionUrl="route('products.index')"
                        />
                        @else
                        <x-empty-state
                            title="Catálogo de Produtos Vazio"
                            description="Ainda não existem itens de estoque cadastrados no sistema do almoxarifado."
                            :actionText="auth()->user()->isAdmin() ? 'Cadastrar Primeiro Produto' : null"
                            :actionUrl="auth()->user()->isAdmin() ? route('products.create') : null"
                        />
                        @endif
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    @if($products->hasPages())
    <div class="px-6 py-4 border-t border-slate-100">
        {{ $products->links() }}
    </div>
    @endif
</div>

@endsection
