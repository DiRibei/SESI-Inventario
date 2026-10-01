@extends('layouts.app')
@section('title', 'Fornecedores')
@section('content')
<div class="flex justify-between items-center mb-6">
    <form method="GET" action="{{ route('suppliers.index') }}" class="flex gap-3">
        <input type="text" name="search" value="{{ request('search') }}" placeholder="Buscar por nome ou CNPJ..."
               class="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white w-72">
        <button type="submit" class="btn-primary px-4 py-2.5">Buscar</button>
    </form>
    <a href="{{ route('suppliers.create') }}" class="btn-primary">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
        Novo Fornecedor
    </a>
</div>
<div class="card p-0 overflow-hidden">
    <table class="w-full text-sm">
        <thead><tr style="background:#0a0046;">
            <th class="text-left px-6 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Fornecedor</th>
            <th class="text-left px-4 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Contato</th>
            <th class="text-center px-4 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Produtos</th>
            <th class="text-right px-6 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Ações</th>
        </tr></thead>
        <tbody class="divide-y divide-gray-50">
        @forelse($suppliers as $sup)
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4">
                <p class="font-semibold text-gray-800">{{ $sup->nome }}</p>
                @if($sup->cnpj)<p class="text-xs text-gray-400 font-mono">{{ $sup->cnpj }}</p>@endif
            </td>
            <td class="px-4 py-4 text-xs text-gray-600">
                @if($sup->contato)<p>{{ $sup->contato }}</p>@endif
                @if($sup->telefone)<p class="text-gray-400">{{ $sup->telefone }}</p>@endif
                @if($sup->email)<p class="text-gray-400">{{ $sup->email }}</p>@endif
            </td>
            <td class="px-4 py-4 text-center">
                <span class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white" style="background:#2263c8">{{ $sup->products_count }}</span>
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                    <a href="{{ route('suppliers.edit', $sup) }}" class="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors">Editar</a>
                    <form method="POST" action="{{ route('suppliers.destroy', $sup) }}" onsubmit="return confirm('Excluir fornecedor?')">
                        @csrf @method('DELETE')
                        <button class="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Excluir</button>
                    </form>
                </div>
            </td>
        </tr>
        @empty
        <tr><td colspan="4" class="px-6 py-12 text-center text-gray-400 text-sm">Nenhum fornecedor cadastrado.</td></tr>
        @endforelse
        </tbody>
    </table>
    @if($suppliers->hasPages())<div class="px-6 py-4 border-t border-gray-100">{{ $suppliers->links() }}</div>@endif
</div>
@endsection
