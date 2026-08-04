import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { supabase as typedSupabase } from "./supabase";
import { fetchAssets, type Asset } from "./api";

const supabase = typedSupabase as any;

// ── Theme ─────────────────────────────────────────────────────────────────
// App primary color (matches --primary 210 100% 49%)
const PRIMARY_HEX = "FF0081FC";
const PRIMARY_FG = "FFFFFFFF";
const ZEBRA_HEX = "FFF5F8FC";
const BORDER_HEX = "FFD0D7DE";

// Conditional status palette (pastel)
type StatusStyle = { bg: string; fg: string };
const STATUS_GREEN: StatusStyle = { bg: "FFD1FADF", fg: "FF166534" };
const STATUS_BLUE: StatusStyle = { bg: "FFDBEAFE", fg: "FF1E40AF" };
const STATUS_RED: StatusStyle = { bg: "FFFEE2E2", fg: "FF991B1B" };
const STATUS_YELLOW: StatusStyle = { bg: "FFFEF9C3", fg: "FF854D0E" };
const STATUS_PURPLE: StatusStyle = { bg: "FFF3E8FF", fg: "FF6B21A8" };
const STATUS_GRAY: StatusStyle = { bg: "FFE5E7EB", fg: "FF374151" };

function statusStyle(raw: string): StatusStyle | null {
  const s = (raw || "").toLowerCase().trim();
  if (!s) return null;
  if (s.includes("estoque") || s.includes("disponível") || s.includes("disponivel")) return STATUS_GREEN;
  if (s.includes("uso") || s === "retirado") return STATUS_BLUE;
  if (s.includes("manuten") || s.includes("danificado") || s.includes("defeito") || s.includes("quebrado")) return STATUS_RED;
  if (s === "desconhecido" || s.includes("desconhecido")) return STATUS_YELLOW;
  if (s.includes("triagem") || s.includes("aguardando teste")) return STATUS_PURPLE;
  if (s === "vendido" || s.includes("vendido")) return STATUS_GRAY;
  return null;
}

function ts(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

// ── Sheet builder ─────────────────────────────────────────────────────────
export interface SheetSpec {
  name: string;
  columns: string[];
  rows: (string | number | null | undefined)[][];
  statusColIndex?: number; // 1-based; cells in this column get pastel formatting
  currencyColIndices?: number[]; // 1-based
}

function buildSheet(wb: ExcelJS.Workbook, spec: SheetSpec) {
  const ws = wb.addWorksheet(spec.name, {
    views: [{ state: "frozen", ySplit: 1 }],
    properties: { defaultRowHeight: 18 },
  });

  // Header row
  ws.addRow(spec.columns);
  const header = ws.getRow(1);
  header.height = 26;
  header.eachCell((cell) => {
    cell.value = String(cell.value ?? "");
    cell.font = { name: "Calibri", bold: true, color: { argb: PRIMARY_FG }, size: 11 };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PRIMARY_HEX } };
    cell.border = {
      top: { style: "thin", color: { argb: BORDER_HEX } },
      left: { style: "thin", color: { argb: BORDER_HEX } },
      bottom: { style: "thin", color: { argb: BORDER_HEX } },
      right: { style: "thin", color: { argb: BORDER_HEX } },
    };
  });

  // Data rows
  spec.rows.forEach((r, idx) => {
    const row = ws.addRow(r.map((v) => (v === undefined || v === null ? "" : v)));
    const excelRow = idx + 2;
    const zebra = idx % 2 === 1;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: "Calibri", size: 11, color: { argb: "FF1F2937" } };
      cell.alignment = { vertical: "middle", horizontal: "left", wrapText: false };
      cell.border = {
        top: { style: "hair", color: { argb: BORDER_HEX } },
        left: { style: "hair", color: { argb: BORDER_HEX } },
        bottom: { style: "hair", color: { argb: BORDER_HEX } },
        right: { style: "hair", color: { argb: BORDER_HEX } },
      };
      if (zebra) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ZEBRA_HEX } };
      }
      if (spec.currencyColIndices?.includes(colNumber)) {
        cell.numFmt = '"R$" #,##0.00';
        cell.alignment = { vertical: "middle", horizontal: "right" };
      }
      if (spec.statusColIndex && colNumber === spec.statusColIndex) {
        const style = statusStyle(String(cell.value ?? ""));
        if (style) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: style.bg } };
          cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: style.fg } };
          cell.alignment = { vertical: "middle", horizontal: "center" };
        }
      }
    });
    void excelRow;
  });

  // Auto-fit column widths
  ws.columns.forEach((col, i) => {
    let max = spec.columns[i]?.length ?? 10;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const v = cell.value;
      let len = 0;
      if (typeof v === "number") len = String(v).length + 4;
      else if (v) len = String(v).length;
      if (len > max) max = len;
    });
    col.width = Math.min(Math.max(max + 2, 10), 60);
  });
}

