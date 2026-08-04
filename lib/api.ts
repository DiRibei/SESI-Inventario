import { supabase as typedSupabase } from "./supabase";
import type { UnidadeFilterValue } from "@/components/UnidadeFilter";
// TODO: Remover este bloco assim que o Modo Demo for descontinuado.
import { isDemoActive } from "./demoMode";
import { demoStore } from "./demoData";
import { smartFilter, matchesQuery } from "./fuzzySearch";

// Cast to any to work with legacy column names (Portuguese with accents)
const supabase = typedSupabase as any;

// ──────────────────────────────────────────────────────────────────────────
// Demo helpers (interceptam read/write quando o Modo Demo está ativo)
// ──────────────────────────────────────────────────────────────────────────

function demoFilterAssets(
  list: Asset[],
  search: string,
  statusFilter: string,
  unidadeFilter: UnidadeFilterValue
): Asset[] {
  let out = list;
  if (statusFilter && statusFilter !== "Todos") out = out.filter((a) => a.status === statusFilter);
  if (unidadeFilter && unidadeFilter !== "Todos") out = out.filter((a) => a.unidade === unidadeFilter);
  if (search.trim()) {
    out = smartFilter(out, search, [
      "patrimonio",
      "categoria",
      "marca",
      "modelo",
      "colaborador",
      "status",
      "serial",
    ]);
  }
  return out;
}

export type Unidade = "Matriz" | "Fábrica" | "Notebooks";

export interface Asset {
  patrimonio: string;
  categoria: string;
  marca: string;
  modelo: string;
  serial: string;
  unidade: Unidade;
  status: string;
  valor: number;
  atualizadoEm: string;
  colaborador: string;
  observacoes: string;
}

// --- Supabase CRUD ---

export async function fetchAssets(): Promise<Asset[]> {
  // TODO: Remover ao desativar Modo Demo.
  if (isDemoActive()) return [...demoStore.assets];

  const { data, error } = await supabase
    .from("EstoqueSolvis")
    .select("*");

  if (error) {
    console.error("Erro ao buscar ativos:", error);
    return [];
  }

  return (data || [])
    .filter((r: any) => r["Patrimônio"] && String(r["Patrimônio"]).trim())
    .map(mapRowToAsset);
}

export interface PaginatedResult {
  data: Asset[];
  total: number;
}

function applyServerFilters(
  query: any,
  statusFilter: string,
  unidadeFilter: UnidadeFilterValue
) {
  query = query.not("Patrimônio", "is", null).neq("Patrimônio", "");

  if (statusFilter && statusFilter !== "Todos") {
    query = query.eq("Status", statusFilter);
  }

  if (unidadeFilter && unidadeFilter !== "Todos") {
    query = query.eq("Unidade", unidadeFilter);
  }

  return query;
}

export type SortColumn = "patrimonio" | "categoria" | "marca" | "colaborador" | "status" | "unidade" | "valor";
export type SortDirection = "asc" | "desc";

const SORT_COLUMN_MAP: Record<SortColumn, string> = {
  patrimonio: "Patrimônio",
  categoria: "Categoria",
  marca: "Marca",
  colaborador: "Colaborador",
  status: "Status",
  unidade: "Unidade",
  valor: "Valor",
};

const ASSET_SEARCH_FIELDS: Array<keyof Asset> = [
  "patrimonio",
  "categoria",
  "marca",
  "modelo",
  "colaborador",
  "status",
  "serial",
];

