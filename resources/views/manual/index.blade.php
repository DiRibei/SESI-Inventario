@extends('layouts.app')

@section('title', 'Manual do Usuário & Guia Operacional')
@section('breadcrumb', 'Orientações oficiais do almoxarifado · SENAI')

@section('content')
<div class="max-w-4xl mx-auto space-y-8">

    {{-- Hero Banner --}}
    <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div class="relative z-10">
            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30">
                Documentação Oficial
            </span>
            <h1 class="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">Sistema Inteligente de Gerenciamento de Inventário</h1>
            <p class="text-sm text-blue-100/80 mt-2 max-w-2xl leading-relaxed">
                Guia prático para operadores e administradores do almoxarifado do SESI / SENAI. Conheça as funcionalidades de rastreamento, controle atômico de saldos, alertas de estoque mínimo e emissão de relatórios gerenciais.
            </p>
        </div>
        <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>

    {{-- Roles & Responsibilities Matrix --}}
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <h2 class="text-base font-extrabold text-slate-900 mb-2 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            1. Matriz de Perfis e Permissões
        </h2>
        <p class="text-xs text-slate-500 mb-4">O sistema opera com controle estrito de acesso baseado em papéis (RBAC):</p>
        
        <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
                <thead class="text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100 font-semibold">
                    <tr>
                        <th class="px-4 py-3">Funcionalidade / Módulo</th>
                        <th class="px-4 py-3 text-center">Operador</th>
                        <th class="px-4 py-3 text-center">Administrador</th>
                        <th class="px-4 py-3">Observações de Regra de Negócio</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium">
                    <tr>
                        <td class="px-4 py-3 font-semibold text-slate-800">Visualizar Dashboard e Indicadores</td>
                        <td class="px-4 py-3 text-center text-emerald-600 font-bold">✓ Total</td>
                        <td class="px-4 py-3 text-center text-emerald-600 font-bold">✓ Total</td>
                        <td class="px-4 py-3 text-slate-500 text-[11px]">Acesso aos gráficos e alertas de estoque mínimo em tempo real.</td>
                    </tr>
                    <tr>
                        <td class="px-4 py-3 font-semibold text-slate-800">Consultar Catálogo de Produtos e Saldo</td>
                        <td class="px-4 py-3 text-center text-emerald-600 font-bold">✓ Leitura</td>
                        <td class="px-4 py-3 text-center text-emerald-600 font-bold">✓ Completo</td>
                        <td class="px-4 py-3 text-slate-500 text-[11px]">Operadores podem pesquisar por código, SKU ou nome para verificar disponibilidade.</td>
                    </tr>
                    <tr>
                        <td class="px-4 py-3 font-semibold text-slate-800">Registrar Entrada / Saída / Ajuste</td>
                        <td class="px-4 py-3 text-center text-emerald-600 font-bold">✓ Permitido</td>
                        <td class="px-4 py-3 text-center text-emerald-600 font-bold">✓ Permitido</td>
                        <td class="px-4 py-3 text-slate-500 text-[11px]">Atualiza o saldo atomicamente no banco. Bloqueia saídas maiores que o saldo.</td>
                    </tr>
                    <tr>
                        <td class="px-4 py-3 font-semibold text-slate-800">Relatórios Gerenciais e Exportação</td>
                        <td class="px-4 py-3 text-center text-emerald-600 font-bold">✓ Consulta</td>
                        <td class="px-4 py-3 text-center text-emerald-600 font-bold">✓ Completo</td>
                        <td class="px-4 py-3 text-slate-500 text-[11px]">Filtros por período, tipo, material, exportação para Excel e impressão com assinatura.</td>
                    </tr>
                    <tr>
                        <td class="px-4 py-3 font-semibold text-slate-800">Cadastrar / Editar / Excluir Produtos</td>
                        <td class="px-4 py-3 text-center text-rose-500 font-bold">✗ Bloqueado</td>
                        <td class="px-4 py-3 text-center text-emerald-600 font-bold">✓ Exclusivo</td>
                        <td class="px-4 py-3 text-slate-500 text-[11px]">Garante a padronização cadastral e integridade do catálogo do SENAI.</td>
                    </tr>
                    <tr>
                        <td class="px-4 py-3 font-semibold text-slate-800">Gestão de Fornecedores, Categorias e Locais</td>
                        <td class="px-4 py-3 text-center text-rose-500 font-bold">✗ Bloqueado</td>
                        <td class="px-4 py-3 text-center text-emerald-600 font-bold">✓ Exclusivo</td>
                        <td class="px-4 py-3 text-slate-500 text-[11px]">Dados mestres protegidos contra edições inadvertidas.</td>
                    </tr>
                    <tr>
                        <td class="px-4 py-3 font-semibold text-slate-800">Gerenciamento de Usuários e Senhas</td>
                        <td class="px-4 py-3 text-center text-rose-500 font-bold">✗ Bloqueado</td>
                        <td class="px-4 py-3 text-center text-emerald-600 font-bold">✓ Exclusivo</td>
                        <td class="px-4 py-3 text-slate-500 text-[11px]">Criação de novos operadores e redefinição segura de credenciais.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    {{-- Step-by-Step Operational Guides --}}
    <div class="space-y-6">

        {{-- Guide 1: Consultando Estoque --}}
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <h3 class="text-sm font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-extrabold flex items-center justify-center">2</span>
                Como Realizar uma Consulta Rápida de Estoque
            </h3>
            <div class="text-xs text-slate-600 space-y-2 leading-relaxed">
                <p>O almoxarife ou operador pode consultar a disponibilidade de qualquer material em segundos:</p>
                <ol class="list-decimal list-inside space-y-1.5 pl-2 text-slate-700">
                    <li>No menu superior, digite o <strong>código</strong> (ex: <code class="bg-slate-100 px-1 py-0.5 rounded font-mono">ELE-001</code>) ou o <strong>nome</strong> do material na barra de busca e pressione <em>Enter</em>.</li>
                    <li>Como alternativa, acesse a aba <a href="{{ route('products.index') }}" class="text-blue-600 font-semibold underline">Produtos</a> para filtrar por categoria ou marcar o checkbox <strong>"Somente Críticos"</strong>.</li>
                    <li>Na tabela, confira a coluna <strong>Saldo em Estoque</strong>, a <strong>Localização Física</strong> (ex: Galpão A - Prateleira 2) e o status do material.</li>
                    <li>Clique no botão <strong>"Detalhes"</strong> para abrir a ficha completa do produto com custo médio, fornecedor e histórico de requisições.</li>
                </ol>
            </div>
        </div>

        {{-- Guide 2: Lançando Entrada e Saída --}}
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <h3 class="text-sm font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-extrabold flex items-center justify-center">3</span>
                Como Registrar Entradas, Saídas e Requisições
            </h3>
            <div class="text-xs text-slate-600 space-y-2 leading-relaxed">
                <p>Todas as entradas e saídas de materiais devem ser registradas no ato físico da movimentação:</p>
                <ol class="list-decimal list-inside space-y-1.5 pl-2 text-slate-700">
                    <li>Clique no botão azul <strong>"Nova Movimentação"</strong> no topo da tela ou vá até <a href="{{ route('inventory-movements.create') }}" class="text-blue-600 font-semibold underline">Registrar Movimentação</a>.</li>
                    <li>Selecione o <strong>Tipo de Operação</strong>:
                        <ul class="list-disc list-inside pl-4 mt-1 space-y-0.5 text-slate-500">
                            <li><strong class="text-emerald-700">Entrada:</strong> Recebimento de compra, devolução ou doação ao almoxarifado.</li>
                            <li><strong class="text-rose-700">Saída:</strong> Requisição de material por oficina, laboratório ou departamento.</li>
                            <li><strong class="text-amber-700">Ajuste:</strong> Correção decorrente de contagem física de inventário periódico.</li>
                        </ul>
                    </li>
                    <li>Escolha o <strong>Produto</strong>. O sistema exibirá instantaneamente o saldo disponível e a margem de segurança.</li>
                    <li>Informe a <strong>Quantidade</strong>. O campo <em>"Projeção do Novo Saldo"</em> mostrará em tempo real como o estoque ficará após a confirmação.</li>
                    <li><strong>Trava de Segurança:</strong> Em saídas, o sistema impede a digitação de quantidades maiores que o saldo atual, eliminando estoques negativos.</li>
                    <li>Preencha os campos de apoio: <strong>Número de Documento / NF / Requisição</strong>, <strong>Lote</strong>, <strong>Validade</strong> e <strong>Motivo</strong>.</li>
                    <li>Clique em <strong>"Confirmar e Registrar"</strong>. O comprovante detalhado com hash de auditoria será gerado imediatamente.</li>
                </ol>
            </div>
        </div>

        {{-- Guide 3: Gestão de Alertas de Estoque Mínimo --}}
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <h3 class="text-sm font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-extrabold flex items-center justify-center">4</span>
                Monitoramento e Ação sobre Alertas de Estoque Mínimo
            </h3>
            <div class="text-xs text-slate-600 space-y-2 leading-relaxed">
                <p>O sistema conta com detecção proativa de escassez de materiais:</p>
                <ul class="list-disc list-inside space-y-1.5 pl-2 text-slate-700">
                    <li>O ícone do <strong>Sino de Notificação</strong> no menu superior exibe um indicador vermelho pulsante sempre que houver produtos com saldo menor ou igual ao estoque mínimo.</li>
                    <li>No <a href="{{ route('dashboard') }}" class="text-blue-600 font-semibold underline">Dashboard</a>, o card <strong>"Itens em Alerta Crítico"</strong> destaca a quantidade de itens que precisam de ressuprimento urgente.</li>
                    <li>Na lista de alertas do painel, clique diretamente no botão <strong>"Repor"</strong> para abrir a tela de entrada com o produto já selecionado.</li>
                </ul>
            </div>
        </div>

        {{-- Guide 4: Relatórios e Impressão --}}
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <h3 class="text-sm font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-extrabold flex items-center justify-center">5</span>
                Emissão de Relatórios Gerenciais e Auditoria
            </h3>
            <div class="text-xs text-slate-600 space-y-2 leading-relaxed">
                <p>Para prestação de contas, inventários anuais ou conferência semanal:</p>
                <ol class="list-decimal list-inside space-y-1.5 pl-2 text-slate-700">
                    <li>Acesse a seção <a href="{{ route('reports.index') }}" class="text-blue-600 font-semibold underline">Relatórios</a> no menu lateral.</li>
                    <li>Utilize os atalhos rápidos de período: <em>Hoje</em>, <em>Últimos 7 dias</em>, <em>Últimos 30 dias</em> ou <em>Mês Atual</em>.</li>
                    <li>Para análises em planilhas externas, clique no botão <strong>"Exportar Excel (CSV)"</strong>. O arquivo gerado inclui codificação UTF-8 compatível com Excel brasileiro.</li>
                    <li>Para emissão de relatório físico para assinaturas, clique em <strong>"Imprimir Relatório"</strong>. A página ajusta a formatação automaticamente, oculta os menus e exibe o cabeçalho institucional do SENAI com os campos de assinatura para o almoxarife e a coordenação.</li>
                </ol>
            </div>
        </div>

    </div>

    {{-- Technical Support / Institutional Footer --}}
    <div class="p-6 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
            <p class="font-bold text-slate-700">SESI / SENAI — Curso Técnico em Desenvolvimento de Sistemas</p>
            <p class="mt-0.5">Rua Senador Accioly Filho, 298 · Cidade Industrial de Curitiba · Telefone: (41) 3271-7100</p>
        </div>
        <div class="text-right shrink-0">
            <span class="font-mono text-slate-400">Versão: 2.0.0-PROD</span>
        </div>
    </div>

</div>
@endsection
