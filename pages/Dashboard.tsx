import { useEffect, useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import {
  Asset, fetchAssets, getTotalValue, getStatusDistribution, filterByUnidade,
  fetchRecentAuditHistory, AuditEntry, fetchColaboradores, Colaborador, getInvestmentByDepartment,
  fetchAllPeripherals, PeripheralGlobal,
} from "@/lib/api";
import { Package, DollarSign, UserCheck, PackageX, Plus } from "lucide-react";
import { MetricTooltip } from "@/components/MetricTooltip";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { UnidadeFilter, type UnidadeFilterValue } from "@/components/UnidadeFilter";
import { CategoriaFilter, type CategoriaFilterValue } from "@/components/CategoriaFilter";
import { DepartmentDrilldown } from "@/components/DepartmentDrilldown";
import { ExcelExportDialog } from "@/components/ExcelExportDialog";
import { History, Clock } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  "Disponível": "#22c55e",
  "Retirado": "#0081fc",
  "Vendido": "#6b7280",
  "Desconhecido": "#f59e0b",
  "Em uso": "#2263c8",
  "Manutenção": "#f97316",
  "Em Manutenção / Quebrado": "#f97316",
  "Em Triagem / Aguardando Teste": "#7c3aed",
};

const DEPT_COLORS = [
  "#2263c8", "#22c55e", "#f59e0b", "#f97316", "#7c3aed",
  "#ec4899", "#06b6d4", "#84cc16", "#6b7280",
];

function formatAuditDate(raw: string): string {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return "—";
  const date = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${date} às ${time}`;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const formatCurrencyShort = (value: number) => {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}k`;
  return formatCurrency(value);
};