export async function fetchPaginatedAssets(options: {
  page: number;
  pageSize: number;
  search?: string;
  statusFilter?: string;
  unidadeFilter?: UnidadeFilterValue;
  sortColumn?: SortColumn;
  sortDirection?: SortDirection;
}): Promise<PaginatedResult> {
  const { page, pageSize, search = "", statusFilter = "Todos", unidadeFilter = "Todos", sortColumn = "patrimonio", sortDirection = "asc" } = options;

  // TODO: Remover ao desativar Modo Demo.
  if (isDemoActive()) {
    const filtered = demoFilterAssets(demoStore.assets, search, statusFilter, unidadeFilter as UnidadeFilterValue);
    const dir = sortDirection === "asc" ? 1 : -1;
    const sorted = [...filtered].sort((a, b) => {
      const av = (a as any)[sortColumn];
      const bv = (b as any)[sortColumn];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av ?? "").localeCompare(String(bv ?? "")) * dir;
    });
    const from = (page - 1) * pageSize;
    return { data: sorted.slice(from, from + pageSize), total: filtered.length };
  }

  const dbColumn = SORT_COLUMN_MAP[sortColumn] || "Patrimônio";
  const hasSearch = !!search.trim();

  // Quando há busca textual, fazemos o filtro/ordenação/paginação no cliente
  // para garantir tolerância a acentos e fuzzy. Limitamos a 5000 linhas para
  // segurança (estoque atual está bem abaixo disso).
  if (hasSearch) {
    let query = supabase.from("EstoqueSolvis").select("*").limit(5000);
    query = applyServerFilters(query, statusFilter, unidadeFilter);
    const { data, error } = await query;
    if (error) {
      console.error("Erro ao buscar ativos paginados (search):", error);
      return { data: [], total: 0 };
    }
    const all = (data || []).map(mapRowToAsset);
    const filtered = smartFilter(all, search, ASSET_SEARCH_FIELDS);
    const dir = sortDirection === "asc" ? 1 : -1;
    const sorted = [...filtered].sort((a, b) => {
      const av = (a as any)[sortColumn];
      const bv = (b as any)[sortColumn];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av ?? "").localeCompare(String(bv ?? "")) * dir;
    });
    const from = (page - 1) * pageSize;
    return { data: sorted.slice(from, from + pageSize), total: filtered.length };
  }

  // Sem busca: paginação 100% server-side (rápido para grandes volumes).
  let query = supabase.from("EstoqueSolvis").select("*", { count: "exact" });
  query = applyServerFilters(query, statusFilter, unidadeFilter);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.order(dbColumn, { ascending: sortDirection === "asc", nullsFirst: sortDirection === "asc" }).range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Erro ao buscar ativos paginados:", error);
    return { data: [], total: 0 };
  }

  const assets = (data || []).map(mapRowToAsset);
  return { data: assets, total: count || 0 };
}

export async function fetchTotalStats(): Promise<{ totalCount: number; totalValue: number }> {
  // TODO: Remover ao desativar Modo Demo.
  if (isDemoActive()) {
    return {
      totalCount: demoStore.assets.length,
      totalValue: demoStore.assets.reduce((s, a) => s + (a.valor || 0), 0),
    };
  }

  const { data, error } = await supabase
    .from("EstoqueSolvis")
    .select("Valor")
    .not("Patrimônio", "is", null)
    .neq("Patrimônio", "");

  if (error) {
    console.error("Erro ao buscar stats:", error);
    return { totalCount: 0, totalValue: 0 };
  }

  const rows = data || [];
  return {
    totalCount: rows.length,
    totalValue: rows.reduce((sum, r) => sum + (Number(r["Valor"]) || 0), 0),
  };
}

export async function createAsset(asset: Omit<Asset, "atualizadoEm">): Promise<{ ok: boolean; error?: string }> {
  // TODO: Remover ao desativar Modo Demo.
  if (isDemoActive()) {
    demoStore.assets = [{ ...asset, atualizadoEm: new Date().toISOString() } as Asset, ...demoStore.assets];
    return { ok: true };
  }

  const { error } = await supabase.from("EstoqueSolvis").insert({
    "Patrimônio": asset.patrimonio,
    "Categoria": asset.categoria,
    "Marca": asset.marca || null,
    "modelo": asset.modelo || null,
    "serial": asset.serial || null,
    "Unidade": asset.unidade || null,
    "Status": asset.status || null,
    "Valor": asset.valor || 0,
    "Colaborador": asset.colaborador || null,
    "observacoes": asset.observacoes || null,
    "Atualizado_Em": new Date().toISOString(),
  });
  if (error) { console.error("Erro ao criar ativo:", error); return { ok: false, error: error.message }; }
  return { ok: true };
}

