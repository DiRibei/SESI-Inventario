import { useMemo, useState } from "react";
import { type JiraDetailedTicket } from "@/lib/jira-utils";
import { MetricTooltip } from "@/components/MetricTooltip";

/**
 * Categorias estratégicas — derivadas do campo `tipoRequisicao`
 * (preenchido pelo Modo Demo) ou inferidas via heurística do summary
 * para dados reais do Jira.
 */
const CATEGORY_RULES: Array<{ name: string; match: (s: string) => boolean; color: string }> = [
  {
    name: "Upgrade de Memória/SSD",
    match: (s) => /upgrade|ram|ssd|hdd|nvme|memória|memoria/i.test(s),
    color: "hsl(217 91% 60%)",
  },
  {
    name: "Troca de Teclado/Mouse",
    match: (s) => /teclado|mouse|kit|periférico|periferico/i.test(s),
    color: "hsl(142 71% 45%)",
  },
  {
    name: "Configuração de Novo Notebook",
    match: (s) => /configura|setup|provisionamento|onboarding|novo notebook/i.test(s),
    color: "hsl(38 92% 50%)",
  },
  {
    name: "Problemas de Conectividade",
    match: (s) => /vpn|wi-?fi|conex|conectividade|rede|roteamento|pasta compartilhada/i.test(s),
    color: "hsl(0 72% 51%)",
  },
];

const FALLBACK_COLOR = "hsl(var(--muted-foreground))";

interface Props {
  tickets: JiraDetailedTicket[];
  onCategoryClick?: (category: string, filtered: JiraDetailedTicket[]) => void;
}

export function JiraTopCategoriesChart({ tickets, onCategoryClick }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const data = useMemo(() => {
    const map = new Map<string, JiraDetailedTicket[]>();
    tickets.forEach((t) => {
      // 1) Tenta usar tipoRequisicao (Modo Demo já manda categoria pronta)
      const direct = CATEGORY_RULES.find((r) => r.name === t.tipoRequisicao);
      let category = direct?.name;

      // 2) Senão, infere via summary
      if (!category) {
        const inferred = CATEGORY_RULES.find((r) => r.match(t.summary || ""));
        category = inferred?.name ?? "Outros";
      }

      if (!map.has(category)) map.set(category, []);
      map.get(category)!.push(t);
    });

    return CATEGORY_RULES.map((r) => ({
      name: r.name,
      count: map.get(r.name)?.length ?? 0,
      color: r.color,
      tickets: map.get(r.name) ?? [],
    }))
      .filter((d) => d.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [tickets]);

  const maxVal = useMemo(() => Math.max(...data.map((d) => d.count), 1), [data]);

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border">
      <h2 className="text-sm font-semibold text-foreground mb-1 inline-flex items-center">
        Principais Solicitações
        <MetricTooltip text="Classificação dos chamados pelas categorias mais recorrentes (ex: upgrade, troca de periféricos, problemas de conectividade)." />
      </h2>
      <p className="text-xs text-muted-foreground mb-4">Top categorias de chamados no período</p>

      <div className="space-y-1.5">
        {data.map((entry) => (
          <div
            key={entry.name}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
            style={{
              backgroundColor: hovered === entry.name ? "hsl(var(--muted) / 0.5)" : "transparent",
            }}
            onMouseEnter={() => setHovered(entry.name)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onCategoryClick?.(entry.name, entry.tickets)}
          >
            <span className="text-xs font-medium text-foreground w-56 shrink-0 select-none truncate">
              {entry.name}
            </span>
            <div className="flex-1 h-7 bg-muted/30 rounded-md overflow-hidden relative">
              <div
                className="h-full rounded-md transition-all duration-300"
                style={{
                  width: `${Math.max((entry.count / maxVal) * 100, 2)}%`,
                  backgroundColor: entry.color,
                  opacity: hovered === entry.name ? 1 : 0.85,
                }}
              />
            </div>
            <span className="text-xs font-semibold shrink-0 tabular-nums text-right w-10 text-foreground">
              {entry.count}
            </span>
          </div>
        ))}

        {data.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Sem categorias identificadas</p>
        )}
      </div>
    </div>
  );
}
