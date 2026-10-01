# Manual do Usuário — Sistema Inteligente de Gerenciamento de Inventário

**SESI / SENAI — Curso Técnico em Desenvolvimento de Sistemas**  
**Unidade:** Rua Senador Accioly Filho, 298 — Cidade Industrial de Curitiba/PR  
**Sistema:** Gerenciamento Inteligente de Almoxarifado e Inventário  

---

## 1. Introdução e Objetivo

Este manual foi elaborado para orientar os operadores de almoxarifado, instrutores e administradores na utilização diária do **Sistema Inteligente de Gerenciamento de Inventário**. O sistema substitui completamente planilhas e formulários em papel, proporcionando:
- Controle em tempo real do saldo de materiais, ferramentas e insumos.
- Rastreamento completo de quem requisitou ou inseriu cada item.
- Notificações automáticas quando um produto atinge o estoque de segurança.
- Emissão de relatórios para prestação de contas com exportação para Excel e impressão formal com assinaturas.

---

## 2. Acesso ao Sistema e Credenciais

Acesse o sistema no navegador através do endereço local:  
👉 **`http://127.0.0.1:8000`**

### Usuários Pré-Cadastrados para Teste e Avaliação:

| Perfil | Nome | E-mail de Acesso | Senha Padrão |
|---|---|---|---|
| **Administrador** | Administrador Geral | `admin@senai.br` | `admin123` |
| **Operador 1** | Carlos Oliveira | `carlos.oliveira@senai.br` | `operador123` |
| **Operador 2** | Fernanda Lima | `fernanda.lima@senai.br` | `operador123` |

> 🔒 **Dica de Segurança:** Não compartilhe suas credenciais. Cada movimentação no sistema fica associada ao usuário autenticado para fins de auditoria.

---

## 3. Navegação pelo Painel de Controle (Dashboard)

Ao efetuar o login, a tela inicial apresenta o painel com indicadores vitais em tempo real:

1. **Card "Total de Produtos":** Quantidade de materiais cadastrados e ativos no catálogo.
2. **Card "Patrimônio em Estoque":** Valor monetário total imobilizado no almoxarifado (calculado com base no saldo atual multiplicado pelo preço de custo).
3. **Card "Itens em Alerta Crítico":** Número de materiais cujo saldo está igual ou abaixo do estoque mínimo. Se houver itens críticos, o card ganha destaque em vermelho com indicador pulsante.
4. **Card "Movimentações no Mês":** Total de entradas e saídas operadas no mês vigente, destacando o fluxo do dia.
5. **Gráfico de Fluxo de Entradas e Saídas:** Exibe as barras diárias dos últimos 7 dias, permitindo comparar o volume de entradas (verde) versus saídas (vermelho).
6. **Gráfico de Produtos por Categoria:** Gráfico em rosca que demonstra a proporção do acervo dividida entre Elétrica, Mecânica, EPI, Informática, Limpeza e Escritório.
7. **Tabela de Alertas de Estoque Mínimo:** Lista os itens prioritários com barra de progresso visual do saldo restante e botão rápido de **"Repor"**.

---

## 4. Consulta Rápida de Produtos e Saldo em Estoque

O operador pode verificar a disponibilidade de qualquer produto em segundos:

### Opção A: Busca Rápida no Topo da Tela
- No campo de busca localizado na barra superior, digite qualquer parte do **nome** do produto, do **código/SKU** (ex: `ELE-001`) ou código de barras.
- Pressione **Enter**. O sistema exibirá a listagem filtrada imediatamente.

### Opção B: Tela do Catálogo de Produtos
1. Clique no menu lateral **"Produtos"**.
2. Filtre por **Categoria** (ex: Elétrica, EPIs, etc.).
3. Marque a caixa de seleção **"Somente Críticos"** para visualizar apenas os materiais que necessitam de pedido de compra.
4. Na coluna **"Saldo em Estoque"**, observe a quantidade atual e a localização física recomendada (ex: `GAL-A-P01`).
5. Clique em **"Detalhes"** para abrir a ficha completa do material, com fornecedor homologado, custo unitário e histórico de saídas.

---

## 5. Registro de Movimentações de Estoque

Toda entrada ou retirada de material do almoxarifado deve ser registrada no ato da entrega:

### Passo a Passo para Lançar Movimentação:
1. No menu superior ou lateral, clique em **"Nova Movimentação"** (ou no atalho verde/vermelho do Dashboard).
2. Escolha o **Tipo de Operação**:
   - **Entrada (+):** Chegada de materiais comprados ou devolvidos.
   - **Saída (-):** Retirada de materiais para aulas práticas, oficinas ou setores administrativos.
   - **Ajuste:** Correção de divergência identificada após contagem física de inventário.
   - **Transferência:** Mudança de prateleira ou galpão.
