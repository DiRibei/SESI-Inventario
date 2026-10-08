<!DOCTYPE html>
<html lang="pt-BR" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'SESI Inventário') }} — @yield('title', 'Dashboard')</title>
    
    <!-- Google Fonts: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    
    <style>
        @media print {
            aside, header, .no-print, .btn-action, nav {
                display: none !important;
            }
            body, main {
                background: white !important;
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
            }
            .print-only {
                display: block !important;
            }
        }
    </style>
</head>
<body class="h-full bg-slate-50 text-slate-800 antialiased" style="font-family: 'Inter', sans-serif;">

<div class="flex h-full min-h-screen overflow-hidden">

    {{-- Backdrop for mobile sidebar --}}
    <div id="sidebarBackdrop" class="fixed inset-0 bg-slate-900/60 z-40 lg:hidden hidden transition-opacity" onclick="toggleSidebar()"></div>

    {{-- ── SIDEBAR ─────────────────────────────────────────────────────────── --}}
    <aside id="sidebar" class="fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 transform -translate-x-full lg:translate-x-0 lg:static shrink-0 shadow-2xl lg:shadow-none"
           style="background: linear-gradient(180deg, #0a0046 0%, #061858 100%);">

        {{-- Logo / Brand Header --}}
        <div class="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <a href="{{ route('dashboard') }}" class="flex items-center gap-3 group">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg transition-transform group-hover:scale-105"
                     style="background: linear-gradient(135deg, #0081fc, #063899);">
                    S
                </div>
                <div>
                    <div class="flex items-center gap-1.5">
                        <span class="text-white font-extrabold text-sm tracking-tight">SESI</span>
                        <span class="text-blue-400 font-semibold text-xs tracking-wider uppercase">Inventário</span>
                    </div>
                    <p class="text-white/40 text-[10px] uppercase font-bold tracking-widest">Sistema Fiep · SENAI</p>
                </div>
            </a>
            <button onclick="toggleSidebar()" class="lg:hidden text-white/60 hover:text-white p-1">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>

        {{-- Navigation Links --}}
        <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
            
            {{-- Dashboard --}}
            <a href="{{ route('dashboard') }}"
               class="nav-link {{ request()->routeIs('dashboard') ? 'active' : '' }}">
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                <span>Dashboard</span>
            </a>

            {{-- Produtos (Both Admin & Operador) --}}
            <a href="{{ route('products.index') }}"
               class="nav-link {{ request()->routeIs('products.*') ? 'active' : '' }}">
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
                <span class="flex-1">Produtos</span>
                @if(isset($globalCriticosCount) && $globalCriticosCount > 0)
                <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white animate-pulse" title="{{ $globalCriticosCount }} item(ns) em nível crítico">
                    {{ $globalCriticosCount }}
                </span>
                @endif
            </a>

            {{-- Movimentações (Both Admin & Operador) --}}
            <a href="{{ route('inventory-movements.index') }}"
               class="nav-link {{ request()->routeIs('inventory-movements.*') ? 'active' : '' }}">
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                </svg>
                <span>Movimentações</span>
            </a>

            {{-- Relatórios Gerenciais --}}
            <a href="{{ route('reports.index') }}"
               class="nav-link {{ request()->routeIs('reports.*') ? 'active' : '' }}">
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <span>Relatórios</span>
            </a>

            {{-- Manual do Usuário --}}
            <a href="{{ route('manual.index') }}"
               class="nav-link {{ request()->routeIs('manual.*') ? 'active' : '' }}">
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
                <span>Manual & Guia</span>
            </a>

            @if(auth()->user()->isAdmin())
            {{-- Admin Section --}}
            <div class="pt-5 pb-1 px-4">
                <p class="text-white/40 text-[11px] font-bold uppercase tracking-wider">Gestão do Sistema</p>
            </div>

            {{-- Categorias --}}
            <a href="{{ route('categories.index') }}"
               class="nav-link {{ request()->routeIs('categories.*') ? 'active' : '' }}">
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/>
                </svg>
                <span>Categorias</span>
            </a>

            {{-- Fornecedores --}}
            <a href="{{ route('suppliers.index') }}"
               class="nav-link {{ request()->routeIs('suppliers.*') ? 'active' : '' }}">
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                <span>Fornecedores</span>
            </a>

            {{-- Localizações --}}
            <a href="{{ route('storage-locations.index') }}"
               class="nav-link {{ request()->routeIs('storage-locations.*') ? 'active' : '' }}">
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>Localizações</span>
            </a>

            {{-- Usuários --}}
            <a href="{{ route('users.index') }}"
               class="nav-link {{ request()->routeIs('users.*') ? 'active' : '' }}">
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                <span>Usuários</span>
            </a>
            @endif
        </nav>

        {{-- Current User Pill at Bottom --}}
        <div class="border-t border-white/10 p-4 bg-black/10">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-inner"
                     style="background: linear-gradient(135deg, #0081fc, #2263c8);">
                    {{ strtoupper(substr(auth()->user()->name, 0, 1)) }}
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-white text-sm font-semibold truncate">{{ auth()->user()->name }}</p>
                    <div class="flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full {{ auth()->user()->isAdmin() ? 'bg-amber-400' : 'bg-emerald-400' }}"></span>
                        <p class="text-white/50 text-[11px] font-medium uppercase tracking-wider">{{ auth()->user()->role }}</p>
                    </div>
                </div>
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit" title="Encerrar Sessão"
                            class="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    </aside>

    {{-- ── MAIN CONTENT WRAPPER ─────────────────────────────────────────────── --}}
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">

        {{-- Top Navigation Bar --}}
        <header class="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 shrink-0 shadow-xs z-10">
            
            <div class="flex items-center gap-3">
                <button onclick="toggleSidebar()" class="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                </button>
                <div>
                    <h1 class="text-base sm:text-lg font-bold tracking-tight" style="color: #0a0046;">@yield('title', 'Dashboard')</h1>
                    @hasSection('breadcrumb')
                    <p class="text-xs text-slate-400 mt-0.5">@yield('breadcrumb')</p>
                    @endif
                </div>
            </div>

            {{-- Quick Search & Actions --}}
            <div class="flex items-center gap-3">
                
                {{-- Quick Search by Name or Code --}}
                <form action="{{ route('products.index') }}" method="GET" class="hidden md:flex items-center relative">
                    <input type="text"
                           name="search"
                           value="{{ request('search') }}"
                           placeholder="Buscar por código ou nome..."
                           class="w-56 lg:w-72 pl-9 pr-3 py-1.5 text-xs bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl transition-all outline-none focus:ring-2 focus:ring-blue-100">
                    <svg class="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                </form>

                {{-- Critical Stock Notification Indicator --}}
                <a href="{{ route('products.index', ['critico' => 1]) }}"
                   title="Alertas de Estoque Crítico"
                   class="relative p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                    </svg>
                    @if(isset($globalCriticosCount) && $globalCriticosCount > 0)
                    <span class="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-white animate-ping"></span>
                    <span class="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-white"></span>
                    @endif
                </a>

                {{-- Action: Nova Movimentação (Both Admin and Operador) --}}
                <a href="{{ route('inventory-movements.create') }}"
                   class="btn-primary text-xs px-3.5 py-2 inline-flex items-center gap-1.5 shadow-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
                    </svg>
                    <span class="hidden sm:inline">Nova</span> Movimentação
                </a>

                @if(auth()->user()->isAdmin())
                {{-- Action: Novo Produto (Admin only) --}}
                <a href="{{ route('products.create') }}"
                   class="btn-secondary text-xs px-3 py-2 hidden sm:inline-flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                    <span>Novo Produto</span>
                </a>
                @endif

            </div>
        </header>

        {{-- ── FLOATING TOAST NOTIFICATION CONTAINER ────────────────────────── --}}
        <div id="toast-container" class="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none no-print">
            {{-- Initial server-side session toasts --}}
            @if(session('success'))
            <div class="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white border border-emerald-200 shadow-xl text-slate-800 text-xs transition-all duration-300 transform toast-item"
                 style="border-left: 4px solid #10b981;">
                <div class="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                </div>
                <div class="flex-1 min-w-0 pt-0.5">
                    <p class="font-bold text-slate-900 text-xs">Sucesso</p>
                    <p class="text-slate-600 mt-0.5 leading-relaxed">{{ session('success') }}</p>
                </div>
                <button type="button" onclick="this.closest('.toast-item').remove()" class="text-slate-400 hover:text-slate-600 p-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            @endif

            @if(session('error'))
            <div class="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white border border-rose-200 shadow-xl text-slate-800 text-xs transition-all duration-300 transform toast-item"
                 style="border-left: 4px solid #ef4444;">
                <div class="w-7 h-7 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </div>
                <div class="flex-1 min-w-0 pt-0.5">
                    <p class="font-bold text-slate-900 text-xs">Atenção / Erro</p>
                    <p class="text-slate-600 mt-0.5 leading-relaxed">{{ session('error') }}</p>
                </div>
                <button type="button" onclick="this.closest('.toast-item').remove()" class="text-slate-400 hover:text-slate-600 p-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            @endif

            @if(session('warning'))
            <div class="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white border border-amber-200 shadow-xl text-slate-800 text-xs transition-all duration-300 transform toast-item"
                 style="border-left: 4px solid #f59e0b;">
                <div class="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </div>
                <div class="flex-1 min-w-0 pt-0.5">
                    <p class="font-bold text-slate-900 text-xs">Aviso do Sistema</p>
                    <p class="text-slate-600 mt-0.5 leading-relaxed">{{ session('warning') }}</p>
                </div>
                <button type="button" onclick="this.closest('.toast-item').remove()" class="text-slate-400 hover:text-slate-600 p-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            @endif

            @if(session('info') || session('status'))
            <div class="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white border border-blue-200 shadow-xl text-slate-800 text-xs transition-all duration-300 transform toast-item"
                 style="border-left: 4px solid #0081fc;">
                <div class="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div class="flex-1 min-w-0 pt-0.5">
                    <p class="font-bold text-slate-900 text-xs">Informação</p>
                    <p class="text-slate-600 mt-0.5 leading-relaxed">{{ session('info') ?? session('status') }}</p>
                </div>
                <button type="button" onclick="this.closest('.toast-item').remove()" class="text-slate-400 hover:text-slate-600 p-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            @endif
        </div>

        {{-- Main Page Scrollable Content --}}
        <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            @yield('content')
        </main>

        {{-- Footer --}}
        <footer class="bg-white border-t border-slate-200/80 px-6 py-2.5 text-center text-[11px] text-slate-400 no-print flex items-center justify-between">
            <span>Sistema Inteligente de Gerenciamento de Inventário · SESI / SENAI</span>
            <span>Versão 2.0 · PHP 8.2 & Laravel</span>
        </footer>

    </div>
