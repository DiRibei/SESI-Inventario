@extends('layouts.app')

@section('title', $product->nome)
@section('breadcrumb', 'Produtos → ' . $product->codigo)

@section('content')

<div class="mb-4">
    <a href="{{ route('products.index') }}" class="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Voltar para a Lista de Produtos
    </a>
</div>

<div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

    {{-- Product info card --}}
    <div class="xl:col-span-1 space-y-5">
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <div class="flex items-start justify-between gap-3 mb-4">
                <div>
                    @if($product->category)
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white mb-2"
                          style="background-color: {{ $product->category->cor }}">
                        {{ $product->category->nome }}
                    </span>
                    @endif
                    <h2 class="text-lg font-extrabold text-slate-900 leading-tight">{{ $product->nome }}</h2>
                    <p class="text-xs text-slate-400 font-mono mt-1">Código / SKU: {{ $product->codigo }}</p>
                </div>
                @if($product->isEstoqueCritico())
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 animate-pulse shrink-0">
                    ⚠ Crítico
                </span>
                @else
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 shrink-0">
                    ✓ OK
                </span>
                @endif
            </div>

            @if($product->descricao)
            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 mb-5 leading-relaxed">
                {{ $product->descricao }}
            </div>
            @endif

            <dl class="space-y-3 text-xs">
                <div class="flex justify-between items-center py-1">
                    <dt class="text-slate-400 font-medium">Saldo Atual em Estoque</dt>
                    <dd class="font-mono font-extrabold text-lg {{ $product->isEstoqueCritico() ? 'text-rose-600' : 'text-emerald-600' }}">
                        {{ $product->estoque_atual }} {{ $product->unidade_medida }}
                    </dd>
                </div>
                <div class="flex justify-between items-center py-1 border-t border-slate-100">
                    <dt class="text-slate-400 font-medium">Estoque Mínimo de Segurança</dt>
                    <dd class="font-mono font-bold text-slate-700">{{ $product->estoque_minimo }} {{ $product->unidade_medida }}</dd>
                </div>
                @if($product->estoque_maximo)
                <div class="flex justify-between items-center py-1 border-t border-slate-100">
                    <dt class="text-slate-400 font-medium">Estoque Máximo Recomendado</dt>
                    <dd class="font-mono font-bold text-slate-700">{{ $product->estoque_maximo }} {{ $product->unidade_medida }}</dd>
                </div>
                @endif
                <div class="flex justify-between items-center py-1 border-t border-slate-100">
                    <dt class="text-slate-400 font-medium">Preço de Custo Unitário</dt>
                    <dd class="font-mono font-bold text-slate-800">R$ {{ number_format($product->preco_custo, 2, ',', '.') }}</dd>
                </div>
                <div class="flex justify-between items-center py-1 border-t border-slate-100">
                    <dt class="text-slate-400 font-medium">Valor Total Imobilizado</dt>
                    <dd class="font-mono font-extrabold text-slate-900">
                        R$ {{ number_format($product->estoque_atual * $product->preco_custo, 2, ',', '.') }}
                    </dd>
                </div>
                @if($product->preco_venda)
                <div class="flex justify-between items-center py-1 border-t border-slate-100">
                    <dt class="text-slate-400 font-medium">Preço de Venda / Repasse</dt>
                    <dd class="font-mono font-bold text-slate-800">R$ {{ number_format($product->preco_venda, 2, ',', '.') }}</dd>
                </div>
                @endif
                @if($product->supplier)
                <div class="flex justify-between items-center py-1 border-t border-slate-100">
                    <dt class="text-slate-400 font-medium">Fornecedor Homologado</dt>
                    <dd class="text-right font-medium text-slate-700">{{ $product->supplier->nome }}</dd>
                </div>
                @endif
                @if($product->storageLocation)
                <div class="flex justify-between items-center py-1 border-t border-slate-100">
                    <dt class="text-slate-400 font-medium">Localização Física</dt>
                    <dd class="font-mono font-bold text-blue-600">{{ $product->storageLocation->codigo }} ({{ $product->storageLocation->nome }})</dd>
                </div>
                @endif
            </dl>

            <div class="flex flex-col sm:flex-row gap-2 mt-6 pt-5 border-t border-slate-100">
                <a href="{{ route('inventory-movements.create', ['product_id' => $product->id]) }}"
                   class="btn-primary flex-1 justify-center py-2.5 text-xs shadow-xs">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                    Movimentar Estoque
                </a>

                @if(auth()->user()->isAdmin())
                <a href="{{ route('products.edit', $product) }}"
                   class="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-center">
                    Editar Cadastro
                </a>
                @endif
            </div>
        </div>
    </div>

    {{-- Movements history table --}}
    <div class="xl:col-span-2">
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden h-full flex flex-col">
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 class="font-bold text-sm text-slate-800">Histórico de Movimentações deste Produto</h3>
                <span class="text-xs font-semibold text-slate-400 font-mono">{{ $movements->total() }} registro(s)</span>
            </div>
            
            <div class="overflow-x-auto flex-1">
                <table class="w-full text-xs text-left">
                    <thead class="text-slate-400 uppercase tracking-wider bg-slate-50/80 border-b border-slate-100 font-semibold">
                        <tr>
                            <th class="px-5 py-3">Data / Hora</th>
                            <th class="px-3 py-3">Operação</th>
                            <th class="px-3 py-3 text-right">Qtd</th>
                            <th class="px-4 py-3 text-center">Antes → Depois</th>
                            <th class="px-4 py-3">Responsável & Motivo</th>
                            <th class="px-3 py-3 text-center">Comprovante</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-medium">
                        @forelse($movements as $mov)
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="px-5 py-3 text-slate-500 whitespace-nowrap">
                                {{ $mov->created_at->format('d/m/Y H:i') }}
                            </td>
                            <td class="px-3 py-3 whitespace-nowrap">
                                @if($mov->tipo === 'entrada')
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Entrada</span>
                                @elseif($mov->tipo === 'saida')
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">Saída</span>
                                @elseif($mov->tipo === 'ajuste')
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Ajuste</span>
                                @else
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">{{ ucfirst($mov->tipo) }}</span>
                                @endif
                            </td>
                            <td class="px-3 py-3 text-right font-mono font-bold {{ $mov->quantidade > 0 ? 'text-emerald-600' : 'text-rose-600' }}">
                                {{ $mov->quantidade > 0 ? '+' : '' }}{{ $mov->quantidade }}
                            </td>
                            <td class="px-4 py-3 text-center font-mono text-[11px] text-slate-500 whitespace-nowrap">
                                {{ $mov->estoque_antes }} → <strong class="text-slate-800">{{ $mov->estoque_depois }}</strong>
                            </td>
                            <td class="px-4 py-3">
                                <p class="font-bold text-slate-700 text-xs">{{ $mov->user->name ?? 'Sistema' }}</p>
                                @if($mov->motivo)<p class="text-slate-400 text-[11px] truncate max-w-[220px]">{{ $mov->motivo }}</p>@endif
                                @if($mov->documento)<p class="text-slate-400 text-[10px] font-mono">Doc: {{ $mov->documento }}</p>@endif
                            </td>
                            <td class="px-3 py-3 text-center">
                                <a href="{{ route('inventory-movements.show', $mov) }}"
                                   class="text-blue-600 hover:text-blue-800 p-1 font-semibold text-xs"
                                   title="Ver Comprovante">
                                    Ver
                                </a>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="6" class="px-6 py-12 text-center text-slate-400 text-xs">
                                Nenhuma movimentação registrada para este item ainda.
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            @if($movements->hasPages())
            <div class="px-6 py-3 border-t border-slate-100">
                {{ $movements->links() }}
            </div>
            @endif
        </div>
    </div>

</div>

@endsection