3. Selecione o **Produto**. Assim que escolhido, o sistema exibirá uma caixa informando o saldo atual disponível e o estoque mínimo.
4. Digite a **Quantidade**:
   - 🛡️ **Proteção contra Estoque Negativo:** O sistema calcula a projeção do novo saldo em tempo real. Se você tentar dar saída em 10 unidades de um item que só possui 6 em estoque, o sistema acusará erro e **bloqueará o botão de confirmação**, impedindo que o saldo fique negativo.
5. Preencha os dados complementares:
   - **Número do Documento:** Nota fiscal de compra, ordem de serviço ou requisição interna.
   - **Lote e Data de Validade:** Obrigatório para materiais químicos ou perecíveis.
   - **Motivo / Justificativa:** Breve descrição da destinação do material.
6. Clique em **"Confirmar e Registrar"**.

### Comprovante e Auditoria
Após registrar a movimentação, o sistema direciona automaticamente para o **Comprovante de Movimentação Auditado**, que exibe:
- Número de protocolo único.
- Responsável que efetuou o registro com carimbo de data e hora.
- Saldo anterior versus saldo posterior.
- Botão **"Imprimir Comprovante"** para colher assinatura física do requisitante.

---

## 6. Gestão de Alertas de Estoque Mínimo

O sistema monitora continuamente o nível dos materiais:
- Quando o saldo de um produto atinge ou fica abaixo do seu estoque mínimo, um ponto de notificação vermelho com animação aparece no ícone de sino no topo do menu.
- No Dashboard, a lista de alertas oferece o botão **"Repor"** ao lado de cada item. Clicar nele abre a tela de movimentação com o produto e o tipo *Entrada* já pré-selecionados, agilizando o ressuprimento.

---

## 7. Emissão de Relatórios Gerenciais e Auditoria

Para conferências periódicas, prestação de contas ou reuniões de coordenação:

1. No menu lateral, acesse **"Relatórios"**.
2. Escolha um período pré-definido pelos botões rápidos (*Hoje*, *Últimos 7 dias*, *Últimos 30 dias*, *Mês Atual*) ou defina uma data inicial e final personalizada.
3. Filtre, se desejar, por tipo de operação (somente entradas ou somente saídas), categoria ou produto específico.
4. Analise a faixa de resumo:
   - Total de registros encontrados.
   - Volume total de unidades que entraram.
   - Volume total de unidades que saíram.
   - Saldo líquido de peças no período.
   - Estimativa do valor financeiro transacionado.

### Exportação para Planilha (Excel):
- Clique no botão verde **"Exportar Excel (CSV)"**. O download do arquivo `.csv` começará automaticamente, configurado no padrão UTF-8 com separador ponto-e-vírgula compatível com o Microsoft Excel em português.

### Impressão Formal:
- Clique no botão **"Imprimir Relatório"**. O sistema ativará o modo de impressão limpo, ocultando menus e exibindo o cabeçalho institucional do SENAI com as linhas para assinatura do almoxarife e do coordenador.

---

## 8. Recursos Exclusivos para Administradores

Os usuários com perfil **admin** possuem acesso aos módulos de gestão cadastral:
- **Produtos:** Cadastro de novos códigos SKU, definição de estoque mínimo e máximo, associação com fornecedor e custo de compra.
- **Categorias:** Criação de agrupamentos (ex: Ferramentas, Químicos) com personalização de cor para identificação visual rápida.
- **Fornecedores:** Registro de parceiros comerciais, CNPJ, telefone, e-mail e contato comercial.
- **Localizações Físicas:** Cadastro de galpões, corredores, prateleiras e gavetas do almoxarifado.
- **Usuários:** Criação de novos operadores, definição de papéis e redefinição de senhas de acesso.

---

## 9. Perguntas Frequentes (FAQ)

### Posso excluir ou editar uma movimentação errada?
**Não.** Para assegurar a integridade e evitar adulterações na contabilidade do inventário, as movimentações são estritamente imutáveis. Caso tenha lançado uma quantidade incorreta, lance uma nova movimentação do tipo **"Ajuste"** com a justificativa da correção.

### Por que o sistema não me permite dar saída em um produto?
O sistema não permite saídas cuja quantidade seja maior que o saldo em estoque. Verifique se o produto não necessita de um lançamento prévio de entrada de nota fiscal antes de ser retirado.

### O que fazer caso eu esqueça minha senha?
Solicite ao administrador do sistema que acesse o menu **"Usuários"**, localize sua conta e redefina sua senha de acesso.

---

**SENAI — Serviço Nacional de Aprendizagem Industrial**  
*Desenvolvido para excelência operacional e conformidade técnica institucional.*
