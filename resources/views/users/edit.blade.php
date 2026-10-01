@extends('layouts.app')
@section('title', 'Editar Usuário')
@section('content')
<div class="max-w-lg"><div class="card">
    <h2 class="text-base font-bold mb-6" style="color:#0a0046">Editar Usuário</h2>
    <form method="POST" action="{{ route('users.update', $user) }}" class="space-y-5">
        @csrf @method('PUT')
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Nome Completo <span class="text-red-500">*</span></label>
            <input type="text" name="name" value="{{ old('name', $user->name) }}" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">E-mail <span class="text-red-500">*</span></label>
            <input type="email" name="email" value="{{ old('email', $user->email) }}" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Telefone</label>
            <input type="text" name="phone" value="{{ old('phone', $user->phone) }}" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Perfil <span class="text-red-500">*</span></label>
            <select name="role" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2">
                <option value="operador" {{ old('role', $user->role) === 'operador' ? 'selected' : '' }}>Operador</option>
                <option value="admin" {{ old('role', $user->role) === 'admin' ? 'selected' : '' }}>Administrador</option>
            </select>
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Nova Senha (deixe em branco para manter)</label>
            <input type="password" name="password" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Confirmar Nova Senha</label>
            <input type="password" name="password_confirmation" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
        </div>
        <div>
            <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="ativo" value="1" {{ old('ativo', $user->ativo) ? 'checked' : '' }} style="accent-color:#0081fc; width:16px; height:16px;">
                <span class="text-sm text-gray-700">Usuário ativo</span>
            </label>
        </div>
        <div class="flex items-center justify-end gap-3 pt-2">
            <a href="{{ route('users.index') }}" class="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</a>
            <button type="submit" class="btn-primary px-6 py-2.5">Salvar Alterações</button>
        </div>
    </form>
</div></div>
@endsection
