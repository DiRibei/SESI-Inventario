import Fuse from "fuse.js";

/**
 * Normaliza string para busca insensível a acentos, case e espaços extras.
 * "Déborah  Silva" → "deborah silva"
 */
export function normalizeText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Verifica se um item bate com o termo de busca em qualquer um dos campos
 * informados, usando normalização (acentos/case insensitive) + substring.
 *
 * Suporta múltiplos termos separados por espaço (todos precisam bater em
 * algum campo — busca AND por token).
 */
export function matchesQuery<T>(
  item: T,
  query: string,
  fields: Array<keyof T | ((item: T) => unknown)>
): boolean {
  const q = normalizeText(query);
  if (!q) return true;

  const haystack = fields
    .map((f) => {
      const raw = typeof f === "function" ? (f as (i: T) => unknown)(item) : (item as any)?.[f];
      return normalizeText(raw);
    })
    .join(" \u0001 ");

  // Multi-token AND
  const tokens = q.split(/\s+/).filter(Boolean);
  return tokens.every((t) => haystack.includes(t));
}

/**
 * Filtra uma lista combinando substring normalizado (rápido e tolerante)
 * com Fuse.js (fuzzy de verdade) como fallback para typos.
 */
export function smartFilter<T>(
  list: T[],
  query: string,
  fields: Array<keyof T | ((item: T) => unknown)>,
  options?: { fuzzyThreshold?: number; minLengthForFuzzy?: number }
): T[] {
  const q = normalizeText(query);
  if (!q) return list;

  // 1) Substring normalizado (cobre 95% dos casos sem custo)
  const direct = list.filter((it) => matchesQuery(it, query, fields));
  if (direct.length > 0) return direct;

  // 2) Fallback fuzzy (typos) — só vale a pena com 3+ chars
  const minLen = options?.minLengthForFuzzy ?? 3;
  if (q.length < minLen) return direct;

  // Constrói versões normalizadas dos itens para o Fuse
  const normalized = list.map((it) => {
    const obj: Record<string, string> = { __ref: "" };
    fields.forEach((f, idx) => {
      const raw = typeof f === "function" ? (f as (i: T) => unknown)(it) : (it as any)?.[f];
      obj[`f${idx}`] = normalizeText(raw);
    });
    return { it, obj };
  });

  const fuse = new Fuse(normalized, {
    keys: fields.map((_, idx) => `obj.f${idx}`),
    threshold: options?.fuzzyThreshold ?? 0.35,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });

  return fuse.search(q).map((r) => r.item.it);
}
