/**
 * Mock data store para o Modo Demo / Apresentação.
 *
 * Datasets estáticos + manipulação em memória (insert/update/delete).
 * Recriado a cada reload da página — nada vai para o banco real.
 *
 * TODO: Remover este arquivo assim que o Modo Demo for descontinuado.
 */

import type { Asset, Colaborador, AuditEntry } from "./api";
import type { JiraDetailedTicket } from "./jira-utils";

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString();
}

// ──────────────────────────────────────────────────────────────────────────
// Catálogo fictício
// ──────────────────────────────────────────────────────────────────────────

const COLABORADORES_NOMES = [
  "Slash", "Axl Rose", "Freddie Mercury", "Mick Jagger", "Ozzy Osbourne",
  "James Hetfield", "Kurt Cobain", "Steven Tyler", "Bruce Dickinson", "Angus Young",
  "Brian Johnson", "Keith Richards", "Lars Ulrich", "Kirk Hammett", "Robert Trujillo",
  "Duff McKagan", "Bon Jovi", "Dave Mustaine",
  "Solvis",
];

// Mapa fixo: VIPs mais populares vão para Diretoria/cargos altos
const DEPARTAMENTO_POR_NOME: Record<string, string> = {
  "Slash": "Diretoria",
  "Axl Rose": "Diretoria",
  "Freddie Mercury": "Diretoria",
  "Mick Jagger": "Diretoria",
  "Ozzy Osbourne": "Diretoria",
  "James Hetfield": "Tecnologia",
  "Kurt Cobain": "Marketing",
  "Steven Tyler": "Comercial",
  "Bruce Dickinson": "Engenharia",
  "Angus Young": "Operações",
  "Brian Johnson": "Operações",
  "Keith Richards": "Comercial",
  "Lars Ulrich": "Tecnologia",
  "Kirk Hammett": "Produto",
  "Robert Trujillo": "Suporte",
  "Duff McKagan": "Financeiro",
  "Bon Jovi": "Recursos Humanos",
  "Dave Mustaine": "Engenharia",
};

const DEPARTAMENTOS = [
  "Tecnologia", "Comercial", "Marketing", "Financeiro", "Operações",
  "Recursos Humanos", "Diretoria", "Suporte", "Engenharia", "Produto",
];

const NOTEBOOK_MODELOS = [
  { marca: "Acme", modelo: "ProBook Premium X1", valor: 8500 },
  { marca: "Acme", modelo: "ProBook Premium X2", valor: 9200 },
  { marca: "Aurora", modelo: "UltraBook 14", valor: 6700 },
  { marca: "Aurora", modelo: "UltraBook 16 Pro", valor: 11400 },
  { marca: "Vortex", modelo: "WorkStation Z9", valor: 14900 },
  { marca: "Nimbus", modelo: "Air Lite", valor: 5800 },
  { marca: "Nimbus", modelo: "Studio Pro", valor: 12300 },
  { marca: "Phoenix", modelo: "Engineer 15", valor: 9800 },
];

// "Retirado" = em uso por colaborador (alinhado com a convenção do banco real / Dashboard).
const STATUSES_NOTE = ["Disponível", "Retirado", "Em Manutenção / Quebrado", "Em Triagem / Aguardando Teste"];
const UNIDADES = ["Matriz", "Fábrica"] as const;

const PERIPHERAL_MODELOS = [
  { brand: "Logitek", model_name: "MX Master Demo", category: "Mouse", unit_price: 590 },
  { brand: "Logitek", model_name: "K780 Wireless", category: "Teclado", unit_price: 420 },
  { brand: "Razon", model_name: "BlackWidow X", category: "Teclado", unit_price: 780 },
  { brand: "JabraDemo", model_name: "Evolve 65", category: "Headset", unit_price: 1100 },
  { brand: "PolyDemo", model_name: "Voyager 4220", category: "Headset", unit_price: 1450 },
  { brand: "DellDemo", model_name: "UltraSharp 27", category: "Monitor", unit_price: 2900 },
  { brand: "DellDemo", model_name: "UltraWide 34", category: "Monitor", unit_price: 4800 },
  { brand: "LogiCam", model_name: "C920 HD Pro", category: "Webcam", unit_price: 690 },
];

