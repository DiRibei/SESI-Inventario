/**
 * Jira BI utilities — detailed ticket analytics.
 * Separated from api.ts for maintainability.
 */

export interface JiraDetailedTicket {
  key: string;
  summary: string;
  status: string;
  priority: string;
  assignee: string;
  setor: string;
  tipoDispositivo: string;
  createdAt: string;
  resolvedAt: string | null;
  resolutionTimeHours: number | null;
  description?: string;
  solicitanteEmail?: string;
  tipoRequisicao?: string;
}

/**
 * Map raw n8n data to JiraDetailedTicket.
 * Supports both new detailed format and legacy aggregated format.
 */
export function mapRawToDetailedJira(raw: Record<string, unknown>): JiraDetailedTicket {
  const createdAt = String(raw["createdAt"] ?? raw["created"] ?? raw["Created"] ?? "");
  const resolvedAt = raw["resolvedAt"] ?? raw["resolutiondate"] ?? raw["Resolved"] ?? null;
  const resolvedStr = resolvedAt ? String(resolvedAt) : null;

  let resolutionTimeHours: number | null = null;
  if (createdAt && resolvedStr) {
    const created = new Date(createdAt);
    const resolved = new Date(resolvedStr);
    if (!isNaN(created.getTime()) && !isNaN(resolved.getTime())) {
      resolutionTimeHours = Math.round((resolved.getTime() - created.getTime()) / (1000 * 60 * 60) * 10) / 10;
    }
  }

  return {
    key: String(raw["key"] ?? raw["Key"] ?? raw["id"] ?? ""),
    summary: String(raw["summary"] ?? raw["Summary"] ?? raw["descricao"] ?? ""),
    status: String(raw["status"] ?? raw["Status"] ?? ""),
    priority: String(raw["priority"] ?? raw["Priority"] ?? raw["prioridade"] ?? "Medium"),
    assignee: String(raw["assignee"] ?? raw["Assignee"] ?? raw["responsavel"] ?? "Não atribuído"),
    setor: String(raw["setor"] ?? raw["Setor"] ?? raw["department"] ?? ""),
    tipoDispositivo: String(raw["tipoDispositivo"] ?? raw["Tipo de Dispositivo"] ?? raw["tipo_dispositivo"] ?? ""),
    createdAt,
    resolvedAt: resolvedStr,
    resolutionTimeHours,
    description: String(raw["description"] ?? ""),
    solicitanteEmail: String(raw["solicitanteEmail"] ?? raw["email"] ?? ""),
    tipoRequisicao: String(raw["tipoRequisicao"] ?? ""),
  };
}

/**
 * Average resolution time in hours (only resolved tickets).
 */
export function getAverageLeadTime(tickets: JiraDetailedTicket[]): number {
  const resolved = tickets.filter((t) => t.resolutionTimeHours !== null);
  if (resolved.length === 0) return 0;
  return Math.round(resolved.reduce((sum, t) => sum + t.resolutionTimeHours!, 0) / resolved.length * 10) / 10;
}

/**
 * Format hours to human-readable string.
 */
export function formatLeadTime(hours: number): string {
  if (hours === 0) return "—";
  if (hours < 24) return `${hours.toFixed(1)}h`;
  const days = Math.round(hours / 24 * 10) / 10;
  return `${days}d`;
}

/**
 * Priority distribution for pie chart.
 */