export async function updateAsset(patrimonio: string, data: Partial<Asset>): Promise<{ ok: boolean; error?: string }> {
  // TODO: Remover ao desativar Modo Demo.
  if (isDemoActive()) {
    demoStore.assets = demoStore.assets.map((a) =>
      a.patrimonio === patrimonio ? { ...a, ...data, atualizadoEm: new Date().toISOString() } : a
    );
    return { ok: true };
  }

  const payload: Record<string, unknown> = {};
  if (data.categoria !== undefined) payload["Categoria"] = data.categoria;
  if (data.marca !== undefined) payload["Marca"] = data.marca || null;
  if (data.modelo !== undefined) payload["modelo"] = data.modelo || null;
  if (data.serial !== undefined) payload["serial"] = data.serial || null;
  if (data.unidade !== undefined) payload["Unidade"] = data.unidade || null;
  if (data.status !== undefined) payload["Status"] = data.status || null;
  if (data.valor !== undefined) payload["Valor"] = data.valor || 0;
  if (data.colaborador !== undefined) payload["Colaborador"] = data.colaborador || null;
  if (data.observacoes !== undefined) payload["observacoes"] = data.observacoes || null;
  payload["Atualizado_Em"] = new Date().toISOString();

  const { error } = await supabase
    .from("EstoqueSolvis")
    .update(payload)
    .eq("Patrimônio", patrimonio);

  if (error) { console.error("Erro ao atualizar ativo:", error); return { ok: false, error: error.message }; }
  return { ok: true };
}

export async function deleteAsset(patrimonio: string): Promise<boolean> {
  // TODO: Remover ao desativar Modo Demo.
  if (isDemoActive()) {
    demoStore.assets = demoStore.assets.filter((a) => a.patrimonio !== patrimonio);
    return true;
  }

  const { error } = await supabase
    .from("EstoqueSolvis")
    .delete()
    .eq("Patrimônio", patrimonio);

  if (error) { console.error("Erro ao deletar ativo:", error); return false; }
  return true;
}

export async function bulkUpdateAssets(patrimonios: string[], updates: Partial<Asset>): Promise<boolean> {
  // TODO: Remover ao desativar Modo Demo.
  if (isDemoActive()) {
    const set = new Set(patrimonios);
    demoStore.assets = demoStore.assets.map((a) =>
      set.has(a.patrimonio) ? { ...a, ...updates, atualizadoEm: new Date().toISOString() } : a
    );
    return true;
  }

  const payload: Record<string, unknown> = {};
  if (updates.categoria !== undefined) payload["Categoria"] = updates.categoria;
  if (updates.marca !== undefined) payload["Marca"] = updates.marca || null;
  if (updates.modelo !== undefined) payload["modelo"] = updates.modelo || null;
  if (updates.serial !== undefined) payload["serial"] = updates.serial || null;
  if (updates.unidade !== undefined) payload["Unidade"] = updates.unidade || null;
  if (updates.status !== undefined) payload["Status"] = updates.status;
  if (updates.valor !== undefined) payload["Valor"] = updates.valor || 0;
  if (updates.colaborador !== undefined) payload["Colaborador"] = updates.colaborador;
  if (updates.observacoes !== undefined) payload["observacoes"] = updates.observacoes || null;
  payload["Atualizado_Em"] = new Date().toISOString();

  const { error } = await supabase
    .from("EstoqueSolvis")
    .update(payload)
    .in("Patrimônio", patrimonios);

  if (error) { console.error("Erro ao atualizar em lote:", error); return false; }
  return true;
}

export async function checkinAsset(patrimonio: string): Promise<boolean> {
  // TODO: Remover ao desativar Modo Demo.
  if (isDemoActive()) {
    demoStore.assets = demoStore.assets.map((a) =>
      a.patrimonio === patrimonio ? { ...a, atualizadoEm: new Date().toISOString() } : a
    );
    return true;
  }

  const { error } = await supabase
    .from("EstoqueSolvis")
    .update({ "Atualizado_Em": new Date().toISOString() })
    .eq("Patrimônio", patrimonio);

  if (error) { console.error("Erro ao fazer check-in:", error); return false; }
  return true;
}

