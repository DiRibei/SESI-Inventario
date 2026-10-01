@extends('layouts.app')

@section('title', $product->nome)
@section('breadcrumb', 'Produtos → ' . $product->codigo)

@section('content')
<div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

    {{-- Product info card --}}
    <div class="xl:col-span-1 space-y-5">
        <div class="card">
            <div class="flex items-start justify-between mb-4">
                <div>
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white mb-2"
                          style="background-color: {{ $product->category->cor ?? '#2263c8' }}">
                        {{ $product->category->nome ?? 'Sem categoria' }}
                    </span>
                    <h2 class="text-xl font-bold" style="color:#0a0046">{{ $product->nome }}</h2>
                    <p class="text-sm text-gray-400 font-mono mt-1">{{ $product->codigo }}</p>
                </div>
                @if($product->isEstoqueCritico())
                <span class="badge-critical shrink-0">⚠ Crítico</span>
                @else
                <span class="badge-ok shrink-0">✓ OK</span>
                @endif
            </div>

            @if($product->descricao)
            <p class="text-sm text-gray-600 mb-4">{{ $product->descricao }}</p>
            @endif

            <dl class="space-y-3 text-sm">
                <div class="flex justify-between">
                    <dt class="text-gray-400">Estoque atual</dt>
                    <dd class="font-bold text-lg {{ $product->isEstoqueCritico() ? 'text-red-600' : 'text-emerald-600' }}">
                        {{ $product->estoque_atual }} {{ $product->unidade_medida }}
                    </dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-400">Estoque mínimo</dt>
                    <dd class="font-semibold">{{ $product->estoque_minimo }} {{ $product->unidade_medida }}</dd>
                </div>
                @if($product->estoque_maximo)
                <div class="flex justify-between">
                    <dt class="text-gray-400">Estoque máximo</dt>
                    <dd class="font-semibold">{{ $product->estoque_maximo }} {{ $product->unidade_medida }}</dd>
                </div>
                @endif
                <hr class="border-gray-100">
                <div class="flex justify-between">
                    <dt class="text-gray-400">Preço de custo</dt>
                    <dd class="font-semibold">R$ {{ number_format($product->preco_custo, 2, ',', '.') }}</dd>
                </div>
                @if($product->preco_venda)
                <div class="flex justify-between">
                    <dt class="text-gray-400">Preço de venda</dt>
                    <dd class="font-semibold">R$ {{ number_format($product->preco_venda, 2, ',', '.') }}</dd>
                </div>
                @endif
                <hr class="border-gray-100">
                @if($product->supplier)
                <div class="flex justify-between">
                    <dt class="text-gray-400">Fornecedor</dt>
                    <dd class="text-right">{{ $product->supplier->nome }}</dd>
                </div>
                @endif
                @if($product->storageLocation)
                <div class="flex justify-between">
                    <dt class="text-gray-400">Localização</dt>
                    <dd class="font-mono text-xs">{{ $product->storageLocation->codigo }}</dd>
                </div>
                @endif
            </dl>

            <div class="flex gap-2 mt-6">
                <a href="{{ route('products.edit', $product) }}"
                   class="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                   Editar
                </a>
                <a href="{{ route('inventory-movements.create', ['product_id' => $product->id]) }}"
                   class="flex-1 btn-primary text-center py-2.5 justify-center">
                   Movimentar
                </a>
            </div>
        </div>
    </div>

    {{-- Movements history --}}
    <div class="xl:col-span-2">
        <div class="card p-0 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100">
                <h3 class="font-semibold text-sm" style="color:#0a0046">Histórico de Movimentações</h3>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr style="background:#0a0046;">
                            <th class="text-left px-6 py-3 text-white/70 text-xs font-semibold uppercase tracking-wider">Data</th>
                            <th class="text-left px-4 py-3 text-white/70 text-xs font-semibold uppercase tracking-wider">Tipo</th>
                            <th class="text-right px-4 py-3 text-white/70 text-xs font-semibold uppercase tracking-wider">Qty</th>
                            <th class="text-right px-4 py-3 text-white/70 text-xs font-semibold uppercase tracking-wider">Antes → Depois</th>
                            <th class="text-left px-6 py-3 text-white/70 text-xs font-semibold uppercase tracking-wider">Usuário / Motivo</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        @forelse($movements as $mov)
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-3 text-gray-500 text-xs whitespace-nowrap">{{ $mov->created_at->format('d/m/Y H:i') }}</td>
                            <td class="px-4 py-3"><span class="badge-{{ $mov->tipo }}">{{ ucfirst($mov->tipo) }}</span></td>
                            <td class="px-4 py-3 text-right font-mono font-bold {{ $mov->quantidade > 0 ? 'text-emerald-600' : 'text-red-600' }}">
                                {{ $mov->quantidade > 0 ? '+' : '' }}{{ $mov->quantidade }}
                            </td>
                            <td class="px-4 py-3 text-right font-mono text-xs text-gray-500">
                                {{ $mov->estoque_antes }} → <span class="font-semibold text-gray-700">{{ $mov->estoque_depois }}</span>
                            </td>
                            <td class="px-6 py-3">
                                <p class="font-medium text-gray-700 text-xs">{{ $mov->user->name }}</p>
                                @if($mov->motivo)<p class="text-gray-400 text-xs truncate max-w-[200px]">{{ $mov->motivo }}</p>@endif
                                @if($mov->documento)<p class="text-gray-400 text-xs font-mono">{{ $mov->documento }}</p>@endif
                            </td>
                        </tr>
                        @empty
                        <tr><td colspan="5" class="px-6 py-10 text-center text-gray-400 text-sm">Sem movimentações ainda.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            @if($movements->hasPages())
            <div class="px-6 py-4 border-t border-gray-100">{{ $movements->links() }}</div>
            @endif
        </div>
    </div>
</div>
@endsection
