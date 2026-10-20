# Roteiro Oficial de Apresentação — STOCKLERO

**Instituição:** SENAI Paraná — Unidade CIC (Cidade Industrial de Curitiba)  
**Projeto:** STOCKLERO — Sistema Web de Gestão e Controle Inteligente de Almoxarifado  
**Duração Total Estimada:** 6 a 8 minutos (~1m30s a 2m por integrante)  
**Equipe:** 4 Integrantes (Orador 1, Orador 2, Orador 3 e Orador 4)  
**Ambiente de Apresentação:** Navegador exibindo a aplicação local (`http://localhost:8000`), projetor/slides e terminal/editor de código em segundo plano se necessário.

---

## Estrutura Geral do Tempo

| Bloco | Responsável | Tópico Central | Duração Estimada |
| :--- | :--- | :--- | :--- |
| **Parte 1** | Orador 1 | Visão Geral, Contexto e Levantamento de Requisitos | 1m30s – 2m |
| **Parte 2** | Orador 2 | Arquitetura, Stack Tecnológica, Logo & Design System | 1m30s – 2m |
| **Parte 3** | Orador 3 | Banco de Dados, Regras de Negócio e Integridade Backend | 1m30s – 2m |
| **Parte 4** | Orador 4 | Demonstração Prática (Live Demo), Status Atual e Backlog | 1m45s – 2m |

---

## Orador 1: Visão Geral, Contexto e Requisitos Institucionais

- **Tempo sugerido:** 1m30s – 2m
- **Divisão de Trabalho / Papel no Projeto:** Levantamento de requisitos funcionais/não-funcionais, documentação institucional (Manual e Docs Técnicos) e planejamento de conformidade com os padrões do SENAI/SESI.

### 🎙️ Fala do Orador (Transcrição em Português Claro e Direto)

> "Bom dia a todos, professor e colegas. Hoje nosso grupo apresenta o **STOCKLERO**, uma solução web completa desenvolvida para solucionar uma dor real e diária nos almoxarifados do SENAI e SESI.
>
> Historicamente, a gestão de insumos pedagógicos e administrativos — como componentes eletroeletrônicos, filamentos 3D, ferramentas e EPIs — sofria com controles descentralizados em planilhas ou papel. Isso gerava dois grandes gargalos: a **falta inesperada de insumos essenciais** bem na hora de uma aula prática, ou o **superdimensionamento de estoque**, com desperdício de verba e materiais parados sem previsão de uso.
>
> O objetivo central do nosso projeto foi criar uma plataforma ágil, padronizada e com auditoria rigorosa. No levantamento de requisitos, estabelecemos três pilares obrigatórios:
> 1. **Rastreabilidade total**: saber exatamente *quem*, *quando*, *o que* e *por que* movimentou determinado item.
> 2. **Alertas automáticos de reposição**: sinalização visual instantânea quando o estoque atinge o limite de segurança.
> 3. **Auditoria e integridade**: histórico imutável de movimentações, sem permitir exclusões de registros que mascarassem desvios.
>
> Minha atuação no time concentrou-se na análise das diretrizes institucionais do SENAI, no mapeamento dos casos de uso, na estruturação do Manual do Usuário e na modelagem do fluxo de navegação para atender tanto os operadores do almoxarifado quanto a coordenação.
>
> Passo agora a palavra para o colega que detalhará a arquitetura e a identidade visual da plataforma."

### 🖥️ Ação Visual / Slide

- **Slide Inicial / Tela do Sistema:** Exibir a capa da apresentação com a identidade visual institucional e logo do SENAI/SESI, ou manter a tela inicial de Login da aplicação centralizada no projetor.
- **Gesto/Apontamento:** Destacar os tópicos "Rastreabilidade", "Zero Papel/Planilhas" e "Auditoria de Estoque" nos tópicos do slide.

### 🛡️ Defesa de Pergunta & Resposta (Q&A)

- **Pergunta provável do Instrutor:**  
  *"Por que optar por um sistema web proprietário em vez de continuar usando planilhas compartilhadas no Google Drive ou Excel?"*
- **Resposta exata recomendada:**  
  *"Professor, planilhas não garantem atomicidade nem controle rígido de concorrência. Qualquer usuário pode sobrescrever fórmulas, apagar linhas de histórico acidentalmente ou colocar saldo negativo sem bloqueio. O STOCKLERO centraliza o controle sob perfis de acesso (RBAC), assegura transações atômicas no banco MySQL e gera um registro histórico imutável com comprovante assinado digitalmente para cada operação."*

---

