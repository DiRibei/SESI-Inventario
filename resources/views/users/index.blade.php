@extends('layouts.app')
@section('title', 'Usuários do Sistema')
@section('content')
<div class="flex justify-end mb-6">
    <a href="{{ route('users.create') }}" class="btn-primary">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
        Novo Usuário
    </a>
</div>
<div class="card p-0 overflow-hidden">
    <table class="w-full text-sm">
        <thead><tr style="background:#0a0046;">
            <th class="text-left px-6 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Usuário</th>
            <th class="text-left px-4 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Perfil</th>
            <th class="text-left px-4 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Status</th>
            <th class="text-right px-6 py-3.5 text-white/70 text-xs font-semibold uppercase tracking-wider">Ações</th>
        </tr></thead>
        <tbody class="divide-y divide-gray-50">
        @forelse($users as $user)
        <tr class="hover:bg-gray-50 transition-colors {{ !$user->ativo ? 'opacity-60' : '' }}">
            <td class="px-6 py-4 flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style="background:#0081fc">
                    {{ strtoupper(substr($user->name, 0, 1)) }}
                </div>
                <div>
                    <p class="font-semibold text-gray-800">{{ $user->name }} {{ $user->id === auth()->id() ? '<span class="text-xs text-gray-400">(você)</span>' : '' }}</p>
                    <p class="text-xs text-gray-400">{{ $user->email }}</p>
                </div>
            </td>
            <td class="px-4 py-4">
                @if($user->isAdmin())
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold" style="background:#0a004615; color:#0a0046">Admin</span>
                @else
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Operador</span>
                @endif
            </td>
            <td class="px-4 py-4">
                @if($user->ativo)
                <span class="badge-ok">Ativo</span>
                @else
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Inativo</span>
                @endif
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                    <a href="{{ route('users.edit', $user) }}" class="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors">Editar</a>
                    @if($user->id !== auth()->id())
                    <form method="POST" action="{{ route('users.destroy', $user) }}" onsubmit="return confirm('Excluir usuário {{ $user->name }}?')">
                        @csrf @method('DELETE')
                        <button class="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Excluir</button>
                    </form>
                    @endif
                </div>
            </td>
        </tr>
        @empty
        <tr><td colspan="4" class="px-6 py-12 text-center text-gray-400 text-sm">Nenhum usuário encontrado.</td></tr>
        @endforelse
        </tbody>
    </table>
    @if($users->hasPages())<div class="px-6 py-4 border-t border-gray-100">{{ $users->links() }}</div>@endif
</div>
@endsection
