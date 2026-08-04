/**
 * Shim Supabase para Modo Demo.
 *
 * Implementa um subconjunto compatível da API do supabase-js (`from(table).select/insert/update/delete...`)
 * apoiado pelo `demoStore` em memória. Suficiente para as páginas Periféricos e Peças.
 *
 * Uso: `dbClient()` retorna o cliente real ou o shim, dependendo de `isDemoActive()`.
 *
 * TODO: Remover assim que o Modo Demo for descontinuado.
 */

import { supabase as realSupabase } from "@/lib/supabase";
import { isDemoActive } from "@/lib/demoMode";
import { demoStore } from "@/lib/demoData";

type Row = Record<string, any>;

function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getCollection(table: string): Row[] {
  switch (table) {
    case "peripheral_models": return demoStore.peripheralModels;
    case "peripheral_items": return demoStore.peripheralItems;
    case "spare_parts": return demoStore.spareParts;
    case "Colaboradores": return demoStore.colaboradores;
    case "EstoqueSolvis": return demoStore.assets as any;
    case "HistoricoAtivos": return demoStore.audit as any;
    default: return [];
  }
}

function setCollection(table: string, rows: Row[]) {
  switch (table) {
    case "peripheral_models": demoStore.peripheralModels = rows as any; break;
    case "peripheral_items": demoStore.peripheralItems = rows as any; break;
    case "spare_parts": demoStore.spareParts = rows as any; break;
    case "Colaboradores": demoStore.colaboradores = rows as any; break;
    case "EstoqueSolvis": demoStore.assets = rows as any; break;
    case "HistoricoAtivos": demoStore.audit = rows as any; break;
  }
}

interface Filter { col: string; op: string; val: any }

function applyFilters(rows: Row[], filters: Filter[]): Row[] {
  return rows.filter((r) =>
    filters.every((f) => {
      const v = r[f.col];
      switch (f.op) {
        case "eq": return v === f.val;
        case "neq": return v !== f.val;
        case "in": return Array.isArray(f.val) && f.val.includes(v);
        case "ilike": {
          const pat = String(f.val).replace(/%/g, "").toLowerCase();
          return String(v ?? "").toLowerCase().includes(pat);
        }
        case "is_null": return v == null;
        case "not_is_null": return v != null;
        default: return true;
      }
    })
  );
}

class DemoQuery<T = Row> implements PromiseLike<{ data: T | null; error: any; count?: number }> {
  private filters: Filter[] = [];
  private orderCol: string | null = null;
  private orderAsc = true;
  private limitN: number | null = null;
  private rangeFrom: number | null = null;
  private rangeTo: number | null = null;
  private mode: "select" | "insert" | "update" | "delete" = "select";
  private payload: any = null;
  private wantSingle = false;
  private wantCount = false;
  private selectCols = "*";

  constructor(private table: string) {}

  select(cols = "*", opts?: { count?: string }) {
    this.mode = "select";
    this.selectCols = cols;
    if (opts?.count) this.wantCount = true;
    return this;
  }
  insert(payload: any) {
    this.mode = "insert";
    this.payload = payload;
    return this;
  }
  update(payload: any) {
    this.mode = "update";
    this.payload = payload;
    return this;
  }
  delete() {
    this.mode = "delete";
    return this;
  }
  eq(col: string, val: any) { this.filters.push({ col, op: "eq", val }); return this; }
  neq(col: string, val: any) { this.filters.push({ col, op: "neq", val }); return this; }
  in(col: string, vals: any[]) { this.filters.push({ col, op: "in", val: vals }); return this; }
  not(col: string, _op: string, val: any) {
    if (val === null) this.filters.push({ col, op: "not_is_null", val: null });
    return this;
  }
  is(col: string, val: any) {
    if (val === null) this.filters.push({ col, op: "is_null", val: null });
    return this;
  }
  or(_expr: string) {
    // Filtros OR não são usados pelas páginas que recorrem ao shim — ignorar.
    return this;
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orderCol = col;
    this.orderAsc = opts?.ascending !== false;
    return this;
  }
  limit(n: number) { this.limitN = n; return this; }
  range(from: number, to: number) { this.rangeFrom = from; this.rangeTo = to; return this; }
  single() { this.wantSingle = true; return this; }
  maybeSingle() { this.wantSingle = true; return this; }

  private execute(): { data: any; error: any; count?: number } {
    const collection = getCollection(this.table);

    if (this.mode === "insert") {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload];
      const inserted = items.map((row) => ({
        id: row.id || uuid(),
        created_at: row.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...row,
      }));
      setCollection(this.table, [...collection, ...inserted]);
      return { data: this.wantSingle ? inserted[0] : inserted, error: null };
    }

    if (this.mode === "update") {
      const updated = collection.map((r) => {
        const matches = this.filters.every((f) => {
          if (f.op === "eq") return r[f.col] === f.val;
          if (f.op === "in") return f.val.includes(r[f.col]);
          return true;
        });
        return matches
          ? { ...r, ...this.payload, updated_at: new Date().toISOString() }
          : r;
      });
      setCollection(this.table, updated);
      return { data: null, error: null };
    }

    if (this.mode === "delete") {
      const remaining = collection.filter((r) => {
        return !this.filters.every((f) => {
          if (f.op === "eq") return r[f.col] === f.val;
          if (f.op === "in") return f.val.includes(r[f.col]);
          return true;
        });
      });
      setCollection(this.table, remaining);
      return { data: null, error: null };
    }

    // SELECT
    let rows = applyFilters(collection, this.filters);
    if (this.orderCol) {
      const col = this.orderCol;
      const dir = this.orderAsc ? 1 : -1;
      rows = [...rows].sort((a, b) => {
        const av = a[col]; const bv = b[col];
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
        return String(av).localeCompare(String(bv)) * dir;
      });
    }
    const totalCount = rows.length;
    if (this.rangeFrom != null && this.rangeTo != null) {
      rows = rows.slice(this.rangeFrom, this.rangeTo + 1);
    } else if (this.limitN != null) {
      rows = rows.slice(0, this.limitN);
    }
    const data = this.wantSingle ? rows[0] ?? null : rows;
    return { data, error: null, count: this.wantCount ? totalCount : undefined };
  }

  then<TResult1 = any, TResult2 = never>(
    onFulfilled?: ((value: { data: any; error: any; count?: number }) => TResult1 | PromiseLike<TResult1>) | null,
    onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    try {
      const result = this.execute();
      return Promise.resolve(result).then(onFulfilled, onRejected);
    } catch (e) {
      return Promise.resolve({ data: null, error: e } as any).then(onFulfilled as any, onRejected);
    }
  }
}

const demoSupabaseShim = {
  from(table: string) {
    return new DemoQuery(table);
  },
};

/** Retorna o cliente Supabase real ou o shim demo, conforme o estado global. */
export function dbClient(): any {
  return isDemoActive() ? demoSupabaseShim : realSupabase;
}
