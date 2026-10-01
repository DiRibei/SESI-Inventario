@extends('layouts.app')

@section('title', 'Painel de Controle')
@section('breadcrumb', 'Visão geral em tempo real dos indicadores de inventário')

@section('content')

{{-- ── QUICK ACTION STRIP ────────────────────────────────────────────────── --}}
<div class="mb-6 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-blue-900 to-indigo-950 p-4 rounded-2xl text-white shadow-md">
    <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <svg class="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
        </div>
        <div>
            <h2 class="text-sm font-bold">Ações Rápidas de Almoxarifado</h2>
            <p class="text-xs text-blue-200/80">Registre transferências, entradas ou retiradas com validação instantânea</p>
        </div>
    </div>
    <div class="flex flex-wrap items-center gap-2">
        <a href="{{ route('inventory-movements.create', ['tipo' => 'entrada']) }}"
           class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm transition-all transform active:scale-95">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            Nova Entrada
        </a>
        <a href="{{ route('inventory-movements.create', ['tipo' => 'saida']) }}"
           class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-sm transition-all transform active:scale-95">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4"/></svg>
            Nova Saída
        </a>
        <a href="{{ route('reports.index') }}"
           class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Relatórios
        </a>
    </div>
</div>

{{-- ── KPI CARDS ─────────────────────────────────────────────────────────── --}}
<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

    {{-- Total Produtos --}}
    <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total de Produtos</p>
            <p class="text-3xl font-extrabold mt-1" style="color: #0a0046;">{{ $stats['total_produtos'] }}</p>
            <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> Itens cadastrados ativos
            </p>
        </div>
        <div class="w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
             style="background: linear-gradient(135deg, rgba(0, 129, 252, 0.15), rgba(6, 56, 153, 0.08));">
            <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
        </div>
    </div>

    {{-- Valor Total do Inventário --}}
    <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Patrimônio em Estoque</p>
            <p class="text-2xl font-extrabold mt-1 text-slate-900">
                R$ {{ number_format($stats['valor_total_estoque'], 2, ',', '.') }}
            </p>
            <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Custo acumulado
            </p>
        </div>
        <div class="w-13 h-13 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 shadow-sm">
            <svg class="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
        </div>
    </div>

    {{-- Estoque Crítico --}}
    <div class="bg-white rounded-2xl p-5 border {{ $stats['estoque_critico'] > 0 ? 'border-red-200 ring-1 ring-red-100 bg-red-50/20' : 'border-slate-200/80' }} shadow-xs flex items-center justify-between">
        <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Itens em Alerta Crítico</p>
            <p class="text-3xl font-extrabold mt-1 {{ $stats['estoque_critico'] > 0 ? 'text-red-600' : 'text-emerald-600' }}">
                {{ $stats['estoque_critico'] }}
            </p>
            <p class="text-xs {{ $stats['estoque_critico'] > 0 ? 'text-red-600 font-medium' : 'text-slate-500' }} mt-1 flex items-center gap-1">
                @if($stats['estoque_critico'] > 0)
                <span class="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span> Abaixo do estoque mínimo
                @else
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Níveis adequados
                @endif
            </p>
        </div>
        <div class="w-13 h-13 rounded-2xl {{ $stats['estoque_critico'] > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600' }} flex items-center justify-center shrink-0 shadow-sm">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
        </div>
    </div>

    {{-- Movimentações no Mês --}}
    <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Movimentações no Mês</p>
            <p class="text-3xl font-extrabold mt-1" style="color: #0a0046;">{{ $stats['movimentacoes_mes'] }}</p>
            <p class="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span class="text-emerald-600 font-semibold">+{{ $stats['entradas_hoje'] }} hoje</span> · 
                <span class="text-rose-600 font-semibold">-{{ $stats['saidas_hoje'] }} hoje</span>
            </p>
        </div>
        <div class="w-13 h-13 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 shadow-sm">
            <svg class="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
        </div>
    </div>

</div>