async function writeFile(wb: ExcelJS.Workbook, filename: string) {
  const buf = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), filename);
}

// ── Data fetchers / spec builders ─────────────────────────────────────────
function buildNotebooksSpec(assets: Asset[]): SheetSpec {
  const sorted = [...assets].sort((a, b) =>
    String(a.patrimonio || "").localeCompare(String(b.patrimonio || ""), undefined, { numeric: true, sensitivity: "base" })
  );
  const rows = sorted.map((a) => [
    a.patrimonio,
    a.categoria,
    a.marca || "",
    a.modelo || "",
    a.colaborador || "",
    a.status,
    a.unidade,
    Number(a.valor || 0),
    a.observacoes || "",
  ]);
  return {
    name: "Notebooks",
    columns: ["Patrimônio", "Categoria", "Marca", "Modelo", "Colaborador", "Status", "Local", "Valor", "Observações"],
    rows,
    statusColIndex: 6,
    currencyColIndices: [8],
  };
}

async function fetchNotebooksRows(): Promise<SheetSpec> {
  const assets: Asset[] = await fetchAssets();
  return buildNotebooksSpec(assets);
}

export interface PeripheralExportRow {
  patrimonio?: string | null;
  serial?: string | null;
  status?: string | null;
  colaborador?: string | null;
  observacoes?: string | null;
  peripheral_models?: {
    brand?: string | null;
    model_name?: string | null;
    category?: string | null;
    unit_price?: number | null;
  } | null;
}

function buildPerifericosSpec(items: PeripheralExportRow[]): SheetSpec {
  const sorted = [...items].sort((a, b) =>
    String(a.patrimonio || "").localeCompare(String(b.patrimonio || ""), undefined, { numeric: true, sensitivity: "base" })
  );
  const rows = sorted.map((r) => [
    r.patrimonio || "",
    r.peripheral_models?.category || "",
    r.peripheral_models?.brand || "",
    r.peripheral_models?.model_name || "",
    r.serial || "",
    r.status || "",
    r.colaborador || "",
    Number(r.peripheral_models?.unit_price || 0),
    r.observacoes || "",
  ]);
  return {
    name: "Periféricos",
    columns: ["Patrimônio", "Categoria", "Marca", "Modelo", "Serial", "Status", "Colaborador", "Valor", "Observações"],
    rows,
    statusColIndex: 6,
    currencyColIndices: [8],
  };
}

async function fetchPerifericosRows(): Promise<SheetSpec> {
  const { data, error } = await supabase
    .from("peripheral_items")
    .select("patrimonio, serial, status, colaborador, observacoes, peripheral_models(brand, model_name, category, unit_price)")
    .order("patrimonio");
  if (error) throw error;
  return buildPerifericosSpec((data || []) as PeripheralExportRow[]);
}

export interface SparePartExportRow {
  item_name?: string | null;
  category?: string | null;
  quantity?: number | null;
}

function buildPecasSpec(parts: SparePartExportRow[]): SheetSpec {
  const sorted = [...parts].sort((a, b) => {
    const c = String(a.category || "").localeCompare(String(b.category || ""));
    if (c !== 0) return c;
    return String(a.item_name || "").localeCompare(String(b.item_name || ""));
  });
  const rows = sorted.map((r) => [r.item_name || "", r.category || "", Number(r.quantity || 0)]);
  return { name: "Peças", columns: ["Peça", "Categoria", "Quantidade"], rows };
}

async function fetchPecasRows(): Promise<SheetSpec> {
  const { data, error } = await supabase
    .from("spare_parts")
    .select("item_name, category, quantity")
    .order("category")
    .order("item_name");
  if (error) throw error;
  return buildPecasSpec((data || []) as SparePartExportRow[]);
}

// ── Public exports ────────────────────────────────────────────────────────
export async function exportNotebooks(assets?: Asset[]) {
  const wb = new ExcelJS.Workbook();
  const spec = assets ? buildNotebooksSpec(assets) : await fetchNotebooksRows();
  buildSheet(wb, spec);
  await writeFile(wb, `sga_notebooks_${ts()}.xlsx`);
}

export async function exportPerifericos(items?: PeripheralExportRow[]) {
  const wb = new ExcelJS.Workbook();
  const spec = items ? buildPerifericosSpec(items) : await fetchPerifericosRows();
  buildSheet(wb, spec);
  await writeFile(wb, `sga_perifericos_${ts()}.xlsx`);
}

