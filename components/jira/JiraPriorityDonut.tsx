import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { type JiraDetailedTicket, getPriorityDistribution } from "@/lib/jira-utils";
import { MetricTooltip } from "@/components/MetricTooltip";

const PRIORITY_ORDER = ["Lowest", "Low", "Medium", "High", "Highest"];

const COLORS: Record<string, string> = {
  Lowest: "hsl(199 89% 48%)",
  Low: "hsl(142 71% 45%)",
  Medium: "hsl(38 92% 50%)",
  High: "hsl(24 95% 53%)",
  Highest: "hsl(0 72% 51%)",
};
const FALLBACK = "hsl(var(--muted-foreground))";

interface Props {
  tickets: JiraDetailedTicket[];
  onPriorityClick?: (priority: string, filtered: JiraDetailedTicket[]) => void;
}

export function JiraPriorityDonut({ tickets, onPriorityClick }: Props) {
  const data = useMemo(() => {
    const raw = getPriorityDistribution(tickets);
    return raw.sort((a, b) => {
      const ai = PRIORITY_ORDER.indexOf(a.name);
      const bi = PRIORITY_ORDER.indexOf(b.name);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }, [tickets]);

  const handleClick = (entry: { name: string }) => {
    if (!onPriorityClick) return;
    const filtered = tickets.filter((t) => t.priority === entry.name);
    onPriorityClick(entry.name, filtered);
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border">
      <h2 className="text-sm font-semibold text-foreground mb-4 inline-flex items-center">
        Distribuição por Prioridade
        <MetricTooltip text="Mostra como os chamados estão distribuídos entre os níveis de prioridade (Baixa, Média, Alta, etc.), ajudando a identificar gargalos." />
      </h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
              cursor="pointer"
              onClick={handleClick}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name] ?? FALLBACK} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                color: "hsl(var(--foreground))",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
