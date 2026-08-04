import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Asset, Colaborador, fetchAssets, fetchColaboradores, getUniqueCollaborators } from "@/lib/api";
import { Search, User, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { CollaboratorTimelineSheet } from "@/components/CollaboratorTimelineSheet";
import { CollaboratorProfile } from "@/components/CollaboratorProfile";
import { smartFilter } from "@/lib/fuzzySearch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Busca() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("Todos");
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timelineOpen, setTimelineOpen] = useState(false);

  useEffect(() => {
    Promise.all([fetchAssets(), fetchColaboradores()]).then(([a, c]) => {
      setAssets(a);
      setColaboradores(c);
      setLoading(false);
    });
  }, []);

  const deptMap = useMemo(() => {
    const m = new Map<string, string>();
    colaboradores.forEach((c) => {
      if (c.departamento) m.set(c.nome, c.departamento);
    });
    return m;
  }, [colaboradores]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    colaboradores.forEach((c) => {
      if (c.departamento) set.add(c.departamento);
    });
    return [...set].sort();
  }, [colaboradores]);

  const collaborators = getUniqueCollaborators(assets);
  const hasUnassigned = collaborators.some((n) => !deptMap.get(n));
  const byDept = departmentFilter === "Todos"
    ? collaborators
    : departmentFilter === "Não Alocado"
      ? collaborators.filter((n) => !deptMap.get(n))
      : collaborators.filter((n) => deptMap.get(n) === departmentFilter);
  const filtered = search
    ? smartFilter(byDept, search, [(name) => name])
    : byDept;


  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Busca por Colaborador</h1>
          <p className="text-sm text-muted-foreground mt-1">Visualize ativos e histórico por pessoa</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card rounded-xl shadow-card border p-5 space-y-4">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Filtrar por departamento" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos os departamentos</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
                {hasUnassigned && <SelectItem value="Não Alocado">Não Alocado</SelectItem>}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar colaborador..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {filtered.map((name) => (
                <button
                  key={name}
                  onClick={() => setSelected(name)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 ${
                    selected === name
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <User className="w-4 h-4 flex-shrink-0" />
                  {name}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum resultado</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selected ? (
                <CollaboratorProfile
                  key={selected}
                  name={selected}
                  assets={assets}
                  colaboradores={colaboradores}
                  onOpenTimeline={() => setTimelineOpen(true)}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center h-64 text-muted-foreground text-sm"
                >
                  Selecione um colaborador para ver seu perfil
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <CollaboratorTimelineSheet
        open={timelineOpen}
        onOpenChange={setTimelineOpen}
        collaboratorName={selected}
        allAssets={assets}
      />
    </DashboardLayout>
  );
}