const SPARE_PARTS_CATALOG = [
  { item_name: "Memória RAM 8GB DDR4", category: "RAM", unit_price: 220 },
  { item_name: "Memória RAM 16GB DDR4", category: "RAM", unit_price: 410 },
  { item_name: "Memória RAM 16GB DDR5", category: "RAM", unit_price: 580 },
  { item_name: "SSD NVMe 256GB", category: "SSD", unit_price: 280 },
  { item_name: "SSD NVMe 512GB", category: "SSD", unit_price: 460 },
  { item_name: "SSD NVMe 1TB", category: "SSD", unit_price: 780 },
  { item_name: "HDD 1TB SATA", category: "HDD", unit_price: 320 },
  { item_name: "Fonte 65W USB-C", category: "Fonte", unit_price: 240 },
  { item_name: "Fonte 90W Notebook", category: "Fonte", unit_price: 290 },
  { item_name: "Tela 14\" FHD", category: "Tela", unit_price: 980 },
  { item_name: "Tela 15.6\" FHD", category: "Tela", unit_price: 1150 },
  { item_name: "Bateria Notebook 4 céls", category: "Bateria", unit_price: 540 },
  { item_name: "Bateria Notebook 6 céls", category: "Bateria", unit_price: 690 },
  { item_name: "Carregador USB-C 65W", category: "Carregador", unit_price: 220 },
  { item_name: "Cabo HDMI 2m", category: "Cabo", unit_price: 45 },
  { item_name: "Cabo Display Port 1.8m", category: "Cabo", unit_price: 60 },
  { item_name: "Cabo USB-C 1m", category: "Cabo", unit_price: 35 },
  { item_name: "Adaptador USB-C → HDMI", category: "Outro", unit_price: 110 },
  { item_name: "Hub USB-C 7-em-1", category: "Outro", unit_price: 280 },
  { item_name: "Mouse Pad Premium", category: "Outro", unit_price: 65 },
];


/**
 * Catálogo de chamados estratégico para apresentação:
 * - 4 categorias bem definidas (15 + 12 + 8 + 5 = 40 tickets)
 * - Distribuição realista de prioridade (Medium 40% / Low 30% / High 20% / Highest 10%)
 * - MTTR alvo por prioridade (em horas):
 *   Highest = 9.6h | High = 28.8h | Medium = 60h | Low = 98.4h
 * - Summaries personalizados com nomes dos VIPs ("rockstars")
 */
const MTTR_TARGET: Record<string, number> = {
  Highest: 9.6,
  High: 28.8,
  Medium: 60,
  Low: 98.4,
};

interface DemoJiraSpec {
  category: string;
  summary: string;
  priority: "Highest" | "High" | "Medium" | "Low";
  device: string;
  solicitante: string;
  setor: string;
  status: "Done" | "In Progress" | "Open" | "In Review";
  monthsAgo: number; // 0 = mês atual
}

