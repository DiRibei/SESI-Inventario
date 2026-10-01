@extends('layouts.app')

@section('title', 'Movimentações de Estoque')
@section('breadcrumb', 'Histórico completo de movimentações')

@section('content')

<div class="flex flex-col sm:flex-row gap-4 mb-6">
    <form method="GET" action="{{ route('inventory-movements.index') }}" class="flex flex-1 flex-wrap gap-3">
        <div class="relative flex-1 min-w-48">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Nome ou código do produto..."
                   class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white">
        </div>
        <select name="tipo" class="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2">
            <option value="">Todos os tipos</option>
            @foreach(['entrada','saida','ajuste','transferencia'] as $t)
            <option value="{{ $t }}" {{ request('tipo') === $t ? 'selected' : '' }}>{{ ucfirst($t) }}</option>
            @endforeach
        </select>
        <input type="date" name="from" value="{{ request('from') }}" class="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2">
        <input type="date" name="to" value="{{ request('to') }}" class="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2">
        <button type="submit" class="btn-primary px-4 py-2.5">Filtrar</button>
        @if(request()->hasAny(['search','tipo','from','to']))
        <a href="{{ route('inventory-movements.index') }}" class="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 bg-white hover:bg-gray-50">Limpar</a>
        @endif
    </form>

    <a href="{{ route('inventory-movements.create') }}" class="btn-primary shrink-0">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        Nova Movimentação
    </a>
</div>

<div class="card p-0 overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full text-sm">
            <thead>
                <tr style="background:#0a0046;">
                    <th class="text-left px-6 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Data</th>
                    <th class="text-left px-4 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Produto</th>
                    <th class="text-left px-4 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Tipo</th>
                    <th class="text-right px-4 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Qty</th>
                    <th class="text-right px-4 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Estoque</th>
                    <th class="text-left px-4 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Usuário</th>
                    <th class="text-left px-6 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Documento</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
                @forelse($movements as $mov)
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                        {{ $mov->created_at->format('d/m/Y') }}<br>
                        <span class="text-gray-400">{{ $mov->created_at->format('H:i') }}</span>
                    </td>
                    <td class="px-4 py-3.5">
                        <p class="font-medium text-gray-800">{{ $mov->product->nome }}</p>
                        <p class="text-xs text-gray-400 font-mono">{{ $mov->product->codigo }}</p>
                    </td>
                    <td class="px-4 py-3.5">
                        <span class="badge-{{ $mov->tipo }}">{{ ucfirst($mov->tipo) }}</span>
                    </td>
                    <td class="px-4 py-3.5 text-right font-mono font-bold {{ $mov->quantidade > 0 ? 'text-emerald-600' : 'text-red-600' }}">
                        {{ $mov->quantidade > 0 ? '+' : '' }}{{ $mov->quantidade }}
                    </td>
                    <td class="px-4 py-3.5 text-right font-mono text-xs text-gray-500">
                        {{ $mov->estoque_antes }} → <strong class="text-gray-700">{{ $mov->estoque_depois }}</strong>
                    </td>
                    <td class="px-4 py-3.5 text-xs text-gray-600">{{ $mov->user->name }}</td>
                    <td class="px-6 py-3.5">
                        @if($mov->documento)
                        <span class="font-mono text-xs text-gray-500">{{ $mov->documento }}</span>
                        @endif
                        @if($mov->motivo)
                        <p class="text-xs text-gray-400 truncate max-w-[160px]" title="{{ $mov->motivo }}">{{ $mov->motivo }}</p>
                        @endif
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="7" class="px-6 py-16 text-center text-gray-400">
                        <svg class="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                        </svg>
                        <p class="font-medium text-gray-500">Nenhuma movimentação encontrada</p>
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    @if($movements->hasPages())
    <div class="px-6 py-4 border-t border-gray-100">{{ $movements->links() }}</div>
    @endif
</div>
@endsection
