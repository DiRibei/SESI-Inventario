@extends('layouts.app')

@section('title', 'Relatórios de Movimentação')
@section('breadcrumb', 'Relatórios Gerenciais e Auditoria de Estoque')

@section('content')

{{-- ── PRINT-ONLY OFFICIAL HEADER ────────────────────────────────────────── --}}
<div class="hidden print-only mb-6 border-b-2 border-slate-900 pb-4">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-xl font-black uppercase tracking-tight text-slate-900">SENAI · Sistema Fiep</h1>
            <h2 class="text-sm font-bold text-slate-700">Sistema Inteligente de Gerenciamento de Inventário</h2>
            <p class="text-xs text-slate-500">Relatório Consolidado de Movimentações de Almoxarifado</p>
        </div>
        <div class="text-right text-xs text-slate-600">
            <p><strong>Emitido em:</strong> {{ now()->format('d/m/Y \à\s H:i:s') }}</p>
            <p><strong>Operador:</strong> {{ auth()->user()->name }} ({{ auth()->user()->role }})</p>
            <p><strong>Período:</strong> {{ $from ? \Carbon\Carbon::parse($from)->format('d/m/Y') : 'Início' }} até {{ $to ? \Carbon\Carbon::parse($to)->format('d/m/Y') : 'Atual' }}</p>
        </div>
    </div>
</div>

{{-- ── FILTERS SECTION (NO-PRINT) ────────────────────────────────────────── --}}
<div class="no-print bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 mb-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
        <div>
            <h2 class="font-extrabold text-sm sm:text-base text-slate-800">Filtros Avançados de Movimentações</h2>
            <p class="text-xs text-slate-400">Personalize o período, operação ou material para extrair dados analíticos</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
            <a href="{{ route('reports.export-csv', request()->query()) }}"
               class="px-3.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs">
                <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                Exportar Excel (CSV)
            </a>
            <button onclick="window.print()"
                    class="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs">
                <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                Imprimir Relatório
            </button>
        </div>
    </div>

    {{-- Quick Preset Buttons --}}
    <div class="flex flex-wrap items-center gap-1.5 mb-4 text-xs">
        <span class="text-slate-400 font-semibold mr-1">Atalhos rápidos:</span>
        <a href="{{ route('reports.index', array_merge(request()->except(['from','to','page']), ['preset' => 'hoje'])) }}"
           class="px-2.5 py-1 rounded-lg border {{ $preset === 'hoje' ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100' }}">
            Hoje
        </a>
        <a href="{{ route('reports.index', array_merge(request()->except(['from','to','page']), ['preset' => '7dias'])) }}"
           class="px-2.5 py-1 rounded-lg border {{ $preset === '7dias' ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100' }}">
            Últimos 7 dias
        </a>
        <a href="{{ route('reports.index', array_merge(request()->except(['from','to','page']), ['preset' => '30dias'])) }}"
           class="px-2.5 py-1 rounded-lg border {{ $preset === '30dias' ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100' }}">
            Últimos 30 dias
        </a>
        <a href="{{ route('reports.index', array_merge(request()->except(['from','to','page']), ['preset' => 'mes_atual'])) }}"
           class="px-2.5 py-1 rounded-lg border {{ $preset === 'mes_atual' ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100' }}">
            Mês Atual
        </a>
        <a href="{{ route('reports.index') }}"
           class="px-2.5 py-1 rounded-lg border border-transparent text-slate-400 hover:text-slate-600">
            Limpar Filtros
        </a>
    </div>

    {{-- Main Filter Form --}}
    <form method="GET" action="{{ route('reports.index') }}" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
        
        {{-- Data Inicial --}}
        <div>
            <label class="block font-bold text-slate-600 mb-1">Data Inicial</label>
            <input type="date" name="from" value="{{ $from }}"
                   class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
        </div>

        {{-- Data Final --}}
        <div>
            <label class="block font-bold text-slate-600 mb-1">Data Final</label>
            <input type="date" name="to" value="{{ $to }}"
                   class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
        </div>

        {{-- Tipo --}}
        <div>
            <label class="block font-bold text-slate-600 mb-1">Tipo de Operação</label>
            <select name="tipo" class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                <option value="">Todas as operações</option>
                <option value="entrada" {{ request('tipo') === 'entrada' ? 'selected' : '' }}>Entradas (+)</option>
                <option value="saida" {{ request('tipo') === 'saida' ? 'selected' : '' }}>Saídas (-)</option>
                <option value="ajuste" {{ request('tipo') === 'ajuste' ? 'selected' : '' }}>Ajustes</option>
                <option value="transferencia" {{ request('tipo') === 'transferencia' ? 'selected' : '' }}>Transferências</option>
            </select>
        </div>

        {{-- Produto --}}
        <div>
            <label class="block font-bold text-slate-600 mb-1">Produto Específico</label>
            <select name="product_id" class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                <option value="">Todos os produtos</option>
                @foreach($products as $p)
                <option value="{{ $p->id }}" {{ request('product_id') == $p->id ? 'selected' : '' }}>
                    {{ $p->codigo }} — {{ $p->nome }}
                </option>
                @endforeach
            </select>
        </div>

        {{-- Filter Buttons --}}
        <div class="flex items-end gap-2">
            <button type="submit" class="btn-primary w-full py-2 justify-center text-xs">
                Filtrar
            </button>
            <a href="{{ route('reports.index') }}" class="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-center font-semibold">
                Reset
            </a>
        </div>

    </form>
</div>