{{-- ── CHARTS SECTION ───────────────────────────────────────────────────── --}}
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

    {{-- Chart 1: Daily Movements (Bar chart) --}}
    <div class="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col">
        <div class="flex items-center justify-between mb-4">
            <div>
                <h3 class="font-bold text-sm sm:text-base text-slate-800">Fluxo de Entradas e Saídas (Últimos 7 dias)</h3>
                <p class="text-xs text-slate-400">Volume diário de requisições e reposições no almoxarifado</p>
            </div>
            <div class="flex items-center gap-3 text-xs">
                <span class="inline-flex items-center gap-1.5 text-slate-600">
                    <span class="w-3 h-3 rounded-md bg-emerald-500"></span> Entradas
                </span>
                <span class="inline-flex items-center gap-1.5 text-slate-600">
                    <span class="w-3 h-3 rounded-md bg-rose-500"></span> Saídas
                </span>
            </div>
        </div>
        <div class="relative h-64 sm:h-72 w-full flex-1">
            <canvas id="movementsChart"></canvas>
        </div>
    </div>

    {{-- Chart 2: Category Breakdown (Doughnut chart) --}}
    <div class="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col">
        <div class="mb-4">
            <h3 class="font-bold text-sm sm:text-base text-slate-800">Produtos por Categoria</h3>
            <p class="text-xs text-slate-400">Distribuição dos materiais cadastrados</p>
        </div>
        <div class="relative h-64 sm:h-72 w-full flex items-center justify-center flex-1">
            <canvas id="categoryChart"></canvas>
        </div>
    </div>

</div>

