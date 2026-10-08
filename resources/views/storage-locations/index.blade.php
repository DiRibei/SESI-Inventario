@extends('layouts.app')

@section('title', 'Localizações de Armazenamento')
@section('breadcrumb', 'Endereçamento físico do almoxarifado (galpões, prateleiras e armários)')

@section('content')
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
        <h2 class="text-base font-extrabold text-slate-900">Locais de Armazenamento</h2>
        <p class="text-xs text-slate-500 mt-0.5">Endereçamento físico para localização rápida de peças e ferramentas</p>
    </div>
    <a href="{{ route('storage-locations.create') }}" class="btn-primary text-xs px-4 py-2 shrink-0 shadow-xs inline-flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
        Nova Localização
    </a>
</div>

<div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
            <thead class="text-white uppercase tracking-wider font-semibold" style="background-color: #0a0046;">
                <tr>
                    <th class="px-6 py-3.5">Identificação / Código</th>
                    <th class="px-4 py-3.5">Tipo de Estrutura</th>
                    <th class="px-4 py-3.5 text-center">Itens Armazenados</th>
                    <th class="px-6 py-3.5 text-right">Ações</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
            @forelse($locations as $loc)
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                        <span class="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                            {{ $loc->codigo }}
                        </span>
                        <p class="font-bold text-slate-900 text-sm">{{ $loc->nome }}</p>
                    </div>
                    @if($loc->descricao)
                    <p class="text-[11px] text-slate-400 mt-0.5 pl-0.5">{{ $loc->descricao }}</p>
                    @endif
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                    @php
                        $tipoLabels = ['galpao'=>'Galpão','prateleira'=>'Prateleira','armario'=>'Armário','sala'=>'Sala','externo'=>'Depósito Externo'];
                        $tipoColors = [
                            'galpao' => 'bg-indigo-50 text-indigo-700 border-indigo-200',
                            'prateleira' => 'bg-blue-50 text-blue-700 border-blue-200',
                            'armario' => 'bg-emerald-50 text-emerald-700 border-emerald-200',
                            'sala' => 'bg-purple-50 text-purple-700 border-purple-200',
                            'externo' => 'bg-amber-50 text-amber-800 border-amber-200'
                        ];
                    @endphp
                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold border {{ $tipoColors[$loc->tipo] ?? 'bg-slate-100 text-slate-700 border-slate-200' }}">
                        {{ $tipoLabels[$loc->tipo] ?? ucfirst($loc->tipo) }}
                    </span>
                </td>
                <td class="px-4 py-4 text-center whitespace-nowrap">
                    <span class="inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-full text-xs font-bold text-white shadow-2xs"
                          style="background-color: #2263c8;">
                        {{ $loc->products_count }}
                    </span>
                </td>
                <td class="px-6 py-4 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-2">
                        <a href="{{ route('storage-locations.edit', $loc) }}"
                           class="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold transition-colors">
                            Editar
                        </a>

                        <form id="delete-location-{{ $loc->id }}" method="POST" action="{{ route('storage-locations.destroy', $loc) }}" class="inline">
                            @csrf
                            @method('DELETE')
                            <button type="button"
                                    onclick="openDeleteModal('delete-location-{{ $loc->id }}', '{{ addslashes($loc->nome) }}', 'Deseja remover a localização \"{{ addslashes($loc->codigo) }} - {{ addslashes($loc->nome) }}\"? Os produtos permanecerão no catálogo.')"
                                    class="text-xs px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold transition-colors">
                                Excluir
                            </button>
                        </form>
                    </div>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="4" class="p-0">
                    <x-empty-state
                        title="Nenhuma localização cadastrada"
                        description="Cadastre os galpões, armários e prateleiras para mapear o almoxarifado."
                        actionText="Cadastrar Primeira Localização"
                        :actionUrl="route('storage-locations.create')"
                    />
                </td>
            </tr>
            @endforelse
            </tbody>
        </table>
    </div>

    @if($locations->hasPages())
    <div class="px-6 py-4 border-t border-slate-100">
        {{ $locations->links() }}
    </div>
    @endif
</div>
@endsection
