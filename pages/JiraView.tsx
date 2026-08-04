import { useState, useMemo, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Clock, AlertCircle, ShieldCheck, TicketCheck, Loader2 } from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";
import {
  type JiraDetailedTicket,
  getAverageLeadTime,
  formatLeadTime,
  getSlaCompliance,
} from "@/lib/jira-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Bell, ChevronRight } from "lucide-react";
import { JiraTicketTable } from "@/components/jira/JiraTicketTable";
import { JiraPriorityDonut } from "@/components/jira/JiraPriorityDonut";
import { JiraMttrChart } from "@/components/jira/JiraMttrChart";
import { JiraTopCategoriesChart } from "@/components/jira/JiraTopCategoriesChart";
import { JiraDetailModal } from "@/components/jira/JiraDetailModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { isDemoActive } from "@/lib/demoMode";
import { demoStore } from "@/lib/demoData";
import { MetricTooltip } from "@/components/MetricTooltip";

const EDGE_FN_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/get-jira-metrics`;

/* ── helpers ── */


const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function monthKey(year: number, month: number) {
  return year * 12 + month;
}

function fmtMonthLabel(year: number, month: number) {
  return `${MONTH_NAMES[month]}/${String(year).slice(2)}`;
}

function getMonthlyVolume(tickets: JiraDetailedTicket[]) {
  const counts: Record<number, number> = {};
  let minKey = Infinity;
  let maxKey = -Infinity;

  tickets.forEach((t) => {
    if (!t.createdAt) return;
    const d = new Date(t.createdAt);
    if (isNaN(d.getTime())) return;
    const k = monthKey(d.getFullYear(), d.getMonth());
    counts[k] = (counts[k] || 0) + 1;
    if (k < minKey) minKey = k;
    if (k > maxKey) maxKey = k;
  });

  if (minKey === Infinity) return [];

  const result: { label: string; chamados: number; year: number; month: number }[] = [];
  for (let k = minKey; k <= maxKey; k++) {
    const year = Math.floor(k / 12);
    const month = k % 12;
    result.push({
      label: fmtMonthLabel(year, month),
      chamados: counts[k] || 0,
      year,
      month,
    });
  }
  return result;
}


type DateFilter = "all" | "current_month" | "last_30";

type DrilldownState = {
  open: boolean;
  title: string;
  filtered: JiraDetailedTicket[];
};

export default function JiraView() {
  const { role, isAuthenticated } = useAuth();
  const isAdmin = role === "admin";
  const [allTickets, setAllTickets] = useState<JiraDetailedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [jiraBaseUrl, setJiraBaseUrl] = useState<string | undefined>();
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [drilldown, setDrilldown] = useState<DrilldownState>({ open: false, title: "", filtered: [] });

  useEffect(() => {
    async function fetchJira() {
      // TODO: Remover ao desativar Modo Demo.
      if (isDemoActive()) {
        setAllTickets(demoStore.jira);
        setIsLive(true);
        setJiraBaseUrl("https://demo.atlassian.net");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(EDGE_FN_URL, {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.tickets && Array.isArray(data.tickets)) {
          setAllTickets(data.tickets);
          setIsLive(true);
        }
        if (data.jiraBaseUrl) setJiraBaseUrl(data.jiraBaseUrl);
      } catch (err) {
        console.error("Falha ao buscar dados do Jira:", err);
        toast.error("Não foi possível conectar ao Jira. Verifique a configuração.");
      } finally {
        setLoading(false);
      }
    }
    fetchJira();
  }, []);

  const tickets = useMemo(() => {
    if (dateFilter === "all") return allTickets;
    const now = new Date();
    let cutoff: Date;
    if (dateFilter === "current_month") {
      cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      cutoff = new Date(now.getTime() - 30 * 86400000);
    }
    return allTickets.filter((t) => {
      if (!t.createdAt) return false;
      return new Date(t.createdAt) >= cutoff;
    });
  }, [allTickets, dateFilter]);

  const mttr = useMemo(() => getAverageLeadTime(tickets), [tickets]);
  const openCount = useMemo(
    () => tickets.filter((t) => ["Open", "In Progress", "To Do", "Aberto", "Em andamento"].includes(t.status)).length,
    [tickets],
  );
  const sla = useMemo(() => getSlaCompliance(tickets, 48), [tickets]);
  const totalTickets = tickets.length;
  
  const monthlyVolume = useMemo(() => getMonthlyVolume(tickets), [tickets]);


  const handleMonthClick = useCallback((data: any) => {
    if (!data?.activePayload?.[0]?.payload) return;
    const point = data.activePayload[0].payload;
    const { year, month, label } = point;
    const filtered = tickets.filter((t) => {
      if (!t.createdAt) return false;
      const d = new Date(t.createdAt);
      if (isNaN(d.getTime())) return false;
      return d.getFullYear() === year && d.getMonth() === month;
    });
    setDrilldown({ open: true, title: `Chamados - ${label}`, filtered });
  }, [tickets]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Jira</h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Carregando dados do Jira...</>
              ) : !isLive && tickets.length === 0 ? (
                <><span className="inline-block w-2 h-2 rounded-full bg-amber-500" /> Sem conexão com o Jira</>
              ) : (
                <><span className="inline-block w-2 h-2 rounded-full bg-green-500" /> Dados em tempo real do Jira</>
              )}
            </p>
          </div>
        </div>

        {/* Filtro de período (admin) */}
        {isAdmin && (
          <div className="flex justify-end">
            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="current_month">Mês Atual</SelectItem>
                <SelectItem value="last_30">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* ── Visão Geral (Admin) ── */}
        {isAdmin && (
          <div className="space-y-6">
              {/* Notification card — chamados abertos */}
              {!loading && openCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const open = tickets.filter((t) => ["Open", "In Progress", "To Do", "Aberto", "Em andamento", "Em Aberto"].includes(t.status));
                    setDrilldown({ open: true, title: `Lista de Chamados em Aberto (${open.length})`, filtered: open });
                  }}
                  className="w-full text-left rounded-xl p-4 border border-red-500/30 bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent hover:from-red-500/15 hover:via-red-500/10 transition-all flex items-center gap-4 group"
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center">
                      <Bell className="w-6 h-6 text-red-500" />
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-5 w-5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
                      <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {openCount > 99 ? "99+" : openCount}
                      </span>
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wide text-red-600 dark:text-red-400 font-semibold">
                      Notificações
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {openCount === 1 ? "1 chamado aberto" : `${openCount} chamados abertos`} aguardando atenção
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Toque para ver a lista completa</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </button>
              )}

              {/* KPI Cards */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-card rounded-xl p-6 shadow-card border space-y-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="MTTR" value={formatLeadTime(mttr)} icon={<Clock className="w-5 h-5 text-primary" />} subtitle="Tempo Médio" delay={0} />
                    <StatCard title="Chamados Abertos" value={openCount} icon={<AlertCircle className="w-5 h-5 text-primary" />} subtitle={`de ${totalTickets}`} delay={0.1} onClick={() => {
                      const open = tickets.filter((t) => ["Open", "In Progress", "To Do", "Aberto", "Em andamento", "Em Aberto"].includes(t.status));
                      setDrilldown({ open: true, title: `Lista de Chamados em Aberto (${open.length})`, filtered: open });
                    }} />
                    <StatCard title="SLA Cumprido" value={`${sla}%`} icon={<ShieldCheck className="w-5 h-5 text-primary" />} subtitle="≤ 48h" delay={0.2} />
                    <StatCard title="Total de Chamados" value={totalTickets} icon={<TicketCheck className="w-5 h-5 text-primary" />} delay={0.3} gradient />
                  </div>

                  {/* Highlight: SLA de Resolução (eficiência) — apenas no Modo Demo */}
                  {isDemoActive() && (
                  <div className="rounded-xl p-5 border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400 font-semibold">
                        SLA de Resolução
                      </p>
                      <p className="text-2xl font-bold text-foreground tabular-nums">98.2%</p>
                    </div>
                    <p className="text-xs text-muted-foreground hidden sm:block max-w-[220px] text-right">
                      Eficiência operacional do time de TI nos últimos 6 meses.
                    </p>
                  </div>
                  )}
                </>
              )}

              {loading ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="bg-card rounded-xl p-6 shadow-card border space-y-4">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ))}
                  </div>
                  <div className="bg-card rounded-xl p-6 shadow-card border space-y-4">
                    <Skeleton className="h-4 w-52" />
                    <Skeleton className="h-80 w-full" />
                  </div>
                  <div className="bg-card rounded-xl p-6 shadow-card border space-y-4">
                    <Skeleton className="h-4 w-48" />
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                </>
              ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                  <h2 className="text-xl font-semibold text-foreground">Tudo limpo por aqui!</h2>
                  <p className="text-muted-foreground text-sm">Nenhum chamado encontrado no momento.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <JiraMttrChart tickets={tickets} onPriorityClick={(priority, filtered) => setDrilldown({ open: true, title: `MTTR - Prioridade ${priority}`, filtered })} />
                    <JiraPriorityDonut tickets={tickets} onPriorityClick={(priority, filtered) => setDrilldown({ open: true, title: `Chamados - Prioridade ${priority}`, filtered })} />
                  </div>
                  {isDemoActive() && (
                    <JiraTopCategoriesChart
                      tickets={tickets}
                      onCategoryClick={(category, filtered) =>
                        setDrilldown({ open: true, title: `Chamados — ${category}`, filtered })
                      }
                    />
                  )}
                  <div className="bg-card rounded-xl p-6 shadow-card border">
                    <h2 className="text-sm font-semibold text-foreground mb-4 inline-flex items-center">
                      Volume de Chamados (Mensal)
                      <MetricTooltip text="Quantidade total de chamados abertos ao longo de cada mês, permitindo identificar sazonalidades e picos de demanda." />
                    </h2>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyVolume} margin={{ left: 0, right: 20, bottom: 20 }} onClick={handleMonthClick} style={{ cursor: "pointer" }}>
                          <defs>
                            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="label" tick={{ fill: "currentColor", fontSize: 11 }} />
                          <YAxis allowDecimals={false} tick={{ fill: "currentColor", fontSize: 12 }} />
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} formatter={(v: number) => [`${v} chamados`, ""]} />
                          <Area type="monotone" dataKey="chamados" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#areaFill)" dot={{ fill: "hsl(var(--primary))", r: 4, cursor: "pointer" }} activeDot={{ r: 6, cursor: "pointer" }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <JiraTicketTable tickets={tickets} jiraBaseUrl={jiraBaseUrl} limit={15} isAdmin={isAdmin} />
                </>
              )}

              {!loading && (
                <div className="bg-muted/50 rounded-xl p-4 border border-border text-sm text-muted-foreground flex items-center gap-3">
                  <TicketCheck className="w-5 h-5 flex-shrink-0" />
                  <span>
                    {isLive
                      ? "Dados carregados em tempo real da API do Jira via Edge Function."
                      : "Não foi possível conectar ao Jira. Verifique as configurações da Edge Function."}
                  </span>
                </div>
              )}
          </div>
        )}

        {!isAdmin && (
          <div className="bg-card rounded-xl p-8 border border-border text-center text-sm text-muted-foreground">
            Para abrir ou consultar seus chamados, acesse a aba <span className="font-medium text-foreground">Chamados</span>.
          </div>
        )}
      </div>

      {/* Drill-down Modal */}
      <JiraDetailModal
        open={drilldown.open}
        onOpenChange={(open) => setDrilldown((prev) => ({ ...prev, open }))}
        title={drilldown.title}
        tickets={drilldown.filtered}
        jiraBaseUrl={jiraBaseUrl}
        isAdmin={isAdmin}
      />
    </DashboardLayout>
  );
}