export function isStale(atualizadoEm: string): boolean {
  if (!atualizadoEm) return false;
  const updated = new Date(atualizadoEm);
  if (isNaN(updated.getTime())) return false;
  const diffMs = Date.now() - updated.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays > 540;
}

// --- Audit History ---

export interface AuditEntry {
  id: string;
  patrimonio: string;
  campo: string;
  valor_antigo: string | null;
  valor_novo: string | null;
  usuario_nome: string;
  created_at: string;
}

export async function logAuditCreation(
  patrimonio: string,
  userName: string,
  userId?: string
): Promise<void> {
  // TODO: Remover ao desativar Modo Demo.
  if (isDemoActive()) {
    demoStore.audit = [
      {
        id: crypto.randomUUID(),
        patrimonio,
        campo: "Criação",
        valor_antigo: null,
        valor_novo: "Ativo registrado no sistema",
        usuario_nome: userName,
        created_at: new Date().toISOString(),
      },
      ...demoStore.audit,
    ];
    return;
  }

  const { error } = await supabase.from("HistoricoAtivos").insert({
    ativo_id: patrimonio,
    campo_alterado: "Criação",
    valor_antigo: null,
    valor_novo: "Ativo registrado no sistema",
    usuario_nome: userName,
  });
  if (error) {
    console.error("❌ Erro ao inserir histórico de criação:", JSON.stringify(error));
  } else {
    console.log("✅ Histórico de criação registrado para", patrimonio);
  }
}

export async function logAuditChanges(
  patrimonio: string,
  oldValues: Record<string, string>,
  newValues: Record<string, string>,
  userName: string,
  _userId?: string
): Promise<void> {
  const entries: any[] = [];

  for (const key of Object.keys(newValues)) {
    const oldVal = oldValues[key] || "";
    const newVal = newValues[key] || "";
    if (oldVal !== newVal) {
      entries.push({
        ativo_id: patrimonio,
        campo_alterado: key,
        valor_antigo: oldVal || null,
        valor_novo: newVal || null,
        usuario_nome: userName,
      });
    }
  }

  if (entries.length === 0) return;

  // TODO: Remover ao desativar Modo Demo.
  if (isDemoActive()) {
    const now = new Date().toISOString();
    demoStore.audit = [
      ...entries.map((e) => ({
        id: crypto.randomUUID(),
        patrimonio: e.ativo_id,
        campo: e.campo_alterado,
        valor_antigo: e.valor_antigo,
        valor_novo: e.valor_novo,
        usuario_nome: e.usuario_nome,
        created_at: now,
      })),
      ...demoStore.audit,
    ];
    return;
  }

  const { error } = await supabase.from("HistoricoAtivos").insert(entries);
  if (error) {
    console.error("❌ Erro ao inserir histórico:", JSON.stringify(error));
    throw new Error(`Falha ao registrar histórico: ${error.message} (code: ${error.code})`);
  } else {
    console.log("✅ Histórico inserido com sucesso:", entries.length, "entradas para patrimônio", patrimonio);
  }
}

export async function fetchRecentAuditHistory(limit = 5): Promise<AuditEntry[]> {
  // TODO: Remover ao desativar Modo Demo.
  if (isDemoActive()) {
    return [...demoStore.audit]
      .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
      .slice(0, limit);
  }

  const { data, error } = await supabase
    .from("HistoricoAtivos")
    .select("*")
    .order("data_mudanca", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("❌ Erro ao buscar histórico recente:", JSON.stringify(error));
    return [];
  }
  return (data || []).map(mapAuditRow);
}

export interface CollaboratorTimelineEntry extends AuditEntry {
  asset?: {
    categoria: string;
    marca: string;
    modelo: string;
  };
}