## Orador 2: Arquitetura, Stack Tecnológica, Logo & Design System

- **Tempo sugerido:** 1m30s – 2m
- **Divisão de Trabalho / Papel no Projeto:** Engenharia de Frontend, implementação dos componentes Blade, configuração do Tailwind CSS com a paleta institucional e garantia dos requisitos não-funcionais (acessibilidade e segurança de sessão).

### 🎙️ Fala do Orador (Transcrição em Português Claro e Direto)

> "Dando continuidade, vou detalhar a arquitetura técnica e as decisões de design da nossa aplicação.
>
> Para a stack, escolhemos o **Laravel 12 com PHP 8.2**, integrado ao banco de dados relacional **MySQL**. O Laravel nos forneceu um ecossistema maduro com o Eloquent ORM, controle nativo de sessões e proteção contra ameaças comuns da web, como CSRF, SQL Injection e XSS. No frontend, adotamos o motor de templates **Blade** somado ao **Tailwind CSS v4** e **Chart.js** para gráficos dinâmicos.
>
> Um cuidado especial foi dedicado ao **Design System e à Identidade Visual do STOCKLERO**. Desenvolvemos nossa marca própria com o mascote oficial da plataforma — a caixa de suprimentos ágil com tênis esportivo azul, que sintetiza visualmente a ideia de um estoque que se move com rapidez e precisão — perfeitamente harmonizada com a paleta do SENAI e SESI: o azul primário institucional `#0081fc`, o azul marinho profundo `#0a0046` e o azul cobalto `#2263c8`. Criamos componentes padronizados com hierarquia tipográfica clara, estados de *hover* e *focus* acessíveis, além de badges com cores semânticas: verde para estoque normal, amarelo para atenção e vermelho com animação pulsante para estoque crítico.
>
> No quesito não-funcional, priorizamos:
> 1. **Segurança**: senhas com hash Bcrypt via Argon2, proteção contra força bruta com *rate limiting* e controle de acesso baseado em papéis (Administrador e Operador).
> 2. **Acessibilidade e Usabilidade**: contraste de cores adequado em conformidade com as boas práticas da web, navegação por teclado e layouts fluidos para tablets e desktops.
>
> Minha responsabilidade na equipe foi estruturar as views Blade, unificar o layout mestre responsivo, configurar os tokens de estilo do Tailwind e garantir que o operador encontre qualquer funcionalidade em no máximo três cliques.
>
> Agora, o Orador 3 explicará a inteligência por trás do nosso banco de dados e as regras de negócio."

### 🖥️ Ação Visual / Slide

- **Slide/Tela:** Abrir a tela de **Login** exibindo a logo e mascote do **STOCKLERO** e, em seguida, entrar na aplicação mostrando o **Dashboard** com os cartões de indicadores (KPIs), a logo na barra lateral e os gráficos.
- **Gesto/Apontamento:** Mostrar a paleta azul SENAI nos menus de navegação laterais e no cabeçalho, apontar o badge pulsante no sino de notificações e mostrar a responsividade da barra lateral.

### 🛡️ Defesa de Pergunta & Resposta (Q&A)

- **Pergunta provável do Instrutor:**  
  *"Como vocês garantiram que o design é intuitivo e acessível para funcionários que não têm familiaridade técnica com sistemas complexos?"*
- **Resposta exata recomendada:**  
  *"Adotamos uma abordagem orientada à redução de carga cognitiva: cada tela tem um objetivo único e autoexplicativo, botões de ação primária em azul institucional destacado, indicadores de alerta em vermelho universally reconhecíveis e mensagens flash de sucesso ou erro no topo da tela. Além disso, integramos um Manual do Usuário interativo diretamente na rota `/manual` acessível com um clique na barra de navegação."*

---

## Orador 3: Lógica de Negócios, Banco de Dados e Integridade Backend

- **Tempo sugerido:** 1m30s – 2m
- **Divisão de Trabalho / Papel no Projeto:** Modelagem do diagrama relacional, escrita das Migrations, implementação dos Modelos Eloquent, relacionamentos e Services de integridade transactional.

### 🎙️ Fala do Orador (Transcrição em Português Claro e Direto)

