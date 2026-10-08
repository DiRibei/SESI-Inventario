@extends('layouts.app')

@section('title', 'Fornecedores')
@section('breadcrumb', 'Parceiros comerciais e fabricantes homologados')

@section('content')
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <form method="GET" action="{{ route('suppliers.index') }}" class="flex flex-1 max-w-md gap-2">
        <div class="relative flex-1">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Buscar por razão social ou CNPJ..."
                   class="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white">
        </div>
        <button type="submit" class="btn-primary text-xs px-4 py-2">Buscar</button>
        @if(request('search'))
        <a href="{{ route('suppliers.index') }}" class="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 bg-white hover:bg-slate-50 font-semibold">Limpar</a>
        @endif
    </form>

    <a href="{{ route('suppliers.create') }}" class="btn-primary text-xs px-4 py-2 shrink-0 shadow-xs inline-flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
        Novo Fornecedor
    </a>
</div>

<div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
            <thead class="text-white uppercase tracking-wider font-semibold" style="background-color: #0a0046;">
                <tr>
                    <th class="px-6 py-3.5">Fornecedor / Razão Social</th>
                    <th class="px-4 py-3.5">Contato & Localização</th>
                    <th class="px-4 py-3.5 text-center">Itens Fornecidos</th>
                    <th class="px-6 py-3.5 text-right">Ações</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
            @forelse($suppliers as $sup)
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4">
                    <p class="font-bold text-slate-900 text-sm">{{ $sup->nome }}</p>
                    @if($sup->cnpj)
                    <p class="text-[11px] text-slate-400 font-mono mt-0.5">CNPJ: {{ $sup->cnpj }}</p>
                    @endif
                </td>
                <td class="px-4 py-4 text-xs text-slate-600">
                    @if($sup->contato)
                    <p class="font-semibold text-slate-800">{{ $sup->contato }}</p>
                    @endif
                    <div class="text-[11px] text-slate-400 flex flex-col gap-0.5 mt-0.5">
                        @if($sup->telefone)<span>Tel: {{ $sup->telefone }}</span>@endif
                        @if($sup->email)<span>E-mail: {{ $sup->email }}</span>@endif
                    </div>
                </td>
                <td class="px-4 py-4 text-center">
                    <span class="inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-full text-xs font-bold text-white shadow-2xs"
                          style="background-color: #2263c8;">
                        {{ $sup->products_count }}
                    </span>
                </td>
                <td class="px-6 py-4 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-2">
                        <a href="{{ route('suppliers.edit', $sup) }}"
                           class="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold transition-colors">
                            Editar
                        </a>

                        <form id="delete-supplier-{{ $sup->id }}" method="POST" action="{{ route('suppliers.destroy', $sup) }}" class="inline">
                            @csrf
                            @method('DELETE')
                            <button type="button"
                                    onclick="openDeleteModal('delete-supplier-{{ $sup->id }}', '{{ addslashes($sup->nome) }}', 'Deseja remover o fornecedor \"{{ addslashes($sup->nome) }}\"? Os produtos vinculados manterão seus dados de estoque.')"
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
                        title="Nenhum fornecedor encontrado"
                        description="{{ request('search') ? 'Nenhum fornecedor corresponde ao termo de busca pesquisado.' : 'Cadastre as empresas e parceiros que fornecem materiais para o SENAI.' }}"
                        :actionText="request('search') ? 'Limpar Busca' : 'Cadastrar Primeiro Fornecedor'"
                        :actionUrl="request('search') ? route('suppliers.index') : route('suppliers.create')"
                    />
                </td>
            </tr>
            @endforelse
            </tbody>
        </table>
    </div>

    @if($suppliers->hasPages())
    <div class="px-6 py-4 border-t border-slate-100">
        {{ $suppliers->links() }}
    </div>
    @endif
</div>
@endsection