export async function fetchCollaboratorHistory(
  collaboratorName: string,
  currentAssets: Asset[]
): Promise<CollaboratorTimelineEntry[]> {
  // Mapa patrim. -> dados do ativo (para enriquecer o card)
  const assetMap = new Map<string, Asset>();
  currentAssets.forEach((a) => assetMap.set(a.patrimonio, a));

  // TODO: Remover ao desativar Modo Demo.
  if (isDemoActive()) {
    const heldPatrimonios = new Set(
      currentAssets.filter((a) => a.colaborador === collaboratorName).map((a) => a.patrimonio)
    );
    const entries = demoStore.audit.filter((e) => {
      if (heldPatrimonios.has(e.patrimonio)) return true;
      if (e.campo === "Colaborador") {
        return e.valor_antigo === collaboratorName || e.valor_novo === collaboratorName;
      }
      return false;
    });
    return entries
      .map((e) => ({ ...e, asset: assetMap.get(e.patrimonio) }))
      .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  }

  const heldPatrimonios = currentAssets
    .filter((a) => a.colaborador === collaboratorName)
    .map((a) => a.patrimonio);

  // Busca: histórico de qualquer ativo atualmente do colaborador
  // OU entradas de Colaborador onde o nome aparece (recebido/devolvido)
  const queries: Promise<any>[] = [];

  if (heldPatrimonios.length > 0) {
    queries.push(
      supabase
        .from("HistoricoAtivos")
        .select("*")
        .in("ativo_id", heldPatrimonios)
    );
  }

  queries.push(
    supabase
      .from("HistoricoAtivos")
      .select("*")
      .eq("campo_alterado", "Colaborador")
      .or(`valor_antigo.eq.${collaboratorName},valor_novo.eq.${collaboratorName}`)
  );

  const results = await Promise.all(queries);
  const merged = new Map<string, any>();
  results.forEach(({ data, error }) => {
    if (error) {
      console.error("❌ Erro ao buscar histórico do colaborador:", JSON.stringify(error));
      return;
    }
    (data || []).forEach((row: any) => merged.set(row.id, row));
  });

  return Array.from(merged.values())
    .map(mapAuditRow)
    .map((e) => ({ ...e, asset: assetMap.get(e.patrimonio) }))
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
}

export async function fetchAuditHistory(patrimonio: string): Promise<AuditEntry[]> {
  // TODO: Remover ao desativar Modo Demo.
  if (isDemoActive()) {
    return demoStore.audit
      .filter((e) => e.patrimonio === patrimonio)
      .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  }

  console.log("🔍 Buscando histórico para patrimônio:", patrimonio);
  const { data, error } = await supabase
    .from("HistoricoAtivos")
    .select("*")
    .eq("ativo_id", patrimonio)
    .order("data_mudanca", { ascending: false });

  if (error) {
    console.error("❌ Erro ao buscar histórico:", JSON.stringify(error));
    return [];
  }
  console.log("✅ Histórico encontrado:", data?.length || 0, "registros");
  return (data || []).map(mapAuditRow);
}

function mapAuditRow(row: any): AuditEntry {
  return {
    id: row.id,
    patrimonio: row.ativo_id || row.patrimonio,
    campo: row.campo_alterado || row.campo,
    valor_antigo: row.valor_antigo,
    valor_novo: row.valor_novo,
    usuario_nome: row.usuario_nome,
    created_at: row.data_mudanca || row.created_at || "",
  };
}



// --- Row mapper ---

function mapRowToAsset(row: Record<string, any>): Asset {
  return {
    patrimonio: String(row["Patrimônio"] || ""),
    categoria: String(row["Categoria"] || ""),
    marca: String(row["Marca"] || ""),
    modelo: String(row["modelo"] || ""),
    serial: String(row["serial"] || ""),
    unidade: (String(row["Unidade"] || "Matriz") as Unidade),
    status: String(row["Status"] || ""),
    valor: Number(row["Valor"] || 0),
    atualizadoEm: String(row["Atualizado_Em"] || ""),
    colaborador: String(row["Colaborador"] || ""),
    observacoes: String(row["observacoes"] || ""),
  };
}

// --- Filtering ---

export function filterByUnidade(assets: Asset[], filter: UnidadeFilterValue): Asset[] {
  if (filter === "Todos") return assets;
  return assets.filter((a) => a.unidade === filter);
}

// --- Natural sort ---

