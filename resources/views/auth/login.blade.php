<!DOCTYPE html>
<html lang="pt-BR" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Login — SESI Inventário SENAI</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="h-full flex items-center justify-center min-h-screen" style="font-family:'Inter',sans-serif; background: linear-gradient(135deg, #0a0046 0%, #063899 50%, #0a0046 100%);">

    {{-- Decorative blobs --}}
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10" style="background: #0081fc; filter: blur(60px);"></div>
        <div class="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10" style="background: #5a80ff; filter: blur(60px);"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5" style="background: #2263c8; filter: blur(80px);"></div>
    </div>

    <div class="relative w-full max-w-md px-6">

        {{-- Brand header --}}
        <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-2xl"
                 style="background: linear-gradient(135deg, #0081fc, #2263c8);">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
            </div>
            <h1 class="text-2xl font-extrabold text-white tracking-tight">SESI Inventário</h1>
            <p class="text-white/50 text-sm mt-1">Sistema Inteligente de Gerenciamento de Inventário</p>
            <p class="text-white/30 text-xs mt-1 font-medium tracking-widest uppercase">SENAI</p>
        </div>

        {{-- Login card --}}
        <div class="rounded-2xl p-8 shadow-2xl border border-white/10"
             style="background: rgba(255,255,255,0.07); backdrop-filter: blur(20px);">

            <h2 class="text-white font-semibold text-lg mb-6">Entrar na sua conta</h2>

            <form method="POST" action="{{ route('login') }}" class="space-y-5">
                @csrf

                {{-- Email --}}
                <div>
                    <label for="email" class="block text-white/70 text-sm font-medium mb-1.5">E-mail</label>
                    <input id="email" type="email" name="email" value="{{ old('email') }}" required autofocus autocomplete="email"
                           class="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-white/30 border transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent"
                           style="background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); focus:ring-color: #0081fc;"
                           onfocus="this.style.borderColor='#0081fc'; this.style.boxShadow='0 0 0 3px rgba(0,129,252,0.25)'"
                           onblur="this.style.borderColor='rgba(255,255,255,0.15)'; this.style.boxShadow='none'"
                           placeholder="seu@senai.br">
                    @error('email')
                    <p class="text-red-400 text-xs mt-1.5">{{ $message }}</p>
                    @enderror
                </div>

                {{-- Password --}}
                <div>
                    <label for="password" class="block text-white/70 text-sm font-medium mb-1.5">Senha</label>
                    <input id="password" type="password" name="password" required autocomplete="current-password"
                           class="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-white/30 border transition-all duration-200 focus:outline-none"
                           style="background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15);"
                           onfocus="this.style.borderColor='#0081fc'; this.style.boxShadow='0 0 0 3px rgba(0,129,252,0.25)'"
                           onblur="this.style.borderColor='rgba(255,255,255,0.15)'; this.style.boxShadow='none'"
                           placeholder="••••••••">
                    @error('password')
                    <p class="text-red-400 text-xs mt-1.5">{{ $message }}</p>
                    @enderror
                </div>

                {{-- Remember me --}}
                <div class="flex items-center justify-between">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="remember" id="remember"
                               class="w-4 h-4 rounded" style="accent-color: #0081fc;">
                        <span class="text-white/60 text-sm">Lembrar-me</span>
                    </label>
                </div>

                {{-- Submit --}}
                <button type="submit"
                        class="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 shadow-lg active:scale-[0.98]"
                        style="background: linear-gradient(135deg, #0081fc, #063899);"
                        onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                    Entrar no sistema
                </button>
            </form>
        </div>

        <p class="text-center text-white/25 text-xs mt-6">
            &copy; {{ date('Y') }} SENAI — Uso restrito a colaboradores autorizados
        </p>
    </div>

</body>
</html>
