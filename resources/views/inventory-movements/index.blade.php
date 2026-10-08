@extends('layouts.app')

@section('title', 'Histórico de Movimentações')
@section('breadcrumb', 'Registro cronológico e imutável de todas as entradas, saídas e ajustes')

@section('content')

<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <form method="GET" action="{{ route('inventory-movements.index') }}" class="flex flex-1 flex-wrap gap-2.5">
        <div class="relative flex-1 min-w-48">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Nome ou código do produto..."
                   class="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white">
        </div>

        <select name="tipo" class="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
            <option value="">Todos os tipos</option>
            @foreach(['entrada' => 'Entrada (+)', 'saida' => 'Saída (-)', 'ajuste' => 'Ajuste', 'transferencia' => 'Transferência'] as $t => $label)
            <option value="{{ $t }}" {{ request('tipo') === $t ? 'selected' : '' }}>{{ $label }}</option>
            @endforeach
        </select>

        <input type="date" name="from" value="{{ request('from') }}" title="Data Inicial"
               class="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
        <input type="date" name="to" value="{{ request('to') }}" title="Data Final"
               class="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500">

        <button type="submit" class="btn-primary px-4 py-2 text-xs">Filtrar</button>

        @if(request()->hasAny(['search','tipo','from','to']))
        <a href="{{ route('inventory-movements.index') }}" class="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 bg-white hover:bg-slate-50 font-semibold">Limpar</a>
        @endif
    </form>

    <div class="flex items-center gap-2">
        <a href="{{ route('reports.index') }}" class="btn-secondary text-xs px-3.5 py-2 inline-flex items-center gap-1.5">
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Relatório
        </a>
        <a href="{{ route('inventory-movements.create') }}" class="btn-primary text-xs px-3.5 py-2 inline-flex items-center gap-1.5 shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Nova Movimentação
        </a>
    </div>
</div>

<div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
            <thead class="text-slate-400 uppercase tracking-wider bg-slate-50/80 border-b border-slate-100 font-semibold">
                <tr>
                    <th class="px-5 py-3.5">Data / Hora</th>
                    <th class="px-4 py-3.5">Material / Produto</th>
                    <th class="px-3 py-3.5">Operação</th>
                    <th class="px-3 py-3.5 text-right">Qtd</th>
                    <th class="px-4 py-3.5 text-center">Antes → Depois</th>
                    <th class="px-4 py-3.5">Responsável</th>
                    <th class="px-4 py-3.5">Documento / Justificativa</th>
                    <th class="px-4 py-3.5 text-center">Comprovante</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
                @forelse($movements as $mov)
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                        <span class="font-bold text-slate-800">{{ $mov->created_at->format('d/m/Y') }}</span>
                        <span class="text-slate-400 text-[11px] block">{{ $mov->created_at->format('H:i') }}</span>
                    </td>
                    <td class="px-4 py-3.5">
                        <p class="font-bold text-slate-900">{{ $mov->product->nome ?? 'Produto Removido' }}</p>
                        <p class="text-[11px] text-slate-400 font-mono">{{ $mov->product->codigo ?? '-' }}</p>
                    </td>
                    <td class="px-3 py-3.5 whitespace-nowrap">
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
                    <td class="px-3 py-3.5 text-right font-mono font-extrabold whitespace-nowrap {{ $mov->quantidade > 0 ? 'text-emerald-600' : 'text-rose-600' }}">
                        {{ $mov->quantidade > 0 ? '+' : '' }}{{ $mov->quantidade }} <span class="text-[10px] font-normal text-slate-400">{{ $mov->product->unidade_medida ?? '' }}</span>
                    </td>
                    <td class="px-4 py-3.5 text-center font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {{ $mov->estoque_antes }} → <strong class="text-slate-900">{{ $mov->estoque_depois }}</strong>
                    </td>
                    <td class="px-4 py-3.5 text-slate-700 whitespace-nowrap">
                        {{ $mov->user->name ?? 'Sistema' }}
                    </td>
                    <td class="px-4 py-3.5">
                        @if($mov->documento)
                        <span class="font-mono text-xs font-semibold text-slate-700 block">Doc: {{ $mov->documento }}</span>
                        @endif
                        @if($mov->motivo)
                        <p class="text-[11px] text-slate-400 truncate max-w-[200px]" title="{{ $mov->motivo }}">{{ $mov->motivo }}</p>
                        @endif
                    </td>
                    <td class="px-4 py-3.5 text-center">
                        <a href="{{ route('inventory-movements.show', $mov) }}"
                           class="text-xs px-2.5 py-1 rounded-lg font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors inline-block"
                           title="Ver Comprovante Detalhado">
                            Comprovante
                        </a>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="8" class="p-0">
                        @if(request()->hasAny(['search','tipo','from','to']))
                        <x-empty-state
                            title="Nenhuma movimentação encontrada"
                            description="Nenhum registro corresponde aos filtros ou período selecionados."
                            actionText="Limpar Filtros"
                            :actionUrl="route('inventory-movements.index')"
                        />
                        @else
                        <x-empty-state
                            title="Nenhuma movimentação registrada"
                            description="Lance entradas, saídas ou ajustes para começar a movimentar o estoque com rastreabilidade."
                            actionText="Registrar Nova Movimentação"
                            :actionUrl="route('inventory-movements.create')"
                        />
                        @endif
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    @if($movements->hasPages())
    <div class="px-6 py-4 border-t border-slate-100">
        {{ $movements->links() }}
    </div>
    @endif
</div>

@endsection
