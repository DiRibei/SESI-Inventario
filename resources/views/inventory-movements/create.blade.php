@extends('layouts.app')

@section('title', 'Nova Movimentação')
@section('breadcrumb', 'Movimentações → Registrar')

@section('content')
<div class="max-w-2xl">
    <div class="card">
        <h2 class="text-base font-bold mb-6" style="color:#0a0046">Registrar Movimentação de Estoque</h2>

        @if($errors->any())
        <div class="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <ul class="list-disc list-inside space-y-1">
                @foreach($errors->all() as $error)<li>{{ $error }}</li>@endforeach
            </ul>
        </div>
        @endif

        <form method="POST" action="{{ route('inventory-movements.store') }}" class="space-y-5" id="movimentacao-form">
            @csrf

            {{-- Product selector --}}
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Produto <span class="text-red-500">*</span></label>
                <select name="product_id" id="product_id" required
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2"
                        onchange="updateProductInfo(this)">
                    <option value="">Selecione o produto...</option>
                    @foreach($products as $product)
                    <option value="{{ $product->id }}"
                            data-stock="{{ $product->estoque_atual }}"
                            data-min="{{ $product->estoque_minimo }}"
                            data-unit="{{ $product->unidade_medida }}"
                            data-critico="{{ $product->isEstoqueCritico() ? 'true' : 'false' }}"
                            {{ (old('product_id', $selectedProduct?->id) == $product->id) ? 'selected' : '' }}>
                        {{ $product->nome }} ({{ $product->codigo }}) — Estoque: {{ $product->estoque_atual }} {{ $product->unidade_medida }}
                    </option>
                    @endforeach
                </select>

                {{-- Dynamic stock info --}}
                <div id="stock-info" class="mt-2 hidden p-3 rounded-lg text-sm {{ ($selectedProduct && $selectedProduct->isEstoqueCritico()) ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-blue-50 border border-blue-100 text-blue-700' }}">
                    <span id="stock-text"></span>
                </div>
            </div>

            {{-- Movement type --}}
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Movimentação <span class="text-red-500">*</span></label>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    @foreach(['entrada' => ['Entrada','text-emerald-700','bg-emerald-50 border-emerald-300'], 'saida' => ['Saída','text-red-700','bg-red-50 border-red-300'], 'ajuste' => ['Ajuste','text-amber-700','bg-amber-50 border-amber-300'], 'transferencia' => ['Transferência','text-blue-700','bg-blue-50 border-blue-300']] as $tipo => [$label, $textClass, $bgClass])
                    <label class="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 cursor-pointer transition-all duration-150 hover:shadow-sm {{ old('tipo') === $tipo ? $bgClass : 'border-gray-200 bg-white' }}"
                           id="tipo-label-{{ $tipo }}">
                        <input type="radio" name="tipo" value="{{ $tipo }}" class="sr-only"
                               {{ old('tipo', 'entrada') === $tipo ? 'checked' : '' }}
                               onchange="handleTipoChange('{{ $tipo }}')">
                        <span class="text-sm font-semibold {{ old('tipo', 'entrada') === $tipo ? $textClass : 'text-gray-600' }}">{{ $label }}</span>
                    </label>
                    @endforeach
                </div>
            </div>

            {{-- Ajuste direction (shown only for ajuste) --}}
            <div id="ajuste-direction" class="{{ old('tipo') === 'ajuste' ? '' : 'hidden' }}">
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Direção do Ajuste</label>
                <select name="ajuste_tipo" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2">
                    <option value="adicao">Adição (aumentar estoque)</option>
                    <option value="reducao">Redução (diminuir estoque)</option>
                </select>
            </div>

            {{-- Quantity --}}
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Quantidade <span class="text-red-500">*</span></label>
                <input type="number" name="quantidade" id="quantidade" value="{{ old('quantidade', 1) }}" min="1" required
                       class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
                <p class="text-xs text-gray-400 mt-1">Informe sempre um valor positivo; a direção é controlada pelo tipo.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {{-- Motivo --}}
                <div class="sm:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Motivo / Descrição</label>
                    <input type="text" name="motivo" value="{{ old('motivo') }}" maxlength="255"
                           class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                           placeholder="Ex: Retirada para manutenção bloco A">
                </div>

                {{-- Documento --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Número do Documento</label>
                    <input type="text" name="documento" value="{{ old('documento') }}"
                           class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2"
                           placeholder="NF-1234 / OS-5678">
                </div>

                {{-- Preço unitário --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Preço Unitário</label>
                    <div class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                        <input type="number" name="preco_unitario" value="{{ old('preco_unitario') }}" step="0.01" min="0"
                               class="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
                    </div>
                </div>

                {{-- Localização --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Localização</label>
                    <select name="storage_location_id" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2">
                        <option value="">Padrão do produto</option>
                        @foreach($storageLocations as $loc)
                        <option value="{{ $loc->id }}" {{ old('storage_location_id') == $loc->id ? 'selected' : '' }}>{{ $loc->codigo }} — {{ $loc->nome }}</option>
                        @endforeach
                    </select>
                </div>

                {{-- Lote --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Lote</label>
                    <input type="text" name="lote" value="{{ old('lote') }}"
                           class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2"
                           placeholder="LOT-2024-001">
                </div>

                {{-- Validade --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Data de Validade</label>
                    <input type="date" name="data_validade" value="{{ old('data_validade') }}"
                           class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2">
                </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
                <a href="{{ route('inventory-movements.index') }}" class="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</a>
                <button type="submit" class="btn-primary px-6 py-2.5">Registrar Movimentação</button>
            </div>
        </form>
    </div>
</div>

<script>
const tipoStyles = {
    entrada:      { text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-300' },
    saida:        { text: 'text-red-700',     bg: 'bg-red-50 border-red-300' },
    ajuste:       { text: 'text-amber-700',   bg: 'bg-amber-50 border-amber-300' },
    transferencia:{ text: 'text-blue-700',    bg: 'bg-blue-50 border-blue-300' },
};

function handleTipoChange(selected) {
    Object.keys(tipoStyles).forEach(t => {
        const label = document.getElementById('tipo-label-' + t);
        label.className = label.className.replace(/bg-\S+ border-\S+/, '').trim();
        if (t === selected) {
            label.classList.add(...tipoStyles[t].bg.split(' '));
        } else {
            label.classList.add('border-gray-200', 'bg-white');
        }
    });
    document.getElementById('ajuste-direction').classList.toggle('hidden', selected !== 'ajuste');
}

function updateProductInfo(select) {
    const option = select.options[select.selectedIndex];
    const info = document.getElementById('stock-info');
    const text = document.getElementById('stock-text');
    if (!option.value) { info.classList.add('hidden'); return; }

    const stock   = option.getAttribute('data-stock');
    const min     = option.getAttribute('data-min');
    const unit    = option.getAttribute('data-unit');
    const critico = option.getAttribute('data-critico') === 'true';

    text.textContent = `Estoque atual: ${stock} ${unit} | Mínimo: ${min} ${unit}${critico ? ' ⚠ ESTOQUE CRÍTICO' : ''}`;
    info.className = `mt-2 p-3 rounded-lg text-sm border ${critico ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`;
    info.classList.remove('hidden');
}

// Init on page load if product pre-selected
document.addEventListener('DOMContentLoaded', () => {
    const sel = document.getElementById('product_id');
    if (sel.value) updateProductInfo(sel);
    const checked = document.querySelector('input[name="tipo"]:checked');
    if (checked) handleTipoChange(checked.value);
});
</script>
@endsection