export function naturalSort(a: string, b: string): number {
  const re = /(\D+)|(\d+)/g;
  const aParts = a.match(re) || [];
  const bParts = b.match(re) || [];
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const ap = aParts[i] || "";
    const bp = bParts[i] || "";
    const aNum = Number(ap);
    const bNum = Number(bp);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      if (aNum !== bNum) return aNum - bNum;
    } else {
      const cmp = ap.localeCompare(bp, undefined, { sensitivity: "base" });
      if (cmp !== 0) return cmp;
    }
  }
  return 0;
}

// --- Utility functions ---

export function getUniqueCollaborators(assets: Asset[]): string[] {
  const names = assets
    .map((a) => (a.colaborador || "").trim())
    .filter((name) => name && name.toLowerCase() !== "solvis");
  return [...new Set(names)].sort();
}

export function getAssetsByCollaborator(assets: Asset[], name: string): Asset[] {
  return assets.filter((a) => a.colaborador === name);
}

export function getTotalValue(assets: Asset[]): number {
  return assets.reduce((sum, a) => sum + a.valor, 0);
}

export function getCategoryDistribution(assets: Asset[]) {
  const map: Record<string, { count: number; value: number }> = {};
  assets.forEach((a) => {
    if (!map[a.categoria]) map[a.categoria] = { count: 0, value: 0 };
    map[a.categoria].count++;
    map[a.categoria].value += a.valor;
  });
  return Object.entries(map).map(([name, data]) => ({ name, ...data }));
}

