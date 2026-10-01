@extends('layouts.app')

@section('title', 'Comprovante de Movimentação #' . $inventoryMovement->id)
@section('breadcrumb', 'Detalhes e registro de auditoria da movimentação')

@section('content')
<div class="max-w-3xl mx-auto">

    <div class="mb-5 flex items-center justify-between no-print">
        <a href="{{ route('inventory-movements.index') }}" class="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Voltar para Movimentações
        </a>
        <div class="flex items-center gap-2">
            <button onclick="window.print()" class="btn-secondary text-xs px-3.5 py-1.5 inline-flex items-center gap-1.5">
                <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                Imprimir Comprovante
            </button>
            <a href="{{ route('inventory-movements.create', ['product_id' => $inventoryMovement->product_id]) }}" class="btn-primary text-xs px-3.5 py-1.5 inline-flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                Nova Movimentação
            </a>
        </div>
    </div>

    {{-- Official Receipt Card --}}
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {{-- Receipt Header --}}
        <div class="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
             style="background: linear-gradient(135deg, rgba(10, 0, 70, 0.03), rgba(0, 129, 252, 0.05));">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md shrink-0"
                     style="background: linear-gradient(135deg, #0081fc, #0a0046);">
                    S
                </div>
                <div>
                    <h2 class="text-base font-extrabold text-slate-900 leading-tight">Comprovante de Movimentação de Estoque</h2>
                    <p class="text-xs text-slate-500">Sistema Inteligente de Gerenciamento de Inventário · SENAI</p>
                </div>
            </div>
            <div class="sm:text-right">
                <div class="text-xs font-mono font-bold text-slate-400">REGISTRO AUDITADO</div>
                <div class="text-lg font-mono font-extrabold" style="color: #0081fc;">#{{ str_pad($inventoryMovement->id, 6, '0', STR_PAD_LEFT) }}</div>
                <div class="text-xs text-slate-500">{{ $inventoryMovement->created_at->format('d/m/Y \à\s H:i:s') }}</div>
            </div>
        </div>

        {{-- Movement Main Status Bar --}}
        <div class="grid grid-cols-1 sm:grid-cols-3 border-b border-slate-100 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50/50">
            <div class="p-5 text-center">
                <span class="text-xs text-slate-400 font-semibold uppercase">Tipo de Operação</span>
                <div class="mt-1">
                    @if($inventoryMovement->tipo === 'entrada')
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        Entrada de Material
                    </span>
                    @elseif($inventoryMovement->tipo === 'saida')
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                        Saída / Requisição
                    </span>
                    @elseif($inventoryMovement->tipo === 'ajuste')
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        Ajuste de Inventário
                    </span>
                    @else
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        Transferência
                    </span>
                    @endif
                </div>
            </div>

            <div class="p-5 text-center">
                <span class="text-xs text-slate-400 font-semibold uppercase">Quantidade Movimentada</span>
                <div class="mt-1 text-2xl font-mono font-extrabold {{ $inventoryMovement->quantidade > 0 ? 'text-emerald-600' : 'text-rose-600' }}">
                    {{ $inventoryMovement->quantidade > 0 ? '+' : '' }}{{ $inventoryMovement->quantidade }}
                    <span class="text-xs font-normal text-slate-500">{{ $inventoryMovement->product->unidade_medida ?? 'UN' }}</span>
                </div>
            </div>

            <div class="p-5 text-center">
                <span class="text-xs text-slate-400 font-semibold uppercase">Impacto no Estoque</span>
                <div class="mt-1 text-sm font-mono font-semibold text-slate-700">
                    <span class="text-slate-400">{{ $inventoryMovement->estoque_antes }}</span>
                    <span class="mx-1 text-slate-400">→</span>
                    <span class="font-bold text-slate-900">{{ $inventoryMovement->estoque_depois }} {{ $inventoryMovement->product->unidade_medida ?? 'UN' }}</span>
                </div>
            </div>
        </div>

        {{-- Details Sections --}}
        <div class="p-6 sm:p-8 space-y-6">
            
            {{-- Product Info --}}
            <div>
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Item do Inventário</h3>
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                {{ $inventoryMovement->product->codigo }}
                            </span>
                            @if($inventoryMovement->product->category)
                            <span class="text-xs font-medium text-slate-500">
                                {{ $inventoryMovement->product->category->nome }}
                            </span>
                            @endif
                        </div>
                        <h4 class="text-base font-bold text-slate-900 mt-1">{{ $inventoryMovement->product->nome }}</h4>
                        @if($inventoryMovement->product->descricao)
                        <p class="text-xs text-slate-500 mt-0.5">{{ $inventoryMovement->product->descricao }}</p>
                        @endif
                    </div>
                    <div class="sm:text-right shrink-0">
                        <a href="{{ route('products.show', $inventoryMovement->product) }}" class="text-xs font-semibold text-blue-600 hover:text-blue-800 no-print">
                            Ficha do Produto →
                        </a>
                    </div>
                </div>
            </div>

            {{-- Complementary Details Grid --}}
            <div>
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Dados Complementares</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    
                    <div class="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                        <span class="text-slate-400 font-semibold">Documento / Nota Fiscal:</span>
                        <p class="font-mono font-bold text-slate-800 mt-0.5">{{ $inventoryMovement->documento ?: 'Não informado' }}</p>
                    </div>

                    <div class="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                        <span class="text-slate-400 font-semibold">Local de Armazenamento:</span>
                        <p class="font-bold text-slate-800 mt-0.5">
                            {{ $inventoryMovement->storageLocation ? $inventoryMovement->storageLocation->codigo . ' - ' . $inventoryMovement->storageLocation->nome : ($inventoryMovement->product->storageLocation->codigo ?? 'Não especificado') }}
                        </p>
                    </div>

                    <div class="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                        <span class="text-slate-400 font-semibold">Lote do Fabricante:</span>
                        <p class="font-mono font-medium text-slate-800 mt-0.5">{{ $inventoryMovement->lote ?: 'N/A' }}</p>
                    </div>

                    <div class="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                        <span class="text-slate-400 font-semibold">Data de Validade:</span>
                        <p class="font-medium text-slate-800 mt-0.5">
                            {{ $inventoryMovement->data_validade ? $inventoryMovement->data_validade->format('d/m/Y') : 'N/A' }}
                        </p>
                    </div>

                    <div class="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                        <span class="text-slate-400 font-semibold">Preço Unitário na Operação:</span>
                        <p class="font-mono font-bold text-slate-800 mt-0.5">
                            R$ {{ number_format($inventoryMovement->preco_unitario ?? $inventoryMovement->product->preco_custo ?? 0, 2, ',', '.') }}
                        </p>
                    </div>

                    <div class="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                        <span class="text-slate-400 font-semibold">Valor Total da Operação:</span>
                        @php
                            $preco = $inventoryMovement->preco_unitario ?? $inventoryMovement->product->preco_custo ?? 0;
                            $valTotal = abs($inventoryMovement->quantidade) * $preco;
                        @endphp
                        <p class="font-mono font-extrabold text-slate-900 mt-0.5">
                            R$ {{ number_format($valTotal, 2, ',', '.') }}
                        </p>
                    </div>

                    @if($inventoryMovement->motivo)
                    <div class="sm:col-span-2 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                        <span class="text-slate-400 font-semibold">Motivo / Observação:</span>
                        <p class="text-slate-800 mt-0.5 whitespace-pre-line">{{ $inventoryMovement->motivo }}</p>
                    </div>
                    @endif

                </div>
            </div>

            {{-- Audit Section --}}
            <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
                <div>
                    <span class="text-slate-400 font-semibold">Operador Responsável:</span>
                    <span class="font-bold text-slate-800 ml-1">{{ $inventoryMovement->user->name ?? 'Sistema' }}</span>
                    <span class="text-slate-400">({{ $inventoryMovement->user->email ?? 'N/A' }})</span>
                </div>
                <div class="text-slate-400">
                    Registro imutável criado em {{ $inventoryMovement->created_at->format('d/m/Y H:i:s') }}
                </div>
            </div>

            {{-- Signature line for print --}}
            <div class="hidden print-only pt-16">
                <div class="grid grid-cols-2 gap-12 text-center text-xs">
                    <div>
                        <div class="border-t border-slate-900 w-3/4 mx-auto mb-1"></div>
                        <p class="font-bold">{{ $inventoryMovement->user->name ?? 'Responsável Almoxarifado' }}</p>
                        <p class="text-slate-500">Operador / Almoxarife</p>
                    </div>
                    <div>
                        <div class="border-t border-slate-900 w-3/4 mx-auto mb-1"></div>
                        <p class="font-bold">Assinatura do Solicitante / Recebedor</p>
                        <p class="text-slate-500">Departamento Solicitante</p>
                    </div>
                </div>
            </div>

        </div>

    </div>

</div>
@endsection
