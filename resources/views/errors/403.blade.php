<!DOCTYPE html>
<html lang="pt-BR" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>403 — Acesso Restrito | SESI Inventário</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="h-full flex items-center justify-center p-6 bg-slate-50 antialiased" style="font-family:'Inter',sans-serif;">

    <div class="max-w-md w-full text-center">
        <div class="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl mb-6"
             style="background: linear-gradient(135deg, #0a0046, #063899);">
            <svg class="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
        </div>

        <span class="text-xs font-mono font-extrabold uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-800 tracking-wider">
            Erro 403 · Acesso Não Autorizado
        </span>

        <h1 class="text-2xl font-black text-slate-900 mt-4 tracking-tight" style="color: #0a0046;">
            Área Restrita a Administradores
        </h1>

        <p class="text-xs text-slate-500 mt-2 leading-relaxed">
            Seu perfil atual de <strong>Operador</strong> não possui privilégios para executar esta ação ou acessar este módulo. Caso necessite de acesso especial, consulte a coordenação do SENAI.
        </p>

        <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="{{ route('dashboard') }}" class="btn-primary w-full sm:w-auto text-xs px-5 py-2.5 justify-center shadow-md">
                Ir para o Painel
            </a>
            <a href="{{ route('products.index') }}" class="btn-secondary w-full sm:w-auto text-xs px-5 py-2.5 justify-center">
                Consultar Produtos
            </a>
        </div>

        <p class="text-[11px] text-slate-400 mt-8">
            Sistema Inteligente de Gerenciamento de Inventário · SESI / SENAI
        </p>
    </div>

</body>
</html>