export default function Dashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [peripherals, setPeripherals] = useState<PeripheralGlobal[]>([]);
  const [loading, setLoading] = useState(true);
  const [unidadeFilter, setUnidadeFilter] = useState<UnidadeFilterValue>("Todos");
  const [categoriaFilter, setCategoriaFilter] = useState<CategoriaFilterValue>("Tudo");
  const [recentChanges, setRecentChanges] = useState<AuditEntry[]>([]);
  const [drillDept, setDrillDept] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchAssets(),
      fetchRecentAuditHistory(5),
      fetchColaboradores(),
      fetchAllPeripherals(),
    ]).then(([assetData, auditData, colabData, periData]) => {
      setAssets(assetData);
      setRecentChanges(auditData);
      setColaboradores(colabData);
      setPeripherals(periData);
      setLoading(false);
    });
  }, []);

  // Mapa colaborador → departamento, e helper para inferir unidade pelo setor
  // Regra: colaboradores de "Operações" trabalham na Fábrica; demais, na Matriz.
  const deptByColab = useMemo(() => {
    const m = new Map<string, string>();
    colaboradores.forEach((c) => { if (c.departamento) m.set(c.nome, c.departamento); });
    return m;
  }, [colaboradores]);

  const unidadeForColab = (nome: string | null | undefined): "Matriz" | "Fábrica" | null => {
    if (!nome) return null;
    const dept = (deptByColab.get(nome) || "").toLowerCase();
    if (!dept) return null;
    return dept.includes("opera") ? "Fábrica" : "Matriz";
  };

  const filteredAssets = useMemo(() => {
    let list = assets;
    if (unidadeFilter !== "Todos") {
      list = list.filter((a) => {
        const derived = unidadeForColab(a.colaborador);
        const u = derived || a.unidade; // se tiver dono, dept manda; senão, fica com o registrado
        return u === unidadeFilter;
      });
    }
    if (categoriaFilter === "Notebooks") {
      list = list.filter((a) => (a.categoria || "").toLowerCase() === "notebook");
    }
    return list;
  }, [assets, unidadeFilter, categoriaFilter, deptByColab]);

  const nonSoldAssets = useMemo(
    () => filteredAssets.filter((a) => a.status !== "Vendido"),
    [filteredAssets]
  );

  // Periféricos: unidade derivada do departamento do dono
  const filteredPeripherals = useMemo(() => {
    if (categoriaFilter !== "Tudo") return [];
    if (unidadeFilter === "Todos") return peripherals;
    return peripherals.filter((p) => unidadeForColab(p.colaborador) === unidadeFilter);
  }, [peripherals, unidadeFilter, categoriaFilter, deptByColab]);

  const includePeripherals = categoriaFilter === "Tudo";
  const peripheralsValue = useMemo(
    () => filteredPeripherals.reduce((s, p) => s + (p.unit_price || 0), 0),
    [filteredPeripherals]
  );
  const peripheralsInUseValue = useMemo(
    () => filteredPeripherals.filter((p) => p.status === "Em Uso").reduce((s, p) => s + (p.unit_price || 0), 0),
    [filteredPeripherals]
  );

  const investmentByDept = useMemo(() => {
    const base = getInvestmentByDepartment(nonSoldAssets, colaboradores);
    if (!includePeripherals) return base;
    // soma valor de periféricos por colaborador → dept
    const deptMap = new Map<string, string>();
    colaboradores.forEach((c) => { if (c.departamento) deptMap.set(c.nome, c.departamento); });
    const investMap: Record<string, number> = {};
    base.forEach((b) => { investMap[b.name] = b.value; });
    filteredPeripherals.forEach((p) => {
      const nome = (p.colaborador || "").trim();
      const isStock = !nome || nome.toLowerCase() === "solvis";
      const dept = isStock ? "Em Estoque" : (deptMap.get(nome) || "Não Alocado");
      investMap[dept] = (investMap[dept] || 0) + (p.unit_price || 0);
    });
    return Object.entries(investMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [nonSoldAssets, colaboradores, filteredPeripherals, includePeripherals]);

  // Build a map: dept -> colaborador names, then filter assets
  const drillAssets = useMemo(() => {
    if (!drillDept) return [];
    const deptMap = new Map<string, string>();
    colaboradores.forEach((c) => {
      if (c.departamento) deptMap.set(c.nome, c.departamento);
    });
    return nonSoldAssets.filter((a) => {
      const nome = (a.colaborador || "").trim();
      const isStock = !nome || nome.toLowerCase() === "solvis";
      const dept = isStock ? "Em Estoque" : (deptMap.get(nome) || "Não Alocado");
      return dept === drillDept;
    });
  }, [drillDept, nonSoldAssets, colaboradores]);

  const drillPeripherals = useMemo(() => {
    if (!drillDept) return [];
    return filteredPeripherals.filter((p) => {
      const nome = (p.colaborador || "").trim();
      const isStock = !nome || nome.toLowerCase() === "solvis";
      const dept = isStock ? "Em Estoque" : (deptByColab.get(nome) || "Não Alocado");
      return dept === drillDept;
    });
  }, [drillDept, filteredPeripherals, deptByColab]);

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  const totalValue = getTotalValue(nonSoldAssets) + peripheralsValue;
  const statuses = getStatusDistribution(filteredAssets);
  const valorEmUso = nonSoldAssets.filter((a) => a.status === "Retirado").reduce((s, a) => s + a.valor, 0) + peripheralsInUseValue;
  const valorForaUso = nonSoldAssets.filter((a) => a.status !== "Retirado").reduce((s, a) => s + a.valor, 0) + (peripheralsValue - peripheralsInUseValue);
  const totalCount = nonSoldAssets.length + filteredPeripherals.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Visão macro do inventário de TI</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <ExcelExportDialog />
            <CategoriaFilter value={categoriaFilter} onChange={setCategoriaFilter} />
            <UnidadeFilter value={unidadeFilter} onChange={setUnidadeFilter} />
          </div>
        </div>

        {/* Top row: 4 stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Valor Total do Estoque"
            value={formatCurrency(totalValue)}
            icon={<DollarSign className="w-5 h-5 text-primary-foreground" />}
            gradient
            delay={0}
          />
          <StatCard
            title={includePeripherals ? "Ativos + Periféricos" : "Total de Ativos"}
            value={totalCount}
            icon={<Package className="w-5 h-5 text-primary" />}
            delay={0.1}
          />
          <StatCard
            title="Valor em Uso"
            value={formatCurrency(valorEmUso)}
            icon={<UserCheck className="w-5 h-5 text-primary" />}
            delay={0.2}
          />
          <StatCard
            title="Valor Fora de Uso"
            value={formatCurrency(valorForaUso)}
            icon={<PackageX className="w-5 h-5 text-primary" />}
            delay={0.3}
          />
        </div>

        {/* Bar chart */}
        <div className="bg-card rounded-xl p-6 shadow-card border">
            <h3 className="text-sm font-semibold text-foreground mb-1 inline-flex items-center">
              Investimento por Departamento
              <MetricTooltip text="Valor acumulado de todos os ativos (notebooks e periféricos) alocados a cada departamento, incluindo itens em estoque." />
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Valor total de ativos alocados por setor</p>
            {investmentByDept.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sem dados de departamento.</p>
            ) : (
              <div className="text-foreground">
              <ResponsiveContainer width="100%" height={Math.max(200, investmentByDept.length * 40 + 40)}>
                <BarChart data={investmentByDept} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    tickFormatter={formatCurrencyShort}
                    tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={({ x, y, payload }: any) => (
                      <text
                        x={x}
                        y={y}
                        textAnchor="end"
                        dominantBaseline="central"
                        fontSize={12}
                        fill="currentColor"
                        className="cursor-pointer hover:underline"
                        onClick={() => setDrillDept(payload.value)}
                      >
                        {payload.value}
                      </text>
                    )}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Valor"]}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      color: "hsl(var(--foreground))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: "0 4px 16px -2px rgb(0 0 0 / 0.1)",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24} cursor="pointer"
                    onClick={(data: any) => { if (data?.name) setDrillDept(data.name); }}
                    background={({ x, y, width, height, index }: any) => (
                      <rect
                        x={x}
                        y={y - 4}
                        width={width}
                        height={height + 8}
                        fill="transparent"
                        className="cursor-pointer"
                        rx={4}
                        onMouseEnter={(e) => { (e.target as SVGRectElement).setAttribute("fill", "hsl(var(--muted))"); }}
                        onMouseLeave={(e) => { (e.target as SVGRectElement).setAttribute("fill", "transparent"); }}
                        onClick={() => setDrillDept(investmentByDept[index]?.name)}
                      />
                    )}
                  >
                    {investmentByDept.map((_, i) => (
                      <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              </div>
            )}
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut chart */}
          <div className="bg-card rounded-xl p-6 shadow-card border">
            <h3 className="text-sm font-semibold text-foreground mb-1 inline-flex items-center">
              Status dos Ativos
              <MetricTooltip text="Distribuição percentual dos ativos conforme sua situação atual (em uso, disponível, manutenção, vendido, etc.)." />
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Distribuição atual por status</p>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statuses}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                  label={({ cx, cy }) => (
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="fill-foreground text-lg font-bold">
                      {nonSoldAssets.length}
                    </text>
                  )}
                  labelLine={false}
                >
                  {statuses.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px", boxShadow: "0 4px 16px -2px rgb(0 0 0 / 0.1)" }} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value) => {
                    const item = statuses.find((s) => s.name === value);
                    return <span className="text-xs text-muted-foreground">{value} ({item?.value ?? 0})</span>;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Feed de mudanças recentes */}
          <div className="bg-card rounded-xl p-6 shadow-card border">
            <div className="flex items-center gap-2 mb-1">
              <History className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Mudanças Recentes</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Últimas alterações no inventário</p>

            {recentChanges.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhuma alteração registrada.</p>
            ) : (
              <div className="space-y-3">
                {recentChanges.map((entry) => {
                  const isCreation = entry.campo === "Criação";
                  return (
                  <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                    <div className="mt-0.5 rounded-full bg-primary/10 p-1.5">
                      {isCreation ? (
                        <Plus className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {isCreation ? (
                        <>
                          <p className="text-xs font-semibold text-foreground">
                            {entry.usuario_nome} criou o ativo {entry.patrimonio}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-foreground">{entry.patrimonio}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{entry.campo}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            <span className="line-through opacity-60">{entry.valor_antigo || "—"}</span>
                            {" → "}
                            <span className="font-medium text-foreground">{entry.valor_novo || "—"}</span>
                          </p>
                        </>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {!isCreation && <span className="text-[10px] text-muted-foreground">{entry.usuario_nome}</span>}
                        {!isCreation && <span className="text-[10px] text-muted-foreground">•</span>}
                        <span className="text-[10px] text-muted-foreground">{formatAuditDate(entry.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <DepartmentDrilldown
        open={!!drillDept}
        onOpenChange={(open) => { if (!open) setDrillDept(null); }}
        department={drillDept || ""}
        assets={drillAssets}
        peripherals={drillPeripherals}
      />
    </DashboardLayout>
  );
}