{{-- ── SUMMARY KPI STRIP ────────────────────────────────────────────────── --}}
<div class="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
    <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total de Registros</span>
        <p class="text-xl sm:text-2xl font-extrabold mt-1 text-slate-900">{{ number_format($totalRegistros, 0, ',', '.') }}</p>
    </div>
    <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Entradas</span>
        <p class="text-xl sm:text-2xl font-extrabold mt-1 text-emerald-600">+{{ number_format($totalEntradas, 0, ',', '.') }}</p>
    </div>
    <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Saídas</span>
        <p class="text-xl sm:text-2xl font-extrabold mt-1 text-rose-600">-{{ number_format($totalSaidas, 0, ',', '.') }}</p>
    </div>
    <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Saldo no Período</span>
        <p class="text-xl sm:text-2xl font-extrabold mt-1 {{ $saldoLiquido >= 0 ? 'text-blue-600' : 'text-amber-600' }}">
            {{ $saldoLiquido >= 0 ? '+' : '' }}{{ number_format($saldoLiquido, 0, ',', '.') }}
        </p>
    </div>
    <div class="col-span-2 lg:col-span-1 bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Valor Estimado</span>
        <p class="text-xl sm:text-2xl font-extrabold mt-1 text-slate-900">
            R$ {{ number_format($valorTotalEstimado, 2, ',', '.') }}
        </p>
    </div>
</div>

{{-- ── RESULTS TABLE ─────────────────────────────────────────────────────── --}}
<div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
    
    @if($movements->isEmpty())
    <x-empty-state
        title="Nenhum registro encontrado para este período"
        description="Não há movimentações de almoxarifado registradas com os filtros ou datas selecionados."
        actionText="Redefinir Filtros"
        :actionUrl="route('reports.index')"
    />
    @else
    <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
            <thead class="text-slate-400 uppercase tracking-wider bg-slate-50/80 border-b border-slate-100 font-semibold">
                <tr>
                    <th class="px-4 py-3">Data / Hora</th>
                    <th class="px-3 py-3">Tipo</th>
                    <th class="px-4 py-3">Produto</th>
                    <th class="px-3 py-3">Categoria</th>
                    <th class="px-3 py-3 text-right">Qtd</th>
                    <th class="px-3 py-3 text-center">Antes → Depois</th>
                    <th class="px-3 py-3 text-right">Valor Total</th>
                    <th class="px-3 py-3">Documento / NF</th>
                    <th class="px-3 py-3">Responsável</th>
                    <th class="px-3 py-3 no-print text-center">Ação</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
                @foreach($movements as $m)
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {{ $m->created_at->format('d/m/Y H:i') }}
                    </td>
                    <td class="px-3 py-3 whitespace-nowrap">
                        @if($m->tipo === 'entrada')
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Entrada</span>
                        @elseif($m->tipo === 'saida')
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">Saída</span>
                        @elseif($m->tipo === 'ajuste')
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Ajuste</span>
                        @else
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">{{ ucfirst($m->tipo) }}</span>
                        @endif
                    </td>
                    <td class="px-4 py-3">
                        <div class="font-bold text-slate-800">{{ $m->product->nome ?? 'Excluído' }}</div>
                        <div class="text-[10px] font-mono text-slate-400">{{ $m->product->codigo ?? '-' }}</div>
                    </td>
                    <td class="px-3 py-3 text-slate-500">
                        {{ $m->product->category->nome ?? '-' }}
                    </td>
                    <td class="px-3 py-3 text-right font-mono font-bold whitespace-nowrap {{ $m->quantidade > 0 ? 'text-emerald-600' : 'text-rose-600' }}">
                        {{ $m->quantidade > 0 ? '+' : '' }}{{ $m->quantidade }} {{ $m->product->unidade_medida ?? 'UN' }}
                    </td>
                    <td class="px-3 py-3 text-center font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {{ $m->estoque_antes }} → <strong>{{ $m->estoque_depois }}</strong>
                    </td>
                    <td class="px-3 py-3 text-right font-mono text-slate-800 whitespace-nowrap">
                        @php
                            $preco = $m->preco_unitario ?? $m->product->preco_custo ?? 0;
                        @endphp
                        R$ {{ number_format(abs($m->quantidade) * $preco, 2, ',', '.') }}
                    </td>
                    <td class="px-3 py-3 font-mono text-slate-600">
                        {{ $m->documento ?: '-' }}
                    </td>
                    <td class="px-3 py-3 text-slate-600 whitespace-nowrap">
                        {{ $m->user->name ?? 'Sistema' }}
                    </td>
                    <td class="px-3 py-3 no-print text-center">
                        <a href="{{ route('inventory-movements.show', $m) }}"
                           class="text-blue-600 hover:text-blue-800 font-semibold p-1"
                           title="Ver Comprovante">
                            Ver
                        </a>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    @if(!$isPrint && method_exists($movements, 'links'))
    <div class="p-4 border-t border-slate-100 no-print">
        {{ $movements->links() }}
    </div>
    @endif
    @endif

    {{-- Official Print Signatures --}}
    <div class="hidden print-only p-8 pt-20 border-t border-slate-200">
        <div class="grid grid-cols-2 gap-16 text-center text-xs">
            <div>
                <div class="border-t border-slate-900 w-3/4 mx-auto mb-1"></div>
                <p class="font-bold">Responsável Técnico / Almoxarife</p>
                <p class="text-slate-500">Conferência e Execução de Movimentações</p>
            </div>
            <div>
                <div class="border-t border-slate-900 w-3/4 mx-auto mb-1"></div>
                <p class="font-bold">Coordenação Operacional / Gestor</p>
                <p class="text-slate-500">Aprovação e Auditoria de Estoque</p>
            </div>
        </div>
    </div>

</div>

@endsection
