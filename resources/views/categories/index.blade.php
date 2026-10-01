@extends('layouts.app')
@section('title', 'Categorias')
@section('content')
<div class="flex justify-end mb-6">
    <a href="{{ route('categories.create') }}" class="btn-primary">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
        Nova Categoria
    </a>
</div>
<div class="card p-0 overflow-hidden">
    <table class="w-full text-sm">
        <thead><tr style="background:#0a0046;">
            <th class="text-left px-6 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Categoria</th>
            <th class="text-center px-4 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Produtos</th>
            <th class="text-right px-6 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Ações</th>
        </tr></thead>
        <tbody class="divide-y divide-gray-50">
        @forelse($categories as $cat)
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 flex items-center gap-3">
                <div class="w-3 h-3 rounded-full shrink-0" style="background:{{ $cat->cor }}"></div>
                <div>
                    <p class="font-semibold text-gray-800">{{ $cat->nome }}</p>
                    @if($cat->descricao)<p class="text-xs text-gray-400 truncate max-w-xs">{{ $cat->descricao }}</p>@endif
                </div>
            </td>
            <td class="px-4 py-4 text-center">
                <span class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white" style="background:#2263c8">{{ $cat->products_count }}</span>
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                    <a href="{{ route('categories.edit', $cat) }}" class="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors">Editar</a>
                    @if($cat->products_count === 0)
                    <form method="POST" action="{{ route('categories.destroy', $cat) }}" onsubmit="return confirm('Excluir categoria?')">
                        @csrf @method('DELETE')
                        <button class="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Excluir</button>
                    </form>
                    @endif
                </div>
            </td>
        </tr>
        @empty
        <tr><td colspan="3" class="px-6 py-12 text-center text-gray-400 text-sm">Nenhuma categoria cadastrada.</td></tr>
        @endforelse
        </tbody>
    </table>
    @if($categories->hasPages())<div class="px-6 py-4 border-t border-gray-100">{{ $categories->links() }}</div>@endif
</div>
@endsection