</div>

{{-- ── REUSABLE CONFIRMATION MODAL ────────────────────────────────────────── --}}
<div id="confirmDeleteModal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200" onclick="if(event.target === this) closeDeleteModal()">
    <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 transform transition-all duration-200 scale-95" id="confirmDeleteCard">
        <div class="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
        </div>
        <h3 class="text-base font-extrabold text-slate-900 text-center" id="confirmDeleteTitle">Confirmar Exclusão</h3>
        <p class="text-xs text-slate-500 text-center mt-2 leading-relaxed" id="confirmDeleteMessage">
            Tem certeza que deseja prosseguir com a exclusão deste registro? Esta ação é irreversível.
        </p>
        <div class="flex items-center gap-3 mt-6">
            <button type="button" onclick="closeDeleteModal()" class="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancelar
            </button>
            <button type="button" id="confirmDeleteSubmitBtn" class="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-colors">
                Sim, Confirmar
            </button>
        </div>
    </div>
</div>

<script>
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    const isClosed = sidebar.classList.contains('-translate-x-full');
    
    if (isClosed) {
        sidebar.classList.remove('-translate-x-full');
        backdrop.classList.remove('hidden');
    } else {
        sidebar.classList.add('-translate-x-full');
        backdrop.classList.add('hidden');
    }
}