const JIRA_CATALOG: DemoJiraSpec[] = [
  // ── Upgrade de Memória/SSD (15) ──
  { category: "Upgrade de Memória/SSD", summary: "Upgrade de RAM 16GB → 32GB para Slash (Diretoria)", priority: "High",    device: "Notebook", solicitante: "Slash",            setor: "Diretoria",  status: "Done",        monthsAgo: 0 },
  { category: "Upgrade de Memória/SSD", summary: "Upgrade SSD 512GB → 1TB NVMe para James Hetfield", priority: "Medium",  device: "Notebook", solicitante: "James Hetfield",   setor: "Tecnologia", status: "Done",        monthsAgo: 0 },
  { category: "Upgrade de Memória/SSD", summary: "Upgrade RAM DDR5 32GB para Bruce Dickinson",       priority: "Medium",  device: "Notebook", solicitante: "Bruce Dickinson",  setor: "Engenharia", status: "Done",        monthsAgo: 1 },
  { category: "Upgrade de Memória/SSD", summary: "Substituição SSD com bad blocks — Kirk Hammett",   priority: "High",    device: "Notebook", solicitante: "Kirk Hammett",     setor: "Produto",    status: "Done",        monthsAgo: 1 },
  { category: "Upgrade de Memória/SSD", summary: "Upgrade RAM 8GB → 16GB para Kurt Cobain",          priority: "Low",     device: "Notebook", solicitante: "Kurt Cobain",      setor: "Marketing",  status: "Done",        monthsAgo: 2 },
  { category: "Upgrade de Memória/SSD", summary: "Migração HDD → SSD NVMe — Brian Johnson",          priority: "Medium",  device: "Notebook", solicitante: "Brian Johnson",    setor: "Operações",  status: "Done",        monthsAgo: 2 },
  { category: "Upgrade de Memória/SSD", summary: "Upgrade SSD 256GB → 512GB para Dave Mustaine",     priority: "Medium",  device: "Notebook", solicitante: "Dave Mustaine",    setor: "Engenharia", status: "Done",        monthsAgo: 3 },
  { category: "Upgrade de Memória/SSD", summary: "Adição de 16GB RAM extra — Lars Ulrich",           priority: "Low",     device: "Notebook", solicitante: "Lars Ulrich",      setor: "Tecnologia", status: "Done",        monthsAgo: 3 },
  { category: "Upgrade de Memória/SSD", summary: "Upgrade RAM DDR5 64GB — Workstation Robert Trujillo", priority: "Highest", device: "Desktop", solicitante: "Robert Trujillo", setor: "Suporte",    status: "Done",        monthsAgo: 4 },
  { category: "Upgrade de Memória/SSD", summary: "Troca de SSD com falha SMART — Steven Tyler",      priority: "High",    device: "Notebook", solicitante: "Steven Tyler",     setor: "Comercial",  status: "Done",        monthsAgo: 4 },
  { category: "Upgrade de Memória/SSD", summary: "Upgrade RAM para uso de containers — Duff McKagan", priority: "Medium", device: "Notebook", solicitante: "Duff McKagan",     setor: "Financeiro", status: "Done",        monthsAgo: 5 },
  { category: "Upgrade de Memória/SSD", summary: "Migração para SSD NVMe 1TB — Bon Jovi",            priority: "Medium",  device: "Notebook", solicitante: "Bon Jovi",         setor: "Recursos Humanos", status: "Done",  monthsAgo: 5 },
  { category: "Upgrade de Memória/SSD", summary: "Solicitação upgrade RAM — Mick Jagger",            priority: "Low",     device: "Notebook", solicitante: "Mick Jagger",      setor: "Diretoria",  status: "In Progress", monthsAgo: 0 },
  { category: "Upgrade de Memória/SSD", summary: "Avaliação de SSD para upgrade — Ozzy Osbourne",    priority: "Low",     device: "Notebook", solicitante: "Ozzy Osbourne",    setor: "Diretoria",  status: "Open",        monthsAgo: 0 },
  { category: "Upgrade de Memória/SSD", summary: "Upgrade combinado RAM + SSD — Freddie Mercury",    priority: "Medium",  device: "Notebook", solicitante: "Freddie Mercury",  setor: "Diretoria",  status: "In Review",   monthsAgo: 0 },

  // ── Troca de Teclado/Mouse (12) ──
  { category: "Troca de Teclado/Mouse", summary: "Troca de teclado mecânico — Dave Mustaine",        priority: "Medium",  device: "Periférico", solicitante: "Dave Mustaine",   setor: "Engenharia", status: "Done",        monthsAgo: 0 },
  { category: "Troca de Teclado/Mouse", summary: "Mouse sem fio com defeito — Slash",                priority: "Low",     device: "Periférico", solicitante: "Slash",           setor: "Diretoria",  status: "Done",        monthsAgo: 1 },
  { category: "Troca de Teclado/Mouse", summary: "Teclado com teclas falhando — Axl Rose",           priority: "Medium",  device: "Periférico", solicitante: "Axl Rose",        setor: "Diretoria",  status: "Done",        monthsAgo: 1 },
  { category: "Troca de Teclado/Mouse", summary: "Substituição mouse ergonômico — Keith Richards",   priority: "Low",     device: "Periférico", solicitante: "Keith Richards",  setor: "Comercial",  status: "Done",        monthsAgo: 2 },
  { category: "Troca de Teclado/Mouse", summary: "Teclado ABNT2 novo — Angus Young",                 priority: "Low",     device: "Periférico", solicitante: "Angus Young",     setor: "Operações",  status: "Done",        monthsAgo: 2 },
  { category: "Troca de Teclado/Mouse", summary: "Mouse gamer com botão travado — Kirk Hammett",     priority: "Low",     device: "Periférico", solicitante: "Kirk Hammett",    setor: "Produto",    status: "Done",        monthsAgo: 3 },
  { category: "Troca de Teclado/Mouse", summary: "Troca kit teclado + mouse — James Hetfield",       priority: "Medium",  device: "Periférico", solicitante: "James Hetfield",  setor: "Tecnologia", status: "Done",        monthsAgo: 3 },
  { category: "Troca de Teclado/Mouse", summary: "Teclado com líquido derramado — Bruce Dickinson",  priority: "High",    device: "Periférico", solicitante: "Bruce Dickinson", setor: "Engenharia", status: "Done",        monthsAgo: 4 },
  { category: "Troca de Teclado/Mouse", summary: "Mouse sem resposta wireless — Lars Ulrich",        priority: "Low",     device: "Periférico", solicitante: "Lars Ulrich",     setor: "Tecnologia", status: "Done",        monthsAgo: 4 },
  { category: "Troca de Teclado/Mouse", summary: "Substituição teclado retroiluminado — Steven Tyler", priority: "Low",   device: "Periférico", solicitante: "Steven Tyler",    setor: "Comercial",  status: "Done",        monthsAgo: 5 },
  { category: "Troca de Teclado/Mouse", summary: "Mouse vertical ergonômico — Brian Johnson",        priority: "Low",     device: "Periférico", solicitante: "Brian Johnson",   setor: "Operações",  status: "Open",        monthsAgo: 0 },
  { category: "Troca de Teclado/Mouse", summary: "Teclado wireless premium — Bon Jovi",              priority: "Medium",  device: "Periférico", solicitante: "Bon Jovi",        setor: "Recursos Humanos", status: "In Progress", monthsAgo: 0 },

  // ── Configuração de Novo Notebook (8) ──
  { category: "Configuração de Novo Notebook", summary: "Setup completo notebook novo — Slash",      priority: "High",    device: "Notebook", solicitante: "Slash",           setor: "Diretoria",  status: "Done",        monthsAgo: 1 },
  { category: "Configuração de Novo Notebook", summary: "Configuração VPN + Office — Axl Rose",      priority: "Medium",  device: "Notebook", solicitante: "Axl Rose",        setor: "Diretoria",  status: "Done",        monthsAgo: 2 },
  { category: "Configuração de Novo Notebook", summary: "Provisionamento workstation — Robert Trujillo", priority: "High", device: "Notebook", solicitante: "Robert Trujillo", setor: "Suporte",    status: "Done",        monthsAgo: 3 },
  { category: "Configuração de Novo Notebook", summary: "Setup ferramentas dev — James Hetfield",    priority: "Medium",  device: "Notebook", solicitante: "James Hetfield",  setor: "Tecnologia", status: "Done",        monthsAgo: 3 },
  { category: "Configuração de Novo Notebook", summary: "Configuração inicial notebook — Kurt Cobain", priority: "Medium", device: "Notebook", solicitante: "Kurt Cobain",    setor: "Marketing",  status: "Done",        monthsAgo: 4 },
  { category: "Configuração de Novo Notebook", summary: "Setup notebook + perfil — Duff McKagan",    priority: "Medium",  device: "Notebook", solicitante: "Duff McKagan",    setor: "Financeiro", status: "Done",        monthsAgo: 5 },
  { category: "Configuração de Novo Notebook", summary: "Configuração de novo equipamento — Mick Jagger", priority: "High", device: "Notebook", solicitante: "Mick Jagger",   setor: "Diretoria",  status: "In Progress", monthsAgo: 0 },
  { category: "Configuração de Novo Notebook", summary: "Onboarding TI novo notebook — Freddie Mercury", priority: "Medium", device: "Notebook", solicitante: "Freddie Mercury", setor: "Diretoria", status: "Open",      monthsAgo: 0 },

  // ── Problemas de Conectividade (5) ──
  { category: "Problemas de Conectividade", summary: "Wi-Fi caindo intermitentemente — Bruce Dickinson", priority: "Highest", device: "Rede", solicitante: "Bruce Dickinson", setor: "Engenharia", status: "Done",        monthsAgo: 1 },
  { category: "Problemas de Conectividade", summary: "VPN corporativa instável — Lars Ulrich",       priority: "Highest", device: "Rede",     solicitante: "Lars Ulrich",     setor: "Tecnologia", status: "Done",        monthsAgo: 2 },
  { category: "Problemas de Conectividade", summary: "Sem acesso à pasta compartilhada — Keith Richards", priority: "Highest", device: "Rede", solicitante: "Keith Richards",  setor: "Comercial",  status: "Done",        monthsAgo: 3 },
  { category: "Problemas de Conectividade", summary: "Conexão lenta no ERP — Duff McKagan",          priority: "Highest", device: "Rede",     solicitante: "Duff McKagan",    setor: "Financeiro", status: "Done",        monthsAgo: 4 },
  { category: "Problemas de Conectividade", summary: "Falha de roteamento entre unidades — Angus Young", priority: "High",  device: "Rede", solicitante: "Angus Young",     setor: "Operações",  status: "In Progress", monthsAgo: 0 },
];

