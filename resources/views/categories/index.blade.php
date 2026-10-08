@extends('layouts.app')

@section('title', 'Categorias de Produtos')
@section('breadcrumb', 'Classificação e organização dos materiais')

@section('content')
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
        <h2 class="text-base font-extrabold text-slate-900">Categorias Cadastradas</h2>
        <p class="text-xs text-slate-500 mt-0.5">Grupos de materiais para controle e relatórios analíticos</p>
    </div>
    <a href="{{ route('categories.create') }}" class="btn-primary text-xs px-4 py-2 shrink-0 shadow-xs inline-flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
        Nova Categoria
    </a>
</div>

<div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
            <thead class="text-white uppercase tracking-wider font-semibold" style="background-color: #0a0046;">
                <tr>
                    <th class="px-6 py-3.5">Categoria / Descrição</th>
                    <th class="px-4 py-3.5 text-center">Produtos Vinculados</th>
                    <th class="px-6 py-3.5 text-right">Ações</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
            @forelse($categories as $cat)
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 flex items-center gap-3">
                    <div class="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs" style="background-color: {{ $cat->cor }}"></div>
                    <div>
                        <p class="font-bold text-slate-900 text-sm">{{ $cat->nome }}</p>
                        @if($cat->descricao)
                        <p class="text-[11px] text-slate-400 max-w-md line-clamp-1 mt-0.5">{{ $cat->descricao }}</p>
                        @endif
                    </div>
                </td>
                <td class="px-4 py-4 text-center">
                    <span class="inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-full text-xs font-bold text-white shadow-2xs"
                          style="background-color: #2263c8;">
                        {{ $cat->products_count }}
                    </span>
                </td>
                <td class="px-6 py-4 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-2">
                        <a href="{{ route('categories.edit', $cat) }}"
                           class="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold transition-colors">
                            Editar
                        </a>

                        @if($cat->products_count === 0)
                        <form id="delete-category-{{ $cat->id }}" method="POST" action="{{ route('categories.destroy', $cat) }}" class="inline">
                            @csrf
                            @method('DELETE')
                            <button type="button"
                                    onclick="openDeleteModal('delete-category-{{ $cat->id }}', '{{ addslashes($cat->nome) }}', 'Deseja excluir a categoria \"{{ addslashes($cat->nome) }}\"? Esta ação não poderá ser desfeita.')"
                                    class="text-xs px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold transition-colors">
                                Excluir
                            </button>
                        </form>
                        @else
                        <span class="text-[11px] text-slate-400 italic" title="Categorias com produtos não podem ser excluídas">
                            Em uso
                        </span>
                        @endif
                    </div>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="3" class="p-0">
                    <x-empty-state
                        title="Nenhuma categoria cadastrada"
                        description="Cadastre as categorias para classificar os materiais e organizar o almoxarifado."
                        actionText="Cadastrar Primeira Categoria"
                        :actionUrl="route('categories.create')"
                    />
                </td>
            </tr>
            @endforelse
            </tbody>
        </table>
    </div>

    @if($categories->hasPages())
    <div class="px-6 py-4 border-t border-slate-100">
        {{ $categories->links() }}
    </div>
    @endif
</div>
@endsection
