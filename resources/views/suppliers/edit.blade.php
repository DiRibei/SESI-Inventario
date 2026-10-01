@extends('layouts.app')
@section('title', 'Editar Fornecedor')
@section('content')
<div class="max-w-2xl"><div class="card">
    <h2 class="text-base font-bold mb-6" style="color:#0a0046">Editar Fornecedor</h2>
    <form method="POST" action="{{ route('suppliers.update', $supplier) }}" class="space-y-5">
        @csrf @method('PUT')
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Nome <span class="text-red-500">*</span></label>
                <input type="text" name="nome" value="{{ old('nome', $supplier->nome) }}" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">CNPJ</label>
                <input type="text" name="cnpj" value="{{ old('cnpj', $supplier->cnpj) }}" placeholder="00.000.000/0000-00" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
                <input type="email" name="email" value="{{ old('email', $supplier->email) }}" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Telefone</label>
                <input type="text" name="telefone" value="{{ old('telefone', $supplier->telefone) }}" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Nome do Contato</label>
                <input type="text" name="contato" value="{{ old('contato', $supplier->contato) }}" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2">
            </div>
            <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Endereço</label>
                <textarea name="endereco" rows="2" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 resize-none">{{ old('endereco', $supplier->endereco) }}</textarea>
            </div>
        </div>
        <div class="flex items-center justify-end gap-3 pt-2">
            <a href="{{ route('suppliers.index') }}" class="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</a>
            <button type="submit" class="btn-primary px-6 py-2.5">Salvar</button>
        </div>
    </form>
</div></div>
@endsection