// ──────────────────────────────────────────────────────────────────────────
// Generators
// ──────────────────────────────────────────────────────────────────────────

function buildAssets(): Asset[] {
  const out: Asset[] = [];
  for (let i = 0; i < 50; i++) {
    const m = pick(NOTEBOOK_MODELOS, i);
    const status = pick(STATUSES_NOTE, i);
    // Apenas VIPs com departamento mapeado (exclui "Solvis") para garantir
    // que o gráfico "Investimento por Departamento" agrupe corretamente.
    const vipNames = COLABORADORES_NOMES.filter((n) => n !== "Solvis");
    const colab =
      status === "Disponível" || status.includes("Triagem")
        ? "Solvis"
        : pick(vipNames, i);
    const unidade = UNIDADES[(i * 7 + 3) % UNIDADES.length];
    out.push({
      patrimonio: `NB-${(2400 + i).toString().padStart(5, "0")}`,
      categoria: "Notebook",
      marca: m.marca,
      modelo: m.modelo,
      serial: `SN${(100000 + i * 137).toString(36).toUpperCase()}`,
      unidade: unidade as Asset["unidade"],
      status,
      valor: m.valor + ((i % 5) * 120),
      atualizadoEm: daysAgoIso((i * 11) % 600),
      colaborador: colab,
      observacoes: i % 7 === 0 ? "Renovação programada para 2026" : "",
    });
  }
  return out;
}