> "O coração do **STOCKLERO** reside na sua integridade de dados e na aplicação estrita das regras de negócio.
>
> Nosso modelo relacional é composto pelas entidades: **Usuários**, **Categorias**, **Fornecedores**, **Locais de Armazenamento**, **Produtos** e **Movimentações de Estoque**. Implementamos *Soft Deletes* nas tabelas cadastrais, o que significa que se um produto ou fornecedor for desativado, nenhum dado histórico de movimentação é quebrado ou perdido.
>
> Três regras de negócio críticas foram codificadas no backend:
> 1. **Bloqueio Absoluto de Estoque Negativo**: nenhuma saída ou transferência é autorizada se a quantidade solicitada for superior ao saldo em estoque. Essa validação ocorre em três camadas: na validação da requisição HTTP, no método `hasSufficientStock()` do modelo e antes do commit no banco.
> 2. **Atomicidade através de Transações de Banco (`DB::transaction`)**: quando uma movimentação é registrada, a inserção da linha no histórico de auditoria e a atualização da coluna `estoque_atual` do produto ocorrem juntas com bloqueio pessimista via `lockForUpdate()`. Se qualquer erro acontecer, a operação sofre rollback automático, impossibilitando descompasso de saldo.
> 3. **Cálculo Automático de Status Crítico**: o método `isEstoqueCritico()` compara em tempo real se o saldo atual é menor ou igual ao estoque mínimo, disparando imediatamente os alertas nos painéis gerenciais e relatórios.
>
> Além disso, a tabela de movimentações é tratada como um **livro-razão imutável**: não existem rotas de edição ou exclusão para movimentações; correções exigem obrigatoriamente um registro de 'Ajuste de Balanço' com justificativa formal anexada.
>
> Minha atribuição no projeto foi construir as migrations, os relacionamentos Eloquent com regras de integridade referencial e os testes automatizados que validam essas proteções no PHPUnit.
>
> Com a lógica assegurada, o Orador 4 fará a demonstração prática dessas funcionalidades em tempo real."

### 🖥️ Ação Visual / Slide

- **Slide/Tela:** Exibir o diagrama ER (Relacional) simplificado no slide ou alternar rapidamente para o arquivo de rotas/código no VS Code mostrando o bloco `DB::transaction` e `lockForUpdate()` no `InventoryMovementController`.
- **Gesto/Apontamento:** Apontar no diagrama a relação 1:N entre Produtos e Movimentações e a presença do campo `estoque_antes` e `estoque_depois` para rastreamento forense.

### 🛡️ Defesa de Pergunta & Resposta (Q&A)

- **Pergunta provável do Instrutor:**  
  *"O que acontece se dois operadores tentarem registrar a saída do último item em estoque exatamente no mesmo milissegundo?"*
- **Resposta exata recomendada:**  
  *"Utilizamos a cláusula `Product::lockForUpdate()` dentro de um bloco de transação atômica do Laravel. O banco de dados bloqueia o registro do produto na primeira transação; a segunda requisição é forçada a aguardar. Quando o primeiro operador conclui a baixa, o saldo vai a zero; quando o segundo operador é atendido, a validação detecta saldo insuficiente e devolve um erro 422 legível, impedindo estoque negativo ou condição de corrida."*

---

## Orador 4: Demonstração ao Vivo, Status Atual e Próximos Passos

- **Tempo sugerido:** 1m45s – 2m
- **Divisão de Trabalho / Papel no Projeto:** Garantia de Qualidade (QA), criação dos seeders com dados de teste realistas, validação de segurança RBAC nas rotas e preparação do fluxo de homologação.

### 🎙️ Fala do Orador (Transcrição em Português Claro e Direto)

> "Agora vamos ver o **STOCKLERO** funcionando na prática através de três cenários rápidos.
>
> *(Executando o Passo 1 na tela)*  
> Primeiro, estou autenticado como **Carlos Oliveira**, um operador do almoxarifado. Reparem que o operador tem acesso rápido a 'Nova Movimentação' e listagens, mas o menu de 'Usuários do Sistema' está oculto. Se ele tentar acessar `/users` manualmente pela URL, nosso middleware barra a requisição com tela de acesso negado 403.
>
> *(Executando o Passo 2 na tela)*  
> Agora, no perfil do **Administrador Geral** (`admin@senai.br`), temos visão total dos indicadores: total de 16 produtos cadastrados, valor de patrimônio imobilizado em R$ 42 mil reais e o indicador de **Itens Críticos**. No topo direito, notem o ícone de sino piscando com a quantidade de itens que exigem compra urgente. Clicando no item crítico 'Resina para Impressora 3D', vemos que o saldo é 1 litro, bem abaixo da margem mínima estipulada de 3 litros.
>
> *(Executando o Passo 3 na tela)*  
> Vamos resolver isso agora: clico no botão **'Repor'**. O sistema abre o formulário pré-selecionando o produto. Lanço uma **Entrada** de 5 litros, com número de Nota Fiscal 'NF-98432' e motivo 'Reposição para Aulas Práticas'. Clico em Salvar.  
> Instantaneamente, somos direcionados para o **Comprovante de Movimentação**, com código rastreável, saldo anterior de 1 e novo saldo de 6 litros. Ao voltar ao Dashboard, o badge crítico desse item desapareceu e os gráficos de movimentações atualizaram em tempo real!
>
> Para concluir: hoje o projeto está com **100% dos fluxos essenciais operacionais**, cobrindo CRUDs, autenticação, transações atômicas, emissão de relatórios com filtro por categoria e exportação para CSV.
>
> Nosso backlog futuro já prevê a integração de leitor de código de barras físico via webcam e disparo automático de e-mails para o setor de compras quando um produto entrar em estado crítico.
>
> Minha função no projeto foi o desenvolvimento dos seeders de teste com dados institucionais fidedignos, a execução da suíte de testes de integração e o controle de qualidade do fluxo de usuário.
>
> Agradecemos a atenção de todos e estamos prontos para as perguntas da banca!"