// ── TOAST NOTIFICATION UTILITY ──
window.showToast = function(message, type = 'success', title = '') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const colors = {
        success: { border: '#10b981', bg: 'bg-emerald-100', text: 'text-emerald-600', defaultTitle: 'Sucesso' },
        error:   { border: '#ef4444', bg: 'bg-rose-100', text: 'text-rose-600', defaultTitle: 'Atenção / Erro' },
        warning: { border: '#f59e0b', bg: 'bg-amber-100', text: 'text-amber-700', defaultTitle: 'Aviso' },
        info:    { border: '#0081fc', bg: 'bg-blue-100', text: 'text-blue-600', defaultTitle: 'Informação' }
    };

    const cfg = colors[type] || colors.info;
    const finalTitle = title || cfg.defaultTitle;

    const toast = document.createElement('div');
    toast.className = 'pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xl text-slate-800 text-xs transition-all duration-300 transform toast-item toast-enter';
    toast.style.borderLeft = `4px solid ${cfg.border}`;
    toast.innerHTML = `
        <div class="w-7 h-7 rounded-xl ${cfg.bg} ${cfg.text} flex items-center justify-center shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div class="flex-1 min-w-0 pt-0.5">
            <p class="font-bold text-slate-900 text-xs">${finalTitle}</p>
            <p class="text-slate-600 mt-0.5 leading-relaxed">${message}</p>
        </div>
        <button type="button" onclick="this.closest('.toast-item').remove()" class="text-slate-400 hover:text-slate-600 p-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
};

// Auto-dismiss initial toasts
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.toast-item').forEach(t => {
        setTimeout(() => {
            t.style.opacity = '0';
            t.style.transform = 'translateY(-10px)';
            setTimeout(() => t.remove(), 300);
        }, 5000);
    });
});

// ── CONFIRMATION MODAL UTILITY ──
let activeDeleteForm = null;

window.openDeleteModal = function(formIdOrElement, itemName = 'este registro', customMessage = null) {
    activeDeleteForm = (typeof formIdOrElement === 'string') ? document.getElementById(formIdOrElement) : formIdOrElement;
    const modal = document.getElementById('confirmDeleteModal');
    const card = document.getElementById('confirmDeleteCard');
    const msgEl = document.getElementById('confirmDeleteMessage');

    if (customMessage) {
        msgEl.textContent = customMessage;
    } else {
        msgEl.innerHTML = `Tem certeza que deseja remover <strong>${itemName}</strong>? Esta ação é irreversível e atualizará os dados do sistema.`;
    }

    modal.classList.remove('hidden');
    setTimeout(() => {
        card.classList.remove('scale-95');
        card.classList.add('scale-100');
    }, 10);
};

window.closeDeleteModal = function() {
    const modal = document.getElementById('confirmDeleteModal');
    const card = document.getElementById('confirmDeleteCard');
    if (modal && card) {
        card.classList.remove('scale-100');
        card.classList.add('scale-95');
        setTimeout(() => modal.classList.add('hidden'), 150);
    }
};

document.getElementById('confirmDeleteSubmitBtn')?.addEventListener('click', () => {
    if (activeDeleteForm) {
        activeDeleteForm.submit();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDeleteModal();
});
</script>
@stack('scripts')
</body>
</html>