function buildColaboradores(): Colaborador[] {
  return COLABORADORES_NOMES.map((nome) => ({
    id: uuid(),
    nome,
    departamento: nome === "Solvis" ? null : (DEPARTAMENTO_POR_NOME[nome] ?? "Operações"),
    email: nome === "Solvis"
      ? null
      : `${nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ".")}@solvis.com.br`,
  }));
}

interface DemoPeripheralModel {
  id: string;
  brand: string;
  model_name: string;
  category: string;
  unit_price: number | null;
  created_at: string;
  updated_at: string;
}
interface DemoPeripheralItem {
  id: string;
  model_id: string;
  patrimonio: string | null;
  serial: string | null;
  status: string;
  colaborador: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

function buildPeripheralModels(): DemoPeripheralModel[] {
  return PERIPHERAL_MODELOS.map((p) => ({
    id: uuid(),
    ...p,
    created_at: daysAgoIso(120),
    updated_at: daysAgoIso(20),
  }));
}

function buildPeripheralItems(models: DemoPeripheralModel[]): DemoPeripheralItem[] {
  const out: DemoPeripheralItem[] = [];
  let n = 0;

  // VIPs que sempre devem ter periféricos vinculados (consistência com Jira / apresentação)
  const VIP_PERIPHERAL_OWNERS: Record<string, string[]> = {
    // categoria → nomes
    Mouse:   ["Slash", "James Hetfield", "Dave Mustaine", "Axl Rose", "Bruce Dickinson"],
    Teclado: ["Dave Mustaine", "Slash", "James Hetfield", "Axl Rose", "Lars Ulrich"],
    Headset: ["James Hetfield", "Slash", "Bon Jovi", "Freddie Mercury"],
    Monitor: ["Robert Trujillo", "Kirk Hammett", "Bruce Dickinson"],
    Webcam:  ["Mick Jagger", "Ozzy Osbourne"],
  };

  models.forEach((m, mi) => {
    const qty = 8 + (mi % 4) * 2; // 8, 10, 12, 14...
    const vipQueue = [...(VIP_PERIPHERAL_OWNERS[m.category] ?? [])];

    for (let i = 0; i < qty; i++) {
      // Primeiros itens do modelo: força para VIPs (Em Uso). Resto: padrão antigo.
      let status: string;
      let colab: string | null;
      if (vipQueue.length > 0) {
        status = "Em Uso";
        colab = vipQueue.shift()!;
      } else {
        status = i % 5 === 0 ? "Defeito" : i % 3 === 0 ? "Em Uso" : "Disponível";
        colab = status === "Em Uso" ? pick(COLABORADORES_NOMES, n) : null;
      }

      out.push({
        id: uuid(),
        model_id: m.id,
        patrimonio: i < qty - 2 ? `PRF-${(1000 + n).toString().padStart(5, "0")}` : null,
        serial: `S-${m.brand.slice(0, 3).toUpperCase()}-${(8000 + n * 17).toString(36).toUpperCase()}`,
        status,
        colaborador: colab,
        observacoes: null,
        created_at: daysAgoIso(80),
        updated_at: daysAgoIso(15),
      });
      n++;
    }
  });
  return out;
}

interface DemoSparePart {
  id: string;
  item_name: string;
  category: string;
  quantity: number;
  min_quantity: number;
  unit_price: number | null;
  created_at: string;
  updated_at: string;
}

function buildSpareParts(): DemoSparePart[] {
  return SPARE_PARTS_CATALOG.slice(0, 30).map((p, i) => ({
    id: uuid(),
    ...p,
    quantity: 2 + ((i * 7) % 25),
    min_quantity: 3 + (i % 4),
    created_at: daysAgoIso(180),
    updated_at: daysAgoIso(10),
  }));
}

function buildJiraTickets(): JiraDetailedTicket[] {
  const now = Date.now();
  const out: JiraDetailedTicket[] = [];

  JIRA_CATALOG.forEach((spec, i) => {
    // createdAt: distribuído dentro do mês (offset de dias por índice)
    const createdDaysAgo = spec.monthsAgo * 30 + ((i * 3) % 25) + 1;
    const createdAt = new Date(now - createdDaysAgo * 86400000).toISOString();

    const isResolved = spec.status === "Done";
    let resolutionHours: number | null = null;
    let resolvedAt: string | null = null;

    if (isResolved) {
      // MTTR alvo por prioridade ± 25% de jitter determinístico
      const target = MTTR_TARGET[spec.priority] ?? 48;
      const jitter = ((i % 5) - 2) * 0.1; // -0.2 .. +0.2
      resolutionHours = Math.round(target * (1 + jitter) * 10) / 10;
      resolvedAt = new Date(
        new Date(createdAt).getTime() + resolutionHours * 3600000,
      ).toISOString();
    }

    out.push({
      key: `DEMO-${100 + i}`,
      summary: spec.summary,
      status: spec.status,
      priority: spec.priority,
      assignee: pick(["Equipe TI", "Suporte N1", "Suporte N2", "Diego Ferreira"], i),
      setor: spec.setor,
      tipoDispositivo: spec.device,
      createdAt,
      resolvedAt,
      resolutionTimeHours: resolutionHours,
      description: `Categoria: ${spec.category}. Solicitante: ${spec.solicitante}.`,
      solicitanteEmail: `${spec.solicitante.toLowerCase().replace(/\s+/g, ".")}@empresa.com.br`,
      tipoRequisicao: spec.category,
    });
  });

  return out;
}

function buildAuditHistory(assets: Asset[]): AuditEntry[] {
  const out: AuditEntry[] = [];

  // Histórico genérico (12 eventos variados)
  for (let i = 0; i < 12; i++) {
    const a = pick(assets, i * 3);
    out.push({
      id: uuid(),
      patrimonio: a.patrimonio,
      campo: pick(["Status", "Colaborador", "Unidade", "Observações"], i),
      valor_antigo: pick(["Disponível", "Solvis", "Matriz", "—"], i),
      valor_novo: pick(["Retirado", pick(COLABORADORES_NOMES, i), "Fábrica", "Atualizado"], i),
      usuario_nome: "Diego Ferreira",
      created_at: daysAgoIso(i * 2),
    });
  }

  // Linha do tempo rica para os VIPs da apresentação (Volvo)
  const vipTimelines: Array<{ name: string; events: Array<{ daysAgo: number; campo: string; antigo: string | null; novo: string }> }> = [
    {
      name: "James Hetfield",
      events: [
        { daysAgo: 1, campo: "Status", antigo: "Disponível", novo: "Retirado" },
        { daysAgo: 1, campo: "Colaborador", antigo: "Solvis", novo: "James Hetfield" },
        { daysAgo: 30, campo: "Observações", antigo: "—", novo: "Upgrade de RAM 16GB → 32GB" },
        { daysAgo: 90, campo: "Status", antigo: "Em Manutenção / Quebrado", novo: "Disponível" },
        { daysAgo: 180, campo: "Colaborador", antigo: "James Hetfield", novo: "Solvis" },
        { daysAgo: 365, campo: "Colaborador", antigo: "Solvis", novo: "James Hetfield" },
        { daysAgo: 365, campo: "Status", antigo: "Disponível", novo: "Retirado" },
      ],
    },
    {
      name: "Slash",
      events: [
        { daysAgo: 5, campo: "Observações", antigo: "—", novo: "Tela trincada — substituída" },
        { daysAgo: 60, campo: "Unidade", antigo: "Fábrica", novo: "Matriz" },
        { daysAgo: 120, campo: "Status", antigo: "Disponível", novo: "Retirado" },
        { daysAgo: 120, campo: "Colaborador", antigo: "Solvis", novo: "Slash" },
        { daysAgo: 240, campo: "Status", antigo: "Retirado", novo: "Disponível" },
        { daysAgo: 240, campo: "Colaborador", antigo: "Slash", novo: "Solvis" },
        { daysAgo: 500, campo: "Colaborador", antigo: "Solvis", novo: "Slash" },
      ],
    },
  ];

  vipTimelines.forEach(({ name, events }) => {
    // Pega um ativo associado ao colaborador (ou o primeiro disponível)
    const heldAsset = assets.find((a) => a.colaborador === name) || assets[0];
    events.forEach((ev) => {
      out.push({
        id: uuid(),
        patrimonio: heldAsset.patrimonio,
        campo: ev.campo,
        valor_antigo: ev.antigo,
        valor_novo: ev.novo,
        usuario_nome: "Diego Ferreira",
        created_at: daysAgoIso(ev.daysAgo),
      });
    });
  });

  return out;
}

// ──────────────────────────────────────────────────────────────────────────
// Singleton store
// ──────────────────────────────────────────────────────────────────────────

class DemoStore {
  assets: Asset[] = [];
  colaboradores: Colaborador[] = [];
  peripheralModels: DemoPeripheralModel[] = [];
  peripheralItems: DemoPeripheralItem[] = [];
  spareParts: DemoSparePart[] = [];
  jira: JiraDetailedTicket[] = [];
  audit: AuditEntry[] = [];

  constructor() {
    this.reset();
  }

  reset() {
    this.assets = buildAssets();
    this.colaboradores = buildColaboradores();
    this.peripheralModels = buildPeripheralModels();
    this.peripheralItems = buildPeripheralItems(this.peripheralModels);
    this.spareParts = buildSpareParts();
    this.jira = buildJiraTickets();
    this.audit = buildAuditHistory(this.assets);
  }
}

export const demoStore = new DemoStore();
export type { DemoPeripheralModel, DemoPeripheralItem, DemoSparePart };
