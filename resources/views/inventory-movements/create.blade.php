@extends('layouts.app')

@section('title', 'Nova Movimentação')
@section('breadcrumb', 'Movimentações → Registrar Entrada, Saída ou Ajuste')

@section('content')
<div class="max-w-3xl mx-auto">
    
    <div class="mb-4">
        <a href="{{ route('inventory-movements.index') }}" class="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Voltar para Movimentações
        </a>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        <div class="p-6 border-b border-slate-100 flex items-center justify-between"
             style="background: linear-gradient(135deg, rgba(10, 0, 70, 0.03), rgba(0, 129, 252, 0.05));">
            <div>
                <h2 class="text-base font-extrabold text-slate-900">Registrar Movimentação de Estoque</h2>
                <p class="text-xs text-slate-500 mt-0.5">Operações de almoxarifado atualizam o saldo do produto de forma atômica e auditada</p>
            </div>
            <span class="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                AUDITORIA ATIVA
            </span>
        </div>

        @if($errors->any())
        <div class="m-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <div class="flex items-center gap-2 font-bold mb-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                Não foi possível registrar a movimentação:
            </div>
            <ul class="list-disc list-inside space-y-0.5 text-xs">
                @foreach($errors->all() as $error)<li>{{ $error }}</li>@endforeach
            </ul>
        </div>
        @endif

        <form method="POST" action="{{ route('inventory-movements.store') }}" class="p-6 space-y-6" id="movimentacao-form">
            @csrf

            {{-- 1. Operation Type --}}
            <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Tipo de Operação <span class="text-red-500">*</span>
                </label>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    @php
                        $defaultTipo = old('tipo', request('tipo', 'entrada'));
                    @endphp

                    {{-- Entrada --}}
                    <label id="tipo-label-entrada" class="flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 {{ $defaultTipo === 'entrada' ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-xs' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300' }}">
                        <input type="radio" name="tipo" value="entrada" class="sr-only" {{ $defaultTipo === 'entrada' ? 'checked' : '' }} onchange="handleTipoChange('entrada')">
                        <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                        <span class="text-xs font-bold">Entrada</span>
                    </label>

                    {{-- Saída --}}
                    <label id="tipo-label-saida" class="flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 {{ $defaultTipo === 'saida' ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-xs' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300' }}">
                        <input type="radio" name="tipo" value="saida" class="sr-only" {{ $defaultTipo === 'saida' ? 'checked' : '' }} onchange="handleTipoChange('saida')">
                        <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4"/></svg>
                        <span class="text-xs font-bold">Saída</span>
                    </label>

                    {{-- Ajuste --}}
                    <label id="tipo-label-ajuste" class="flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 {{ $defaultTipo === 'ajuste' ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-xs' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300' }}">
                        <input type="radio" name="tipo" value="ajuste" class="sr-only" {{ $defaultTipo === 'ajuste' ? 'checked' : '' }} onchange="handleTipoChange('ajuste')">
                        <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        <span class="text-xs font-bold">Ajuste</span>
                    </label>

                    {{-- Transferência --}}
                    <label id="tipo-label-transferencia" class="flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 {{ $defaultTipo === 'transferencia' ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-xs' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300' }}">
                        <input type="radio" name="tipo" value="transferencia" class="sr-only" {{ $defaultTipo === 'transferencia' ? 'checked' : '' }} onchange="handleTipoChange('transferencia')">
                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                        <span class="text-xs font-bold">Transferência</span>
                    </label>
                </div>
            </div>

            {{-- Ajuste Direction (shown only for ajuste) --}}
            <div id="ajuste-direction" class="{{ $defaultTipo === 'ajuste' ? '' : 'hidden' }} p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                <label class="block text-xs font-bold text-amber-900 mb-1.5">Direção do Ajuste de Inventário</label>
                <div class="grid grid-cols-2 gap-3 text-xs">
                    <label class="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-amber-200 cursor-pointer">
                        <input type="radio" name="ajuste_tipo" value="adicao" {{ old('ajuste_tipo', 'adicao') === 'adicao' ? 'checked' : '' }} onchange="calculateProjectedStock()">
                        <span class="font-semibold text-slate-800">Adição (Aumentar Saldo)</span>
                    </label>
                    <label class="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-amber-200 cursor-pointer">
                        <input type="radio" name="ajuste_tipo" value="reducao" {{ old('ajuste_tipo') === 'reducao' ? 'checked' : '' }} onchange="calculateProjectedStock()">
                        <span class="font-semibold text-slate-800">Redução (Baixa de Inventário)</span>
                    </label>
                </div>
            </div>

            {{-- 2. Product Selector --}}
            <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Produto do Almoxarifado <span class="text-red-500">*</span>
                </label>
                <select name="product_id" id="product_id" required
                        class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                        onchange="updateProductInfo(this)">
                    <option value="">Selecione o produto no catálogo...</option>
                    @foreach($products as $product)
                    <option value="{{ $product->id }}"
                            data-stock="{{ $product->estoque_atual }}"
                            data-min="{{ $product->estoque_minimo }}"
                            data-unit="{{ $product->unidade_medida }}"
                            data-cost="{{ $product->preco_custo }}"
                            data-code="{{ $product->codigo }}"
                            data-critico="{{ $product->isEstoqueCritico() ? 'true' : 'false' }}"
                            {{ (old('product_id', $selectedProduct?->id) == $product->id) ? 'selected' : '' }}>
                        [{{ $product->codigo }}] {{ $product->nome }} — Saldo: {{ $product->estoque_atual }} {{ $product->unidade_medida }}
                    </option>
                    @endforeach
                </select>

                {{-- Live Product Info Card --}}
                <div id="product-card" class="mt-3 p-4 rounded-xl border hidden transition-all">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <span id="card-code" class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800"></span>
                            <div class="text-xs text-slate-500 mt-1">
                                Estoque Mínimo de Segurança: <span id="card-min" class="font-bold text-slate-700"></span>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-xs text-slate-400 uppercase font-semibold">Saldo Atual Disponível</span>
                            <div id="card-stock" class="text-2xl font-mono font-extrabold text-slate-900"></div>
                        </div>
                    </div>
                </div>
            </div>

            {{-- 3. Quantity & Projection --}}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Quantidade Movimentada <span class="text-red-500">*</span>
                    </label>
                    <input type="number" name="quantidade" id="quantidade" value="{{ old('quantidade', 1) }}" min="1" required
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                           oninput="calculateProjectedStock()">
                    <p class="text-[11px] text-slate-400 mt-1">Sempre informe um valor positivo. A subtração ocorre automaticamente para saídas.</p>
                </div>

                {{-- Projected Stock Card --}}
                <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
                    <span class="text-[11px] text-slate-400 uppercase font-semibold">Projeção do Novo Saldo</span>
                    <div id="projected-stock-text" class="text-lg font-mono font-extrabold text-slate-800 mt-0.5">
                        --
                    </div>
                    <div id="stock-error-warning" class="text-xs text-rose-600 font-bold hidden mt-1">
                        ⚠ Quantidade maior que o estoque atual disponível!
                    </div>
                </div>
            </div>

            {{-- 4. Complementary fields --}}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                
                {{-- Motivo --}}
                <div class="sm:col-span-2">
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Motivo / Justificativa / Destino
                    </label>
                    <input type="text" name="motivo" value="{{ old('motivo') }}" maxlength="255"
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                           placeholder="Ex: Requisição Oficina Mecânica #4 ou Reposição Nota Fiscal 4591">
                </div>

                {{-- Documento --}}
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Número do Documento / NF / Requisição
                    </label>
                    <input type="text" name="documento" value="{{ old('documento') }}"
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                           placeholder="NF-89214 ou REQ-2026/04">
                </div>

                {{-- Preço unitário --}}
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Preço Unitário (R$)
                    </label>
                    <div class="relative">
                        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">R$</span>
                        <input type="number" name="preco_unitario" id="preco_unitario" value="{{ old('preco_unitario') }}" step="0.01" min="0"
                               class="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                               placeholder="0,00">
                    </div>
                </div>

                {{-- Localização --}}
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Local de Armazenamento
                    </label>
                    <select name="storage_location_id" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                        <option value="">Padrão vinculado ao produto</option>
                        @foreach($storageLocations as $loc)
                        <option value="{{ $loc->id }}" {{ old('storage_location_id') == $loc->id ? 'selected' : '' }}>
                            {{ $loc->codigo }} — {{ $loc->nome }}
                        </option>
                        @endforeach
                    </select>
                </div>

                {{-- Lote --}}
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Número de Lote
                    </label>
                    <input type="text" name="lote" value="{{ old('lote') }}"
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                           placeholder="LOT-2026/A">
                </div>

                {{-- Validade --}}
                <div class="sm:col-span-2">
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Data de Validade (se perecível/químico)
                    </label>
                    <input type="date" name="data_validade" value="{{ old('data_validade') }}"
                           class="w-full sm:w-1/2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                </div>

            </div>

            {{-- Form buttons --}}
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <a href="{{ route('inventory-movements.index') }}"
                   class="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    Cancelar
                </a>
                <button type="submit" id="submit-btn" class="btn-primary px-6 py-2.5 shadow-sm inline-flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                    Confirmar e Registrar
                </button>
            </div>
        </form>

    </div>
