import { useEffect, useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, UserCog, ArrowUp, ArrowDown, ArrowUpDown, Filter, Search } from "lucide-react";
import { smartFilter } from "@/lib/fuzzySearch";
import { ColaboradoresExportButton } from "@/components/ColaboradoresExportButton";
import { logAuditChanges } from "@/lib/api";

const DEPARTAMENTOS = [
  "Analytics",
  "CX",
  "Desenvolvimento",
  "Diretoria",
  "Financeiro",
  "Marketing",
  "Operações",
  "RH",
  "Vendas",
];

interface Colaborador {
  id: string;
  nome: string;
  departamento: string;
  email: string | null;
}

type SortCol = "nome" | "departamento" | "email";
type SortDir = "asc" | "desc";

export default function AdminColaboradores() {
  const { role, profile, user } = useAuth();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [sortCol, setSortCol] = useState<SortCol>("nome");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [deptFilter, setDeptFilter] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{ colab: Colaborador; notebooks: number; perifericos: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase.from("Colaboradores").select("*").order("nome");
    setColaboradores((data || []) as Colaborador[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: SortCol }) => {
    if (sortCol !== col) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  const filteredAndSorted = useMemo(() => {
    let list = colaboradores;
    if (deptFilter !== "Todos") {
      list = list.filter((c) => c.departamento === deptFilter);
    }
    if (searchTerm.trim()) {
      list = smartFilter(list, searchTerm, ["nome", "departamento", "email"]);
    }
    return [...list].sort((a, b) => {
      const valA = ((a[sortCol] as string) || "").toLowerCase();
      const valB = ((b[sortCol] as string) || "").toLowerCase();
      const cmp = valA.localeCompare(valB, "pt-BR");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [colaboradores, sortCol, sortDir, deptFilter, searchTerm]);

  const handleSave = async () => {
    if (!nome.trim()) { toast.warning("Nome é obrigatório."); return; }
    if (!departamento) { toast.warning("Departamento é obrigatório."); return; }
    if (!email.trim()) { toast.warning("E-mail é obrigatório."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.warning("E-mail inválido."); return;
    }
    setSaving(true);
    const payload = { nome: nome.trim(), departamento, email: email.trim().toLowerCase() };
    if (editingId) {
      const { error } = await supabase.from("Colaboradores").update(payload).eq("id", editingId);
      if (error) toast.error("Erro: " + error.message);
      else toast.success("Colaborador atualizado!");
    } else {
      const { error } = await supabase.from("Colaboradores").insert(payload);
      if (error) toast.error("Erro: " + error.message);
      else toast.success("Colaborador criado!");
    }
    setSaving(false);
    setModalOpen(false);
    setEditingId(null);
    setNome("");
    setDepartamento("");
    setEmail("");
    loadData();
  };

  const requestDelete = async (c: Colaborador) => {
    const sb = supabase as any;
    const [notebooksRes, perifericosRes] = await Promise.all([
      sb.from("EstoqueSolvis").select("Patrimônio", { count: "exact", head: true }).eq("Colaborador", c.nome),
      sb.from("peripheral_items").select("id", { count: "exact", head: true }).eq("colaborador", c.nome),
    ]);
    setPendingDelete({
      colab: c,
      notebooks: notebooksRes.count || 0,
      perifericos: perifericosRes.count || 0,
    });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { colab } = pendingDelete;
    const sb = supabase as any;
    setDeleting(true);
    try {
      // 1. Liberar notebooks/desktops + registrar histórico
      const { data: affectedAssets } = await sb
        .from("EstoqueSolvis")
        .select("\"Patrimônio\", \"Colaborador\", \"Status\"")
        .eq("Colaborador", colab.nome);

      if (affectedAssets && affectedAssets.length > 0) {
        const { error: upErr } = await sb
          .from("EstoqueSolvis")
          .update({ Colaborador: null, Status: "Disponível", Atualizado_Em: new Date().toISOString() })
          .eq("Colaborador", colab.nome);
        if (upErr) throw upErr;

        const userName = profile?.full_name || user?.email || "Sistema";
        await Promise.all(
          affectedAssets.map((a: any) =>
            logAuditChanges(
              a["Patrimônio"],
              { Colaborador: a["Colaborador"] || "", Status: a["Status"] || "" },
              { Colaborador: "", Status: "Disponível" },
              userName,
              user?.id
            ).catch((e) => console.error("Audit fail", e))
          )
        );
      }

      // 2. Liberar periféricos
      const { error: perErr } = await sb
        .from("peripheral_items")
        .update({ colaborador: null, status: "Disponível" })
        .eq("colaborador", colab.nome);
      if (perErr) throw perErr;

      // 3. Deletar colaborador
      const { error } = await sb.from("Colaboradores").delete().eq("id", colab.id);
      if (error) throw error;

      const total = pendingDelete.notebooks + pendingDelete.perifericos;
      toast.success(
        total > 0
          ? `Colaborador removido. ${total} item(ns) liberado(s) para o estoque.`
          : "Colaborador removido!"
      );
      setPendingDelete(null);
      loadData();
    } catch (e: any) {
      toast.error("Erro: " + (e?.message || "falha ao remover"));
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (c: Colaborador) => {
    setEditingId(c.id);
    setNome(c.nome);
    setDepartamento(c.departamento || "");
    setEmail(c.email || "");
    setModalOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setNome("");
    setDepartamento("");
    setEmail("");
    setModalOpen(true);
  };

  if (role !== "admin") return <Navigate to="/dashboard" replace />;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <UserCog className="w-6 h-6" /> Gestão de Colaboradores
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Cadastre e gerencie a lista de colaboradores</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar colaborador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-[220px]"
              />
            </div>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                {DEPARTAMENTOS.map((dep) => (
                  <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ColaboradoresExportButton data={filteredAndSorted.map((c) => ({ nome: c.nome, departamento: c.departamento || "", email: c.email || "" }))} />
            <Button onClick={openNew} size="sm" className="gradient-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-1" /> Novo Colaborador
            </Button>
          </div>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="bg-card rounded-xl shadow-card border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th
                    className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                    onClick={() => toggleSort("nome")}
                  >
                    <span className="inline-flex items-center gap-1">Nome <SortIcon col="nome" /></span>
                  </th>
                  <th
                    className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                    onClick={() => toggleSort("departamento")}
                  >
                    <span className="inline-flex items-center gap-1">Departamento <SortIcon col="departamento" /></span>
                  </th>
                  <th
                    className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                    onClick={() => toggleSort("email")}
                  >
                    <span className="inline-flex items-center gap-1">E-mail <SortIcon col="email" /></span>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-24">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{c.nome}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.departamento || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.email || <span className="text-destructive/70">— pendente —</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => requestDelete(c)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAndSorted.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Nenhum colaborador encontrado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={(v) => !v && setModalOpen(false)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Colaborador" : "Novo Colaborador"}</DialogTitle>
            <DialogDescription>Preencha os dados do colaborador.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome <span className="text-destructive">*</span></label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" autoFocus />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Departamento <span className="text-destructive">*</span></label>
              <Select value={departamento} onValueChange={setDepartamento}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um departamento" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTAMENTOS.map((dep) => (
                    <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail <span className="text-destructive">*</span></label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@solvis.com.br" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="gradient-primary text-primary-foreground">
              {saving ? "Salvando..." : editingId ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(v) => !v && !deleting && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover colaborador?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <div>
                  Você está prestes a remover <span className="font-semibold text-foreground">{pendingDelete?.colab.nome}</span>.
                </div>
                {pendingDelete && (pendingDelete.notebooks + pendingDelete.perifericos > 0) ? (
                  <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-warning-foreground">
                    <div className="font-medium mb-1">Itens vinculados serão liberados:</div>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {pendingDelete.notebooks > 0 && (
                        <li>{pendingDelete.notebooks} notebook(s)/desktop(s) → status "Disponível"</li>
                      )}
                      {pendingDelete.perifericos > 0 && (
                        <li>{pendingDelete.perifericos} periférico(s) → status "Disponível"</li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <div className="text-muted-foreground">Nenhum item vinculado a este colaborador.</div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); confirmDelete(); }} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
