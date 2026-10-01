@extends('layouts.app')
@section('title', 'Localizações de Armazenamento')
@section('content')
<div class="flex justify-end mb-6">
    <a href="{{ route('storage-locations.create') }}" class="btn-primary">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
        Nova Localização
    </a>
</div>
<div class="card p-0 overflow-hidden">
    <table class="w-full text-sm">
        <thead><tr style="background:#0a0046;">
            <th class="text-left px-6 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Localização</th>
            <th class="text-left px-4 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Tipo</th>
            <th class="text-center px-4 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Produtos</th>
            <th class="text-right px-6 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Ações</th>
        </tr></thead>
        <tbody class="divide-y divide-gray-50">
        @forelse($locations as $loc)
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4">
                <p class="font-semibold text-gray-800">{{ $loc->nome }}</p>
                <p class="text-xs font-mono text-gray-400">{{ $loc->codigo }}</p>
                @if($loc->descricao)<p class="text-xs text-gray-400">{{ $loc->descricao }}</p>@endif
            </td>
            <td class="px-4 py-4">
                @php $tipoLabels = ['galpao'=>'Galpão','prateleira'=>'Prateleira','armario'=>'Armário','sala'=>'Sala','externo'=>'Externo']; @endphp
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{{ $tipoLabels[$loc->tipo] ?? $loc->tipo }}</span>
            </td>
            <td class="px-4 py-4 text-center">
                <span class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white" style="background:#2263c8">{{ $loc->products_count }}</span>
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                    <a href="{{ route('storage-locations.edit', $loc) }}" class="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors">Editar</a>
                    <form method="POST" action="{{ route('storage-locations.destroy', $loc) }}" onsubmit="return confirm('Excluir localização?')">
                        @csrf @method('DELETE')
                        <button class="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Excluir</button>
                    </form>
                </div>
            </td>
        </tr>
        @empty
        <tr><td colspan="4" class="px-6 py-12 text-center text-gray-400 text-sm">Nenhuma localização cadastrada.</td></tr>
        @endforelse
        </tbody>
    </table>
    @if($locations->hasPages())<div class="px-6 py-4 border-t border-gray-100">{{ $locations->links() }}</div>@endif
</div>
@endsection
