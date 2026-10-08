@extends('layouts.app')

@section('title', 'Usuários e Permissões')
@section('breadcrumb', 'Gestão de operadores e administradores do sistema')

@section('content')
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
        <h2 class="text-base font-extrabold text-slate-900">Usuários Cadastrados</h2>
        <p class="text-xs text-slate-500 mt-0.5">Controle de acesso por papel: Administradores e Operadores de Almoxarifado</p>
    </div>
    <a href="{{ route('users.create') }}" class="btn-primary text-xs px-4 py-2 shrink-0 shadow-xs inline-flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
        Novo Usuário
    </a>
</div>

<div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
            <thead class="text-white uppercase tracking-wider font-semibold" style="background-color: #0a0046;">
                <tr>
                    <th class="px-6 py-3.5">Colaborador / E-mail</th>
                    <th class="px-4 py-3.5">Perfil de Acesso</th>
                    <th class="px-4 py-3.5">Status</th>
                    <th class="px-6 py-3.5 text-right">Ações</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
            @forelse($users as $user)
            <tr class="hover:bg-slate-50 transition-colors {{ !$user->ativo ? 'opacity-60 bg-slate-50/50' : '' }}">
                <td class="px-6 py-4 flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs"
                         style="background: linear-gradient(135deg, #0081fc, #2263c8);">
                        {{ strtoupper(substr($user->name, 0, 1)) }}
                    </div>
                    <div>
                        <div class="flex items-center gap-1.5">
                            <p class="font-bold text-slate-900 text-sm">{{ $user->name }}</p>
                            @if($user->id === auth()->id())
                            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Você</span>
                            @endif
                        </div>
                        <p class="text-[11px] text-slate-400 mt-0.5">{{ $user->email }}</p>
                        @if($user->phone)<p class="text-[10px] text-slate-400 font-mono">{{ $user->phone }}</p>@endif
                    </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                    @if($user->isAdmin())
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                        <span class="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                        Administrador
                    </span>
                    @else
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        Operador
                    </span>
                    @endif
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                    @if($user->ativo)
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        ✓ Ativo
                    </span>
                    @else
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                        Inativo
                    </span>
                    @endif
                </td>
                <td class="px-6 py-4 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-2">
                        <a href="{{ route('users.edit', $user) }}"
                           class="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold transition-colors">
                            Editar
                        </a>

                        @if($user->id !== auth()->id())
                        <form id="delete-user-{{ $user->id }}" method="POST" action="{{ route('users.destroy', $user) }}" class="inline">
                            @csrf
                            @method('DELETE')
                            <button type="button"
                                    onclick="openDeleteModal('delete-user-{{ $user->id }}', '{{ addslashes($user->name) }}', 'Deseja remover ou desativar o usuário \"{{ addslashes($user->name) }}\"? Se houver movimentações auditadas, o acesso será desativado com segurança.')"
                                    class="text-xs px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold transition-colors">
                                Excluir
                            </button>
                        </form>
                        @endif
                    </div>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="4" class="p-0">
                    <x-empty-state
                        title="Nenhum usuário cadastrado"
                        description="Cadastre operadores e administradores para gerenciar o almoxarifado."
                        actionText="Cadastrar Primeiro Usuário"
                        :actionUrl="route('users.create')"
                    />
                </td>
            </tr>
            @endforelse
            </tbody>
        </table>
    </div>

    @if($users->hasPages())
    <div class="px-6 py-4 border-t border-slate-100">
        {{ $users->links() }}
    </div>
    @endif
</div>
@endsection