### 🖥️ Roteiro Prático de Cliques (Live Demo Passo a Passo)

1. **Passo 1 (Login & RBAC - 25 seg):**
   - Efetuar login com `carlos.oliveira@senai.br` / `operador123`.
   - Mostrar menu lateral limpo (sem aba de Usuários).
   - Fazer logout e entrar como `admin@senai.br` / `admin123`.
2. **Passo 2 (Dashboard & Alertas - 25 seg):**
   - Apontar o card **"Itens Críticos"** e o sino de notificação pulsante no topo.
   - Rolar até a tabela "Produtos com Estoque Crítico" e destacar a linha do produto com badge vermelho.
3. **Passo 3 (Movimentação Atômica & Recálculo - 40 seg):**
   - Clicar no botão **"Repor"** ou ir em **Movimentações > Nova Movimentação**.
   - Selecionar tipo **Entrada**, quantidade `5`, documento `NF-98432`.
   - Clicar em **Confirmar Movimentação**.
   - Mostrar a página de **Comprovante da Movimentação** (saldo recalculado imediatamente).
   - Clicar no menu **Dashboard** e mostrar que o produto saiu da lista crítica.
4. **Passo 4 (Relatórios - 15 seg):**
   - Acessar a aba **Relatórios**, filtrar por categoria (ex: Informática/Mecânica) e mostrar o botão **Exportar CSV**.

### 🛡️ Defesa de Pergunta & Resposta (Q&A)

- **Pergunta provável do Instrutor:**  
  *"Como vocês testaram e garantiram que o sistema não vai travar ou falhar quando múltiplos usuários estiverem operando no dia a dia do SENAI?"*
- **Resposta exata recomendada:**  
  *"Desenvolvemos uma suíte de testes automatizados com PHPUnit que roda no pipeline de desenvolvimento. Cobrimos cenários extremos: tentativa de saída com saldo zerado, operações simultâneas dentro de transações de banco, testes de rotas protegidas por permissão (RBAC) e integridade de exportação CSV. Todos os 8 testes automatizados passam com 100% de sucesso."*

---

## Tabela de Credenciais para a Apresentação

| Perfil | E-mail de Acesso | Senha | Objetivo na Demo |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@senai.br` | `admin123` | Demonstrar Dashboard completo, gestão de usuários e relatórios |
| **Operador 1** | `carlos.oliveira@senai.br` | `operador123` | Demonstrar restrição de permissão (RBAC) e lançamentos diários |
| **Operador 2** | `fernanda.lima@senai.br` | `operador123` | Demonstração alternativa de usuário de almoxarifado |

---

## Dicas Finais para o Grupo

1. **Antes de Iniciar:**
   - Deixar o servidor Laravel rodando no terminal (`php artisan serve`).
   - Abrir o navegador em tela cheia (`F11`) em `http://localhost:8000/login`.
   - Ter uma aba extra aberta com o arquivo `DOCUMENTACAO_TECNICA.md` caso o professor queira ver a arquitetura em detalhes.
2. **Postura e Transição:**
   - Cada orador faz uma passagem explícita para o próximo (*"Passo a palavra para o colega que explicará..."*).
   - Se houver qualquer lentidão no computador, mantenha a calma e explique o conceito teórico enquanto a tela carrega.
3. **Distribuição Equilibrada:**
   - Todos os 4 integrantes têm tempos idênticos de fala e papéis técnicos bem definidos perante a banca avaliadora.