{{-- ── CRITICAL ALERTS & RECENT MOVEMENTS ────────────────────────────────── --}}
<div class="grid grid-cols-1 xl:grid-cols-5 gap-6">

    {{-- Critical Stock Alerts Table/List --}}
    <div class="xl:col-span-2">
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden h-full flex flex-col">
            <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div class="flex items-center gap-2">
                    <span class="relative flex h-2.5 w-2.5">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                    </span>
                    <h3 class="font-bold text-sm text-slate-800">Alertas de Estoque Mínimo</h3>
                </div>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    {{ $produtosCriticos->count() }} urgente(s)
                </span>
            </div>

            @if($produtosCriticos->isEmpty())
            <div class="p-8 text-center flex-1 flex flex-col items-center justify-center">
                <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                </div>
                <p class="text-sm font-semibold text-slate-700">Nenhum alerta crítico ativo</p>
                <p class="text-xs text-slate-400 mt-1 max-w-xs">Todos os materiais do almoxarifado estão operando acima da margem mínima de segurança.</p>
            </div>
            @else
            <div class="divide-y divide-slate-100 overflow-y-auto max-h-96 flex-1">
                @foreach($produtosCriticos as $produto)
                <div class="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3">
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                {{ $produto->codigo }}
                            </span>
                            @if($produto->category)
                            <span class="text-[10px] text-slate-400 uppercase font-semibold">
                                {{ $produto->category->nome }}
                            </span>
                            @endif
                        </div>
                        <p class="text-sm font-semibold text-slate-800 truncate mt-1">{{ $produto->nome }}</p>
                        
                        {{-- Visual stock progress bar --}}
                        <div class="mt-2 flex items-center gap-2">
                            <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                @php
                                    $pct = $produto->estoque_minimo > 0 ? min(100, round(($produto->estoque_atual / $produto->estoque_minimo) * 100)) : 0;
                                @endphp
                                <div class="h-full bg-red-500 rounded-full" style="width: {{ $pct }}%"></div>
                            </div>
                            <span class="text-[11px] font-mono font-bold text-red-600">
                                {{ $produto->estoque_atual }} / {{ $produto->estoque_minimo }} {{ $produto->unidade_medida }}
                            </span>
                        </div>
                    </div>

                    <a href="{{ route('inventory-movements.create', ['product_id' => $produto->id, 'tipo' => 'entrada']) }}"
                       title="Repor Estoque Imediatamente"
                       class="shrink-0 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors inline-flex items-center gap-1">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                        Repor
                    </a>
                </div>
                @endforeach
            </div>
            <div class="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <a href="{{ route('products.index', ['critico' => 1]) }}" class="text-xs font-semibold text-blue-600 hover:text-blue-800">
                    Ver todos os produtos com estoque crítico →
                </a>
            </div>
            @endif
        </div>
    </div>

    {{-- Recent Movements Table --}}
    <div class="xl:col-span-3">
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden h-full flex flex-col">
            <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 class="font-bold text-sm text-slate-800">Últimas Movimentações Registradas</h3>
                <a href="{{ route('inventory-movements.index') }}" class="text-xs font-semibold text-blue-600 hover:text-blue-800">
                    Histórico Completo →
                </a>
            </div>

            @if($movimentosRecentes->isEmpty())
            <div class="p-8 text-center text-slate-400 text-sm flex-1 flex items-center justify-center">
                Nenhuma movimentação registrada no sistema ainda.
            </div>
            @else
            <div class="overflow-x-auto flex-1">
                <table class="w-full text-xs text-left">
                    <thead class="text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-100 font-semibold">
                        <tr>
                            <th class="px-5 py-3">Produto</th>
                            <th class="px-3 py-3">Operação</th>
                            <th class="px-3 py-3 text-right">Quantidade</th>
                            <th class="px-3 py-3">Responsável</th>
                            <th class="px-4 py-3 text-right">Data/Hora</th>
                            <th class="px-3 py-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-medium">
                        @foreach($movimentosRecentes as $mov)
                        <tr class="hover:bg-slate-50/80 transition-colors">
                            <td class="px-5 py-3">
                                <div class="font-semibold text-slate-800 truncate max-w-[180px]">{{ $mov->product->nome ?? 'Excluído' }}</div>
                                <div class="text-[11px] text-slate-400 font-mono">{{ $mov->product->codigo ?? '-' }}</div>
                            </td>
                            <td class="px-3 py-3">
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
                                {{ $mov->quantidade > 0 ? '+' : '' }}{{ $mov->quantidade }} {{ $mov->product->unidade_medida ?? '' }}
                            </td>
                            <td class="px-3 py-3 text-slate-600">
                                {{ $mov->user->name ?? 'Sistema' }}
                            </td>
                            <td class="px-4 py-3 text-right text-slate-400">
                                {{ $mov->created_at->format('d/m/Y H:i') }}
                            </td>
                            <td class="px-3 py-3 text-center">
                                <a href="{{ route('inventory-movements.show', $mov) }}"
                                   class="text-blue-600 hover:text-blue-800 p-1"
                                   title="Ver Detalhes / Comprovante">
                                    <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                </a>
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

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function () {
    if (typeof Chart === 'undefined') return;

    // ── Chart 1: Daily Movements (Bar Chart) ──────────────────────────────────
    const ctxMovements = document.getElementById('movementsChart');
    if (ctxMovements) {
        new Chart(ctxMovements, {
            type: 'bar',
            data: {
                labels: @json($chartDates),
                datasets: [
                    {
                        label: 'Entradas',
                        data: @json($chartEntradas),
                        backgroundColor: '#10b981',
                        borderRadius: 6,
                    },
                    {
                        label: 'Saídas',
                        data: @json($chartSaidas),
                        backgroundColor: '#f43f5e',
                        borderRadius: 6,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // ── Chart 2: Categories Distribution (Doughnut Chart) ───────────────────
    const ctxCategory = document.getElementById('categoryChart');
    if (ctxCategory) {
        new Chart(ctxCategory, {
            type: 'doughnut',
            data: {
                labels: @json($chartCategoryLabels),
                datasets: [{
                    data: @json($chartCategoryCounts),
                    backgroundColor: @json($chartCategoryColors).length > 0 ? @json($chartCategoryColors) : ['#0081fc', '#2263c8', '#0a0046', '#5a80ff', '#10b981', '#f59e0b'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 12,
                            font: { size: 11 }
                        }
                    }
                },
                cutout: '68%'
            }
        });
    }
});
</script>
@endpush