export async function exportPecas(parts?: SparePartExportRow[]) {
  const wb = new ExcelJS.Workbook();
  const spec = parts ? buildPecasSpec(parts) : await fetchPecasRows();
  buildSheet(wb, spec);
  await writeFile(wb, `sga_pecas_${ts()}.xlsx`);
}

export interface DashboardExportOptions {
  notebooks: boolean;
  perifericos: boolean;
  pecas: boolean;
}

export async function exportDashboard(opts: DashboardExportOptions) {
  const wb = new ExcelJS.Workbook();
  if (opts.notebooks) buildSheet(wb, await fetchNotebooksRows());
  if (opts.perifericos) buildSheet(wb, await fetchPerifericosRows());
  if (opts.pecas) buildSheet(wb, await fetchPecasRows());
  if (wb.worksheets.length === 0) throw new Error("Selecione pelo menos uma categoria.");
  await writeFile(wb, `sga_relatorio_${ts()}.xlsx`);
}

// ── Colaboradores ─────────────────────────────────────────────────────────
export type ColaboradoresSort = "nome" | "departamento";
export interface ColaboradorExportRow { nome: string; departamento: string; email: string }

function sortColaboradores(list: ColaboradorExportRow[], sort: ColaboradoresSort): ColaboradorExportRow[] {
  const byName = (a: ColaboradorExportRow, b: ColaboradorExportRow) =>
    a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
  if (sort === "departamento") {
    return [...list].sort((a, b) => {
      const c = a.departamento.localeCompare(b.departamento, "pt-BR", { sensitivity: "base" });
      return c !== 0 ? c : byName(a, b);
    });
  }
  return [...list].sort(byName);
}

async function fetchColaboradores(sort: ColaboradoresSort = "nome"): Promise<ColaboradorExportRow[]> {
  let q = supabase.from("Colaboradores").select("nome, departamento, email");
  if (sort === "departamento") q = q.order("departamento").order("nome");
  else q = q.order("nome");
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map((r: any) => ({
    nome: r.nome || "",
    departamento: r.departamento || "",
    email: r.email || "",
  }));
}

async function resolveColaboradores(
  sort: ColaboradoresSort,
  input?: ColaboradorExportRow[]
): Promise<ColaboradorExportRow[]> {
  if (input) return sortColaboradores(input, sort);
  return fetchColaboradores(sort);
}

export async function exportColaboradoresXlsx(sort: ColaboradoresSort = "nome", input?: ColaboradorExportRow[]) {
  const list = await resolveColaboradores(sort, input);
  const wb = new ExcelJS.Workbook();
  buildSheet(wb, {
    name: "Colaboradores",
    columns: ["Nome", "Departamento", "E-mail"],
    rows: list.map((c) => [c.nome, c.departamento, c.email]),
  });
  await writeFile(wb, `sga_colaboradores_${ts()}.xlsx`);
}

export async function exportColaboradoresTxt(sort: ColaboradoresSort = "nome", input?: ColaboradorExportRow[]) {
  const list = await resolveColaboradores(sort, input);
  const headers = ["Nome", "Departamento", "E-mail"];
  const cap = [40, 24, 40];
  const widths = headers.map((h, i) => {
    const max = list.reduce((m, c) => {
      const v = [c.nome, c.departamento, c.email][i] || "";
      return Math.max(m, v.length);
    }, h.length);
    return Math.min(max, cap[i]);
  });
  const pad = (s: string, w: number) => {
    const t = s.length > w ? s.slice(0, w - 1) + "…" : s;
    return t.padEnd(w, " ");
  };
  const line = (cells: string[]) => cells.map((c, i) => pad(c, widths[i])).join("  ");
  const sep = widths.map((w) => "─".repeat(w)).join("  ");
  const now = new Date();
  const dt = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const lines: string[] = [];
  lines.push("SGA — Colaboradores");
  lines.push(`Gerado em: ${dt}`);
  lines.push(`Ordenado por: ${sort === "departamento" ? "Departamento" : "Nome"}`);
  lines.push(`Total: ${list.length}`);
  lines.push("");
  lines.push(line(headers));
  lines.push(sep);
  for (const c of list) lines.push(line([c.nome, c.departamento, c.email]));

  const blob = new Blob([lines.join("\r\n")], { type: "text/plain;charset=utf-8" });
  saveAs(blob, `sga_colaboradores_${ts()}.txt`);
}

export async function exportColaboradoresCsv(sort: ColaboradoresSort = "nome", input?: ColaboradorExportRow[]) {
  const list = await resolveColaboradores(sort, input);
  const esc = (v: string) => {
    const s = v ?? "";
    return /[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = ["Nome;E-mail;Departamento;Perfil"];
  for (const c of list) lines.push(`${esc(c.nome)};${esc(c.email)};${esc(c.departamento)};`);
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `sga_colaboradores_${ts()}.csv`);
}