</div>

<script>
let currentProduct = null;

const tipoConfig = {
    entrada:       { labelClass: 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-xs' },
    saida:         { labelClass: 'bg-rose-50 border-rose-400 text-rose-800 shadow-xs' },
    ajuste:        { labelClass: 'bg-amber-50 border-amber-400 text-amber-800 shadow-xs' },
    transferencia: { labelClass: 'bg-blue-50 border-blue-400 text-blue-800 shadow-xs' }
};

function handleTipoChange(selected) {
    Object.keys(tipoConfig).forEach(t => {
        const label = document.getElementById('tipo-label-' + t);
        if (!label) return;
        label.className = label.className.replace(/bg-\S+ border-\S+ text-\S+ shadow-xs/, '').trim();
        if (t === selected) {
            label.className = `flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 ${tipoConfig[t].labelClass}`;
        } else {
            label.className = 'flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 border-slate-200 bg-white text-slate-600 hover:border-slate-300';
        }
    });

    const ajusteDiv = document.getElementById('ajuste-direction');
    if (ajusteDiv) {
        ajusteDiv.classList.toggle('hidden', selected !== 'ajuste');
    }

    calculateProjectedStock();
}

function updateProductInfo(select) {
    const opt = select.options[select.selectedIndex];
    const card = document.getElementById('product-card');
    if (!opt || !opt.value) {
        currentProduct = null;
        card.classList.add('hidden');
        calculateProjectedStock();
        return;
    }

    currentProduct = {
        stock: parseInt(opt.getAttribute('data-stock'), 10),
        min: parseInt(opt.getAttribute('data-min'), 10),
        unit: opt.getAttribute('data-unit') || 'UN',
        code: opt.getAttribute('data-code') || '',
        cost: opt.getAttribute('data-cost') || '',
        critico: opt.getAttribute('data-critico') === 'true'
    };

    document.getElementById('card-code').textContent = currentProduct.code;
    document.getElementById('card-min').textContent = `${currentProduct.min} ${currentProduct.unit}`;
    document.getElementById('card-stock').textContent = `${currentProduct.stock} ${currentProduct.unit}`;

    if (currentProduct.critico) {
        card.className = 'mt-3 p-4 rounded-xl border bg-red-50/70 border-red-200 text-red-900 block';
    } else {
        card.className = 'mt-3 p-4 rounded-xl border bg-slate-50 border-slate-200 text-slate-800 block';
    }

    const precoInput = document.getElementById('preco_unitario');
    if (precoInput && !precoInput.value && currentProduct.cost) {
        precoInput.value = currentProduct.cost;
    }

    calculateProjectedStock();
}

function calculateProjectedStock() {
    const projText = document.getElementById('projected-stock-text');
    const warning = document.getElementById('stock-error-warning');
    const submitBtn = document.getElementById('submit-btn');
    const qtyInput = document.getElementById('quantidade');

    if (!currentProduct) {
        projText.textContent = '--';
        warning.classList.add('hidden');
        submitBtn.disabled = false;
        return;
    }

    const qty = parseInt(qtyInput.value, 10) || 0;
    const tipo = document.querySelector('input[name="tipo"]:checked')?.value || 'entrada';
    const ajusteTipo = document.querySelector('input[name="ajuste_tipo"]:checked')?.value || 'adicao';

    let delta = 0;
    if (tipo === 'entrada') delta = qty;
    else if (tipo === 'saida') delta = -qty;
    else if (tipo === 'ajuste') delta = (ajusteTipo === 'reducao') ? -qty : qty;
    else delta = 0; // transferencia

    const projected = currentProduct.stock + delta;

    if (projected < 0) {
        projText.innerHTML = `<span class="text-rose-600">${currentProduct.stock} → ${projected} ${currentProduct.unit} (NEGATIVO)</span>`;
        warning.classList.remove('hidden');
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        projText.innerHTML = `<span class="text-slate-500">${currentProduct.stock}</span> <span class="text-slate-400">→</span> <span class="font-extrabold ${delta >= 0 ? 'text-emerald-600' : 'text-slate-900'}">${projected} ${currentProduct.unit}</span>`;
        warning.classList.add('hidden');
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const sel = document.getElementById('product_id');
    if (sel && sel.value) {
        updateProductInfo(sel);
    }
    calculateProjectedStock();
});
</script>
@endsection