export function getStatusDistribution(assets: Asset[]) {
  const map: Record<string, number> = {};
  assets.forEach((a) => {
    map[a.status] = (map[a.status] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export interface Colaborador {
  id: string;
  nome: string;
  departamento: string | null;
  email: string | null;
}

export async function fetchColaboradores(): Promise<Colaborador[]> {
  // TODO: Remover ao desativar Modo Demo.
  if (isDemoActive()) {
    return [...demoStore.colaboradores].sort((a, b) => a.nome.localeCompare(b.nome));
  }

  const { data, error } = await supabase
    .from("Colaboradores")
    .select("id, nome, departamento, email")
    .order("nome");

  if (error) {
    console.error("Erro ao buscar colaboradores:", error);
    return [];
  }
  // "Solvis" foi descontinuado: ativos/periféricos sem dono = em estoque.
  return ((data || []) as Colaborador[]).filter(
    (c) => (c.nome || "").trim().toLowerCase() !== "solvis"
  );
}

export function getInvestmentByDepartment(
  assets: Asset[],
  colaboradores: Colaborador[]
): { name: string; value: number }[] {
  const deptMap = new Map<string, string>();
  colaboradores.forEach((c) => {
    if (c.departamento) deptMap.set(c.nome, c.departamento);
  });

  const investMap: Record<string, number> = {};
  assets.forEach((a) => {
    const nome = (a.colaborador || "").trim();
    const isStock = !nome || nome.toLowerCase() === "solvis";
    const dept = isStock ? "Em Estoque" : (deptMap.get(nome) || "Não Alocado");
    investMap[dept] = (investMap[dept] || 0) + a.valor;
  });

  return Object.entries(investMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// --- Periféricos vinculados a um colaborador ---

export interface PeripheralForCollaborator {
  id: string;
  brand: string;
  model_name: string;
  category: string;
  patrimonio: string | null;
  serial: string | null;
  status: string;
  unit_price: number;
}

export async function fetchPeripheralsByCollaborator(
  collaboratorName: string,
): Promise<PeripheralForCollaborator[]> {
  if (!collaboratorName) return [];

  // TODO: Remover ao desativar Modo Demo.
  if (isDemoActive()) {
    const modelMap = new Map(demoStore.peripheralModels.map((m) => [m.id, m]));
    return demoStore.peripheralItems
      .filter((it) => (it.colaborador || "").trim() === collaboratorName)
      .map((it) => {
        const m = modelMap.get(it.model_id);
        return {
          id: it.id,
          brand: m?.brand || "—",
          model_name: m?.model_name || "—",
          category: m?.category || "Outro",
          patrimonio: it.patrimonio,
          serial: it.serial,
          status: it.status,
          unit_price: Number(m?.unit_price || 0),
        };
      });
  }

  const { data, error } = await supabase
    .from("peripheral_items")
    .select("id, patrimonio, serial, status, model_id, peripheral_models(brand, model_name, category, unit_price)")
    .eq("colaborador", collaboratorName);

  if (error) {
    console.error("Erro ao buscar periféricos do colaborador:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    brand: row.peripheral_models?.brand || "—",
    model_name: row.peripheral_models?.model_name || "—",
    category: row.peripheral_models?.category || "Outro",
    patrimonio: row.patrimonio,
    serial: row.serial,
    status: row.status,
    unit_price: Number(row.peripheral_models?.unit_price || 0),
  }));
}

// --- Todos os periféricos (para Dashboard global) ---

export interface PeripheralGlobal {
  id: string;
  patrimonio: string | null;
  brand: string;
  model_name: string;
  category: string;
  status: string;
  colaborador: string | null;
  unit_price: number;
}

export async function fetchAllPeripherals(): Promise<PeripheralGlobal[]> {
  // TODO: Remover ao desativar Modo Demo.
  if (isDemoActive()) {
    const modelMap = new Map(demoStore.peripheralModels.map((m) => [m.id, m]));
    return demoStore.peripheralItems.map((it) => {
      const m = modelMap.get(it.model_id);
      return {
        id: it.id,
        patrimonio: it.patrimonio,
        brand: m?.brand || "—",
        model_name: m?.model_name || "—",
        category: m?.category || "Outro",
        status: it.status,
        colaborador: it.colaborador,
        unit_price: Number(m?.unit_price || 0),
      };
    });
  }

  const { data, error } = await supabase
    .from("peripheral_items")
    .select("id, patrimonio, status, colaborador, peripheral_models(brand, model_name, category, unit_price)");

  if (error) {
    console.error("Erro ao buscar periféricos (global):", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    patrimonio: row.patrimonio,
    brand: row.peripheral_models?.brand || "—",
    model_name: row.peripheral_models?.model_name || "—",
    category: row.peripheral_models?.category || "Outro",
    status: row.status,
    colaborador: row.colaborador,
    unit_price: Number(row.peripheral_models?.unit_price || 0),
  }));
}

// --- Tickets Jira do colaborador (Modo Demo) ---
// Em produção, isso virá da edge function `get-jira-metrics` (já cacheada na página JiraView).
// Aqui retornamos do cache demo OU do localStorage de tickets (se existir).
import type { JiraDetailedTicket } from "./jira-utils";

export function getJiraTicketsByCollaboratorFromCache(
  cache: JiraDetailedTicket[],
  collaboratorName: string,
): JiraDetailedTicket[] {
  if (!collaboratorName) return [];
  const norm = collaboratorName.toLowerCase().trim();
  return cache
    .filter((t) => {
      const desc = (t.description || "").toLowerCase();
      const summary = (t.summary || "").toLowerCase();
      const email = (t.solicitanteEmail || "").toLowerCase();
      const emailLocal = email.split("@")[0].replace(/\./g, " ");
      return (
        desc.includes(norm) ||
        summary.includes(norm) ||
        emailLocal.includes(norm)
      );
    })
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

export async function fetchJiraTicketsByCollaborator(
  collaboratorName: string,
): Promise<JiraDetailedTicket[]> {
  if (!collaboratorName) return [];

  // Demo: usa o demoStore.jira diretamente
  if (isDemoActive()) {
    return getJiraTicketsByCollaboratorFromCache(demoStore.jira, collaboratorName);
  }

  // Produção: chama a edge function de métricas do Jira e filtra
  try {
    const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/get-jira-metrics`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ mode: "detailed" }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const tickets: JiraDetailedTicket[] = (data?.tickets || []).map((t: any) => t);
    return getJiraTicketsByCollaboratorFromCache(tickets, collaboratorName);
  } catch (e) {
    console.error("Erro ao buscar Jira do colaborador:", e);
    return [];
  }
}