export function getPriorityDistribution(tickets: JiraDetailedTicket[]) {
  const map: Record<string, number> = {};
  tickets.forEach((t) => {
    const p = t.priority || "Sem prioridade";
    map[p] = (map[p] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

/**
 * Monthly volume for line chart (tickets created per month).
 */
export function getMonthlyVolume(tickets: JiraDetailedTicket[]) {
  const map: Record<string, number> = {};
  tickets.forEach((t) => {
    if (!t.createdAt) return;
    const d = new Date(t.createdAt);
    if (isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => {
      const [y, m] = month.split("-");
      const label = `${["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][parseInt(m) - 1]}/${y.slice(2)}`;
      return { month: label, chamados: count };
    });
}

/**
 * Status distribution from detailed tickets.
 */
export function getDetailedStatusDistribution(tickets: JiraDetailedTicket[]) {
  const map: Record<string, number> = {};
  tickets.forEach((t) => {
    map[t.status] = (map[t.status] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

/**
 * SLA compliance percentage (resolved within target hours).
 */
export function getSlaCompliance(tickets: JiraDetailedTicket[], targetHours = 48): number {
  const resolved = tickets.filter((t) => t.resolutionTimeHours !== null);
  if (resolved.length === 0) return 0;
  const withinSla = resolved.filter((t) => t.resolutionTimeHours! <= targetHours).length;
  return Math.round((withinSla / resolved.length) * 100);
}

// --- Mock detailed Jira data ---

export const MOCK_DETAILED_JIRA: JiraDetailedTicket[] = [
  { key: "TI-101", summary: "Notebook não liga após atualização", status: "Done", priority: "High", assignee: "Carlos Silva", setor: "Comercial", tipoDispositivo: "Notebook", createdAt: "2025-01-05T09:00:00Z", resolvedAt: "2025-01-06T14:30:00Z", resolutionTimeHours: 29.5 },
  { key: "TI-102", summary: "Impressora sem conexão na rede", status: "Done", priority: "Medium", assignee: "Ana Souza", setor: "Financeiro", tipoDispositivo: "Impressora", createdAt: "2025-01-08T10:00:00Z", resolvedAt: "2025-01-09T11:00:00Z", resolutionTimeHours: 25 },
  { key: "TI-103", summary: "Troca de teclado defeituoso", status: "Done", priority: "Low", assignee: "Pedro Alves", setor: "RH", tipoDispositivo: "Teclado", createdAt: "2025-01-12T08:00:00Z", resolvedAt: "2025-01-12T10:30:00Z", resolutionTimeHours: 2.5 },
  { key: "TI-104", summary: "VPN corporativa instável", status: "In Progress", priority: "High", assignee: "Carlos Silva", setor: "TI", tipoDispositivo: "Rede", createdAt: "2025-01-15T14:00:00Z", resolvedAt: null, resolutionTimeHours: null },
  { key: "TI-105", summary: "Monitor sem imagem", status: "Done", priority: "Medium", assignee: "Ana Souza", setor: "Marketing", tipoDispositivo: "Monitor", createdAt: "2025-01-18T09:00:00Z", resolvedAt: "2025-01-19T16:00:00Z", resolutionTimeHours: 31 },
  { key: "TI-106", summary: "Configuração de notebook novo", status: "Done", priority: "Medium", assignee: "Pedro Alves", setor: "Diretoria", tipoDispositivo: "Notebook", createdAt: "2025-01-22T08:00:00Z", resolvedAt: "2025-01-22T17:00:00Z", resolutionTimeHours: 9 },
  { key: "TI-107", summary: "Mouse sem resposta wireless", status: "Done", priority: "Low", assignee: "Carlos Silva", setor: "Comercial", tipoDispositivo: "Mouse", createdAt: "2025-02-01T10:00:00Z", resolvedAt: "2025-02-01T11:30:00Z", resolutionTimeHours: 1.5 },
  { key: "TI-108", summary: "Notebook superaquecendo", status: "Open", priority: "High", assignee: "Ana Souza", setor: "Financeiro", tipoDispositivo: "Notebook", createdAt: "2025-02-05T09:00:00Z", resolvedAt: null, resolutionTimeHours: null },
  { key: "TI-109", summary: "Headset com ruído", status: "Done", priority: "Low", assignee: "Pedro Alves", setor: "RH", tipoDispositivo: "Headset", createdAt: "2025-02-10T08:00:00Z", resolvedAt: "2025-02-10T09:30:00Z", resolutionTimeHours: 1.5 },
  { key: "TI-110", summary: "Servidor de arquivos lento", status: "Done", priority: "High", assignee: "Carlos Silva", setor: "TI", tipoDispositivo: "Servidor", createdAt: "2025-02-14T07:00:00Z", resolvedAt: "2025-02-16T18:00:00Z", resolutionTimeHours: 59 },
  { key: "TI-111", summary: "Atualização de SO em massa", status: "Done", priority: "Medium", assignee: "Ana Souza", setor: "TI", tipoDispositivo: "Notebook", createdAt: "2025-02-20T08:00:00Z", resolvedAt: "2025-02-22T17:00:00Z", resolutionTimeHours: 57 },
  { key: "TI-112", summary: "Suporte p/ notebook quebrado", status: "Done", priority: "Low", assignee: "Pedro Alves", setor: "Comercial", tipoDispositivo: "Suporte", createdAt: "2025-03-01T10:00:00Z", resolvedAt: "2025-03-01T11:00:00Z", resolutionTimeHours: 1 },
  { key: "TI-113", summary: "Cabo de rede danificado 3º andar", status: "Done", priority: "Medium", assignee: "Carlos Silva", setor: "Marketing", tipoDispositivo: "Rede", createdAt: "2025-03-05T14:00:00Z", resolvedAt: "2025-03-06T10:00:00Z", resolutionTimeHours: 20 },
  { key: "TI-114", summary: "Instalação de software ERP", status: "In Progress", priority: "High", assignee: "Ana Souza", setor: "Financeiro", tipoDispositivo: "Notebook", createdAt: "2025-03-10T08:00:00Z", resolvedAt: null, resolutionTimeHours: null },
  { key: "TI-115", summary: "Troca de kit teclado e mouse", status: "Done", priority: "Low", assignee: "Pedro Alves", setor: "RH", tipoDispositivo: "Kit Teclado e Mouse", createdAt: "2025-03-12T09:00:00Z", resolvedAt: "2025-03-12T10:00:00Z", resolutionTimeHours: 1 },
];
