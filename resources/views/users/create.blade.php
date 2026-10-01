@extends('layouts.app')
@section('title', isset($user) ? 'Editar Usuário' : 'Novo Usuário')
@section('content')
<div class="max-w-lg"><div class="card">
    <h2 class="text-base font-bold mb-6" style="color:#0a0046">{{ isset($user) ? 'Editar' : 'Novo' }} Usuário</h2>
    <form method="POST" action="{{ isset($user) ? route('users.update', $user) : route('users.store') }}" class="space-y-5">
        @csrf @if(isset($user)) @method('PUT') @endif
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Nome Completo <span class="text-red-500">*</span></label>
            <input type="text" name="name" value="{{ old('name', $user->name ?? '') }}" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
            @error('name') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">E-mail <span class="text-red-500">*</span></label>
            <input type="email" name="email" value="{{ old('email', $user->email ?? '') }}" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
            @error('email') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Telefone</label>
            <input type="text" name="phone" value="{{ old('phone', $user->phone ?? '') }}" placeholder="(11) 0000-0000" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Perfil <span class="text-red-500">*</span></label>
            <select name="role" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2">
                <option value="operador" {{ old('role', $user->role ?? 'operador') === 'operador' ? 'selected' : '' }}>Operador — registra movimentações e visualiza estoque</option>
                <option value="admin" {{ old('role', $user->role ?? '') === 'admin' ? 'selected' : '' }}>Administrador — acesso total ao sistema</option>
            </select>
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ isset($user) ? 'Nova Senha (deixe em branco para manter)' : 'Senha' }} @if(!isset($user)) <span class="text-red-500">*</span> @endif</label>
            <input type="password" name="password" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" {{ isset($user) ? '' : 'required' }}>
            @error('password') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Confirmar Senha</label>
            <input type="password" name="password_confirmation" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
        </div>
        @if(isset($user))
        <div>
            <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="ativo" value="1" {{ old('ativo', $user->ativo) ? 'checked' : '' }} style="accent-color:#0081fc; width:16px; height:16px;">
                <span class="text-sm text-gray-700">Usuário ativo</span>
            </label>
        </div>
        @endif
        <div class="flex items-center justify-end gap-3 pt-2">
            <a href="{{ route('users.index') }}" class="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</a>
            <button type="submit" class="btn-primary px-6 py-2.5">{{ isset($user) ? 'Salvar Alterações' : 'Criar Usuário' }}</button>
        </div>
    </form>
</div></div>
@endsection
