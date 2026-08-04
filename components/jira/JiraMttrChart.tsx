import { useMemo, useState } from "react";
import { type JiraDetailedTicket } from "@/lib/jira-utils";
import { MetricTooltip } from "@/components/MetricTooltip";

const PRIORITY_ORDER_DESC = ["Highest", "High", "Medium", "Low", "Lowest"];

function formatMttr(hours: number): { text: string; isDays: boolean } {
  if (hours < 24) return { text: `${hours} horas`, isDays: false };
  const days = Math.round((hours / 24) * 10) / 10;
  return { text: `${days} dias`, isDays: true };
}

const ALERT_PRIORITIES = new Set(["High", "Highest"]);

const COLORS: Record<string, string> = {
  Lowest: "hsl(199 89% 48%)",
  Low: "hsl(142 71% 45%)",
  Medium: "hsl(38 92% 50%)",
  High: "hsl(24 95% 53%)",
  Highest: "hsl(0 72% 51%)",
};

interface Props {
  tickets: JiraDetailedTicket[];
  onPriorityClick?: (priority: string, filtered: JiraDetailedTicket[]) => void;
}

export function JiraMttrChart({ tickets, onPriorityClick }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const data = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    tickets.forEach((t) => {
      const p = t.priority || "Medium";
      if (!map[p]) map[p] = { total: 0, count: 0 };
      if (t.resolutionTimeHours !== null) {
        map[p].total += t.resolutionTimeHours;
        map[p].count += 1;
      }
    });
    return PRIORITY_ORDER_DESC
      .filter((p) => map[p]?.count > 0)
      .map((name) => ({
        name,
        horas: Math.round((map[name].total / map[name].count) * 10) / 10,
        color: COLORS[name] || "hsl(var(--muted-foreground))",
      }));
  }, [tickets]);

  const maxVal = useMemo(() => Math.max(...data.map((d) => d.horas), 1), [data]);

  const handleClick = (priority: string) => {
    if (!onPriorityClick) return;
    const filtered = tickets.filter((t) => t.priority === priority);
    onPriorityClick(priority, filtered);
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border">
      <h2 className="text-sm font-semibold text-foreground mb-4 inline-flex items-center">
        MTTR por Prioridade
        <MetricTooltip text="Tempo médio que a equipe leva para solucionar um incidente desde a sua abertura, agrupado por prioridade do chamado." />
      </h2>
      <div className="space-y-1">
        {data.map((entry) => (
          <div
            key={entry.name}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
            style={{
              backgroundColor: hovered === entry.name ? "hsl(var(--muted) / 0.5)" : "transparent",
            }}
            onMouseEnter={() => setHovered(entry.name)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => handleClick(entry.name)}
          >
            <span className="text-xs font-medium text-foreground w-16 shrink-0 select-none">
              {entry.name}
            </span>
            <div className="flex-1 h-7 bg-muted/30 rounded-md overflow-hidden relative">
              <div
                className="h-full rounded-md transition-all duration-300"
                style={{
                  width: `${Math.max((entry.horas / maxVal) * 100, 2)}%`,
                  backgroundColor: entry.color,
                  opacity: hovered === entry.name ? 1 : 0.85,
                }}
              />
            </div>
            {(() => {
              const fmt = formatMttr(entry.horas);
              const isAlert = fmt.isDays && ALERT_PRIORITIES.has(entry.name);
              return (
                <span className={`text-xs font-semibold shrink-0 tabular-nums text-right w-24 ${isAlert ? "font-bold text-destructive" : "text-foreground"}`}>
                  {fmt.text}
                </span>
              );
            })()}
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Sem dados de resolução</p>
        )}
      </div>
    </div>
  );
}
