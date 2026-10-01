@extends('layouts.app')

@section('title', 'Dashboard')
@section('breadcrumb', 'Visão geral do inventário')

@section('content')

{{-- KPI Cards --}}
<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

    {{-- Total Produtos --}}
    <div class="card flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
             style="background: linear-gradient(135deg, #0081fc20, #0081fc10);">
            <svg class="w-6 h-6" style="color:#0081fc" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
        </div>
        <div>
            <p class="text-2xl font-extrabold" style="color:#0a0046">{{ $stats['total_produtos'] }}</p>
            <p class="text-sm text-gray-400">Produtos ativos</p>
        </div>
    </div>

    {{-- Estoque Crítico --}}
    <div class="card flex items-center gap-4 {{ $stats['estoque_critico'] > 0 ? 'border-red-200 bg-red-50' : '' }}">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
             style="background: {{ $stats['estoque_critico'] > 0 ? '#fee2e2' : '#f0fdf4' }}">
            <svg class="w-6 h-6" style="color: {{ $stats['estoque_critico'] > 0 ? '#dc2626' : '#16a34a' }}" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
        </div>
        <div>
            <p class="text-2xl font-extrabold {{ $stats['estoque_critico'] > 0 ? 'text-red-600' : 'text-gray-800' }}">
                {{ $stats['estoque_critico'] }}
            </p>
            <p class="text-sm text-gray-400">Estoque crítico</p>
        </div>
    </div>

    {{-- Entradas hoje --}}
    <div class="card flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
             style="background: #d1fae5;">
            <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
            </svg>
        </div>
        <div>
            <p class="text-2xl font-extrabold" style="color:#0a0046">{{ $stats['entradas_hoje'] }}</p>
            <p class="text-sm text-gray-400">Entradas hoje</p>
        </div>
    </div>

    {{-- Saídas hoje --}}
    <div class="card flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
             style="background: #ffe4e6;">
            <svg class="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
        </div>
        <div>
            <p class="text-2xl font-extrabold" style="color:#0a0046">{{ $stats['saidas_hoje'] }}</p>
            <p class="text-sm text-gray-400">Saídas hoje</p>
        </div>
    </div>

</div>

<div class="grid grid-cols-1 xl:grid-cols-5 gap-6">

    {{-- Critical stock alert section --}}
    <div class="xl:col-span-2">
        <div class="card p-0 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <h2 class="font-semibold text-sm" style="color:#0a0046">Alertas de Estoque Crítico</h2>
                </div>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    {{ $produtosCriticos->count() }}
                </span>
            </div>

            @if($produtosCriticos->isEmpty())
            <div class="px-6 py-10 text-center">
                <svg class="w-10 h-10 mx-auto text-emerald-300 mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-sm text-gray-400">Todos os produtos estão com estoque adequado!</p>
            </div>
            @else
            <ul class="divide-y divide-gray-50">
                @foreach($produtosCriticos as $produto)
                <li class="px-6 py-3 flex items-center justify-between gap-3 hover:bg-red-50/50 transition-colors">
                    <div class="min-w-0">
                        <p class="text-sm font-medium text-gray-800 truncate">{{ $produto->nome }}</p>
                        <p class="text-xs text-gray-400">{{ $produto->codigo }}
                            @if($produto->storageLocation) · {{ $produto->storageLocation->codigo }}@endif
                        </p>
                    </div>
                    <div class="text-right shrink-0">
                        <p class="text-sm font-bold text-red-600">{{ $produto->estoque_atual }} <span class="font-normal text-xs">/ {{ $produto->estoque_minimo }}</span></p>
                        <p class="text-xs text-gray-400">atual / mín</p>
                    </div>
                </li>
                @endforeach
            </ul>
            @if(auth()->user()->isAdmin())
            <div class="px-6 py-3 bg-gray-50 border-t border-gray-100">
                <a href="{{ route('products.index', ['critico' => 1]) }}" class="text-xs font-semibold" style="color:#0081fc">
                    Ver todos os produtos críticos →
                </a>
            </div>
            @endif
            @endif
        </div>
    </div>

    {{-- Recent movements --}}
    <div class="xl:col-span-3">
        <div class="card p-0 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 class="font-semibold text-sm" style="color:#0a0046">Movimentações Recentes</h2>
                <a href="{{ route('inventory-movements.index') }}" class="text-xs font-semibold" style="color:#0081fc">Ver todas →</a>
            </div>

            @if($movimentosRecentes->isEmpty())
            <div class="px-6 py-10 text-center text-gray-400 text-sm">Nenhuma movimentação registrada ainda.</div>
            @else
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr style="background:#0a0046;">
                            <th class="text-left px-6 py-3 text-white/70 text-xs font-semibold uppercase tracking-wider">Produto</th>
                            <th class="text-left px-4 py-3 text-white/70 text-xs font-semibold uppercase tracking-wider">Tipo</th>
                            <th class="text-right px-4 py-3 text-white/70 text-xs font-semibold uppercase tracking-wider">Qty</th>
                            <th class="text-left px-4 py-3 text-white/70 text-xs font-semibold uppercase tracking-wider">Usuário</th>
                            <th class="text-right px-6 py-3 text-white/70 text-xs font-semibold uppercase tracking-wider">Data</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        @foreach($movimentosRecentes as $mov)
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-3 font-medium text-gray-800 truncate max-w-[180px]">{{ $mov->product->nome }}</td>
                            <td class="px-4 py-3">
                                <span class="badge-{{ $mov->tipo }}">{{ ucfirst($mov->tipo) }}</span>
                            </td>
                            <td class="px-4 py-3 text-right font-mono font-semibold {{ $mov->quantidade > 0 ? 'text-emerald-600' : 'text-red-600' }}">
                                {{ $mov->quantidade > 0 ? '+' : '' }}{{ $mov->quantidade }}
                            </td>
                            <td class="px-4 py-3 text-gray-500 text-xs">{{ $mov->user->name }}</td>
                            <td class="px-6 py-3 text-right text-gray-400 text-xs">
                                {{ $mov->created_at->format('d/m H:i') }}
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            @endif
        </div>
    </div>

</div>

@endsection
