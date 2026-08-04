import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { dbClient } from "@/lib/dbClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Minus, Search, ChevronDown, Trash2, Pencil, Monitor, Mouse, Keyboard, Headphones, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ColaboradorCombobox } from "@/components/ColaboradorCombobox";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { matchesQuery, normalizeText } from "@/lib/fuzzySearch";
import { ExcelExportButton } from "@/components/ExcelExportButton";
import { exportPerifericos } from "@/lib/excelExport";

interface PeripheralModel {
  id: string;
  brand: string;
  model_name: string;
  category: string;
  unit_price: number | null;
  created_at: string;
}

interface PeripheralItem {
  id: string;
  model_id: string;
  patrimonio: string;
  serial: string | null;
  status: string;
  colaborador: string | null;
  observacoes: string | null;
  created_at: string;
}

const CATEGORIES = ["Mouse", "Teclado", "Headset", "Monitor", "Webcam", "Outro"];
const STATUSES = ["Disponível", "Em Uso", "Defeito"];

const categoryIcons: Record<string, React.ElementType> = {
  Mouse: Mouse,
  Teclado: Keyboard,
  Headset: Headphones,
  Monitor: Monitor,
  Webcam: Monitor,
  Outro: Package,
};

function statusColor(status: string) {
  switch (status) {
    case "Disponível": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "Em Uso": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "Defeito": return "bg-destructive/20 text-destructive border-destructive/30";
    default: return "bg-muted text-muted-foreground";
  }
}

/* ── Add/Edit Model Dialog ── */
function ModelFormDialog({
  onSuccess,
  editData,
  trigger,
}: {
  onSuccess: () => void;
  editData?: PeripheralModel | null;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ brand: "", model_name: "", category: "", unit_price: "", initial_qty: 0 });

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (v && editData) {
      setForm({
        brand: editData.brand,
        model_name: editData.model_name,
        category: editData.category,
        unit_price: editData.unit_price ? String(editData.unit_price) : "",
        initial_qty: 0,
      });
    } else if (v) {
      setForm({ brand: "", model_name: "", category: "", unit_price: "", initial_qty: 0 });
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        brand: form.brand,
        model_name: form.model_name,
        category: form.category,
        unit_price: form.unit_price ? parseFloat(form.unit_price) : null,
      };
      if (editData) {
        const { error } = await dbClient().from("peripheral_models").update(payload).eq("id", editData.id);
        if (error) throw error;
      } else {
        // Insert model and get back the ID
        const { data, error } = await dbClient().from("peripheral_models").insert(payload).select("id").single();
        if (error) throw error;

        // Create initial items if qty > 0
        if (form.initial_qty > 0 && data?.id) {
          const items = Array.from({ length: form.initial_qty }, () => ({
            model_id: data.id,
            patrimonio: null,
            serial: null,
            status: "Disponível",
            colaborador: null,
          }));
          const { error: itemsError } = await dbClient().from("peripheral_items").insert(items);
          if (itemsError) throw itemsError;
        }
      }
    },
    onSuccess: () => {
      toast.success(editData ? "Modelo atualizado!" : "Modelo cadastrado!");
      setOpen(false);
      onSuccess();
    },
    onError: (e: any) => toast.error(e.message || "Erro ao salvar"),
  });

  const valid = form.brand && form.model_name && form.category;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editData ? "Editar Modelo" : "Novo Modelo de Periférico"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Marca *</Label>
            <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Ex: Dell, Logitech" />
          </div>
          <div>
            <Label>Modelo *</Label>
            <Input value={form.model_name} onChange={(e) => setForm({ ...form, model_name: e.target.value })} placeholder="Ex: MS116, MK270" />
          </div>
          <div>
            <Label>Categoria *</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Valor Unitário (R$)</Label>
            <Input type="number" step="0.01" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} placeholder="Opcional" />
          </div>
          {!editData && (
            <div>
              <Label>Quantidade</Label>
              <p className="text-xs text-muted-foreground mb-1.5">{"\n"}</p>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.initial_qty}
                onChange={(e) => setForm({ ...form, initial_qty: Math.max(0, parseInt(e.target.value) || 0) })}
              />
            </div>
          )}
          <Button onClick={() => mutation.mutate()} disabled={!valid || mutation.isPending} className="w-full">
            {mutation.isPending ? "Salvando..." : editData ? "Salvar Alterações" : "Cadastrar Modelo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Add/Edit Item Dialog ── */
function ItemFormDialog({
  modelId,
  onSuccess,
  editData,
  trigger,
}: {
  modelId: string;
  onSuccess: () => void;
  editData?: PeripheralItem | null;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patrimonio: "", serial: "", status: "Disponível", colaborador: "", observacoes: "" });

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (v && editData) {
      setForm({
        patrimonio: editData.patrimonio,
        serial: editData.serial || "",
        status: editData.status,
        colaborador: editData.colaborador || "",
        observacoes: editData.observacoes || "",
      });
    } else if (v) {
      setForm({ patrimonio: "", serial: "", status: "Disponível", colaborador: "", observacoes: "" });
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (editData) {
        const { error } = await dbClient().from("peripheral_items").update({
          serial: form.serial || null,
          status: form.status,
          colaborador: form.colaborador || null,
          observacoes: form.observacoes || null,
        }).eq("id", editData.id);
        if (error) throw error;
      } else {
        const { error } = await dbClient().from("peripheral_items").insert({
          model_id: modelId,
          patrimonio: form.patrimonio.trim() ? form.patrimonio.toUpperCase() : null,
          serial: form.serial || null,
          status: form.status,
          colaborador: form.colaborador || null,
          observacoes: form.observacoes || null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editData ? "Item atualizado!" : "Unidade cadastrada!");
      setOpen(false);
      onSuccess();
    },
    onError: (e: any) => toast.error(e.message || "Erro ao salvar"),
  });

  const valid = true; // patrimonio is now optional

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editData ? "Editar Unidade" : "Adicionar Unidade"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Patrimônio *</Label>
            <Input
              value={form.patrimonio}
              onChange={(e) => setForm({ ...form, patrimonio: e.target.value })}
              placeholder="Ex: PAT-00123"
              disabled={!!editData}
            />
            {editData && <p className="text-xs text-muted-foreground mt-1">Patrimônio não pode ser alterado.</p>}
          </div>
          <div>
            <Label>Serial</Label>
            <Input value={form.serial} onChange={(e) => setForm({ ...form, serial: e.target.value })} placeholder="Número de série (opcional)" />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Colaborador</Label>
            <ColaboradorCombobox value={form.colaborador} onChange={(v) => {
              const trimmed = (v || "").trim();
              setForm((f) => ({
                ...f,
                colaborador: v,
                status: !trimmed && f.status === "Retirado" ? "Disponível" : f.status,
              }));
            }} />
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Opcional" rows={2} />
          </div>
          <Button onClick={() => mutation.mutate()} disabled={!valid || mutation.isPending} className="w-full">
            {mutation.isPending ? "Salvando..." : editData ? "Salvar Alterações" : "Cadastrar Unidade"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Model Detail Modal ── */
function ModelDetailModal({
  model,
  items,
  role,
  onRefresh,
  open,
  onOpenChange,
  onDeleteModel,
  highlightItemIds,
}: {
  model: PeripheralModel;
  items: PeripheralItem[];
  role: string | null;
  onRefresh: () => void;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDeleteModel?: () => void;
  highlightItemIds?: Set<string>;
}) {
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await dbClient().from("peripheral_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Unidade removida!"); onRefresh(); },
    onError: (e: any) => toast.error(e.message),
  });

  const available = items.filter((i) => i.status === "Disponível").length;
  const inUse = items.filter((i) => i.status === "Em Uso").length;
  const defective = items.filter((i) => i.status === "Defeito").length;

  // Sort: highlighted items first
  const sortedItems = useMemo(() => {
    if (!highlightItemIds || highlightItemIds.size === 0) return items;
    return [...items].sort((a, b) => {
      const aH = highlightItemIds.has(a.id) ? 0 : 1;
      const bH = highlightItemIds.has(b.id) ? 0 : 1;
      return aH - bH;
    });
  }, [items, highlightItemIds]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {model.brand} {model.model_name}
            <Badge variant="outline" className="font-normal text-xs">{model.category}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4 text-sm mb-4">
          <span className="text-muted-foreground">{items.length} unidades</span>
          {available > 0 && <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">{available} disp.</Badge>}
          {inUse > 0 && <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{inUse} em uso</Badge>}
          {defective > 0 && <Badge className="bg-destructive/20 text-destructive border-destructive/30">{defective} defeito</Badge>}
          {model.unit_price && (
            <span className="text-muted-foreground ml-auto">
              Valor unit.: <span className="text-foreground font-medium">R$ {model.unit_price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </span>
          )}
        </div>

        {role === "admin" && (
          <div className="flex items-center gap-2 mb-4">
            <ItemFormDialog
              modelId={model.id}
              onSuccess={onRefresh}
              trigger={<Button size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Adicionar Unidade</Button>}
            />
            <ModelFormDialog
              editData={model}
              onSuccess={onRefresh}
              trigger={<Button size="sm" variant="outline" className="gap-1.5"><Pencil className="w-3.5 h-3.5" /> Editar Modelo</Button>}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" /> Excluir Modelo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover Modelo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Excluir <span className="font-semibold text-foreground">"{model.brand} {model.model_name}"</span> e todas as <span className="font-semibold">{items.length}</span> unidades vinculadas? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDeleteModel?.()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Confirmar Exclusão
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Nenhuma unidade cadastrada para este modelo.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs">
                <th className="text-left p-3 font-medium">Patrimônio</th>
                <th className="text-left p-3 font-medium">Serial</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Colaborador</th>
                <th className="text-left p-3 font-medium">Observações</th>
                {role === "admin" && <th className="text-right p-3 font-medium">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => {
                const isHighlighted = !!highlightItemIds?.has(item.id);
                return (
                <tr
                  key={item.id}
                  className={`border-b border-border/50 transition-colors ${
                    isHighlighted
                      ? "bg-primary/10 hover:bg-primary/15 ring-1 ring-inset ring-primary/40"
                      : "hover:bg-accent/20"
                  }`}
                >
                  <td className="p-3 font-mono text-foreground">
                    {isHighlighted && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-2 align-middle" />}
                    {item.patrimonio || <span className="text-muted-foreground italic">Sem patrimônio</span>}
                  </td>
                  <td className="p-3 text-muted-foreground">{item.serial || "—"}</td>
                  <td className="p-3"><Badge className={statusColor(item.status)}>{item.status}</Badge></td>
                  <td className="p-3 text-muted-foreground">{item.colaborador && item.colaborador.toLowerCase() !== "solvis" ? item.colaborador : <Badge className="bg-success/15 text-success border border-success/30 font-medium">EM ESTOQUE</Badge>}</td>
                  <td className="p-3 text-muted-foreground text-xs max-w-[180px] truncate">{item.observacoes || "—"}</td>
                  {role === "admin" && (
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <ItemFormDialog
                          modelId={model.id}
                          editData={item}
                          onSuccess={onRefresh}
                          trigger={
                            <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          }
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover Unidade?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Excluir patrimônio <span className="font-semibold text-foreground">"{item.patrimonio}"</span>? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteItemMutation.mutate(item.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Confirmar Exclusão
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  )}
                </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ── Model Card (Gallery) ── */
function ModelCard({
  model,
  items,
  role,
  onRefresh,
  matchedItems,
  searchTerm,
  autoOpen,
  onOpenedAuto,
}: {
  model: PeripheralModel;
  items: PeripheralItem[];
  role: string | null;
  onRefresh: () => void;
  matchedItems?: PeripheralItem[];
  searchTerm?: string;
  autoOpen?: boolean;
  onOpenedAuto?: () => void;
}) {
  const [detailOpen, setDetailOpen] = useState(false);

  // Auto-open when requested by parent (single direct unit match)
  useEffect(() => {
    if (autoOpen && !detailOpen) {
      setDetailOpen(true);
      onOpenedAuto?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen]);

  const highlightItemIds = useMemo(
    () => new Set((matchedItems || []).map((i) => i.id)),
    [matchedItems]
  );
  const matchCount = matchedItems?.length || 0;
  const firstMatch = matchedItems?.[0];
  const [warnRemoveOpen, setWarnRemoveOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<PeripheralItem | null>(null);
  const Icon = categoryIcons[model.category] || Package;

  const available = items.filter((i) => i.status === "Disponível").length;
  const inUse = items.filter((i) => i.status === "Em Uso").length;
  const defective = items.filter((i) => i.status === "Defeito").length;

  const deleteModelMutation = useMutation({
    mutationFn: async () => {
      const { error } = await dbClient().from("peripheral_models").delete().eq("id", model.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Modelo e todas as unidades removidos!"); onRefresh(); },
    onError: (e: any) => toast.error(e.message),
  });

  // Stepper: add generic item
  const addGenericMutation = useMutation({
    mutationFn: async () => {
      const { error } = await dbClient().from("peripheral_items").insert({
        model_id: model.id,
        patrimonio: null,
        serial: null,
        status: "Disponível",
        colaborador: null,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Unidade adicionada!"); onRefresh(); },
    onError: (e: any) => toast.error(e.message),
  });

  // Stepper: remove item
  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await dbClient().from("peripheral_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Unidade removida!"); onRefresh(); setWarnRemoveOpen(false); setItemToRemove(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (items.length === 0) return;

    // Find a "clean" item (no patrimonio and no serial)
    const cleanItem = items.find((i) => (!i.patrimonio || i.patrimonio.trim() === "") && (!i.serial || i.serial.trim() === ""));

    if (cleanItem) {
      removeItemMutation.mutate(cleanItem.id);
    } else {
      // All items have patrimonio — warn user
      const candidate = items[items.length - 1];
      setItemToRemove(candidate);
      setWarnRemoveOpen(true);
    }
  };

  return (
    <>
      <div
        className="border border-border rounded-xl bg-card hover:bg-accent/20 transition-colors cursor-pointer group"
        onClick={() => setDetailOpen(true)}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">{model.brand} {model.model_name}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">
                  {model.category} ·{" "}
                  {matchCount > 0 && searchTerm ? (
                    <span className="text-primary font-medium">
                      {matchCount} unidade{matchCount !== 1 ? "s" : ""} corresponde{matchCount !== 1 ? "m" : ""} à sua busca
                    </span>
                  ) : (
                    <>{items.length} unidade{items.length !== 1 ? "s" : ""} cadastrada{items.length !== 1 ? "s" : ""}</>
                  )}
                </span>
                {available > 0 && <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] px-1.5 py-0">{available} disp.</Badge>}
                {inUse > 0 && <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px] px-1.5 py-0">{inUse} em uso</Badge>}
                {defective > 0 && <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-[10px] px-1.5 py-0">{defective} defeito</Badge>}
              </div>
              {matchCount > 0 && firstMatch && (
                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                  <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] px-1.5 py-0 gap-1">
                    <Search className="w-2.5 h-2.5" />
                    Match: {firstMatch.patrimonio
                      ? `Patrimônio ${firstMatch.patrimonio}`
                      : firstMatch.serial
                        ? `Serial ${firstMatch.serial}`
                        : firstMatch.colaborador
                          ? `Colaborador ${firstMatch.colaborador}`
                          : "unidade"}
                  </Badge>
                  {matchCount > 1 && (
                    <span className="text-[10px] text-muted-foreground">+{matchCount - 1} outros</span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {/* Stepper — fixed position, no dynamic siblings */}
            {role === "admin" && (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handleRemove}
                  disabled={items.length === 0 || removeItemMutation.isPending}
                  className="w-8 h-8 rounded-lg border border-border bg-card hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-foreground text-lg tabular-nums">{items.length}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); addGenericMutation.mutate(); }}
                  disabled={addGenericMutation.isPending}
                  className="w-8 h-8 rounded-lg border border-border bg-card hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Warning modal for removing item with patrimonio */}
      <AlertDialog open={warnRemoveOpen} onOpenChange={setWarnRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Atenção</AlertDialogTitle>
            <AlertDialogDescription>
              Não há itens genéricos no estoque. Você está prestes a remover um ativo com patrimônio
              {itemToRemove?.patrimonio && <> (<span className="font-semibold text-foreground">{itemToRemove.patrimonio}</span>)</>} e informações vinculadas. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToRemove && removeItemMutation.mutate(itemToRemove.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar Remoção
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ModelDetailModal
        model={model}
        items={items}
        role={role}
        onRefresh={onRefresh}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onDeleteModel={() => deleteModelMutation.mutate()}
        highlightItemIds={highlightItemIds}
      />
    </>
  );
}

/* ── Main Page ── */
export default function Perifericos() {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("Todos");

  const { data: models = [], isLoading: loadingModels } = useQuery({
    queryKey: ["peripheral_models"],
    queryFn: async () => {
      const { data, error } = await dbClient().from("peripheral_models").select("*").order("brand");
      if (error) throw error;
      return data as PeripheralModel[];
    },
  });

  const { data: items = [], isLoading: loadingItems } = useQuery({
    queryKey: ["peripheral_items"],
    queryFn: async () => {
      const { data, error } = await dbClient().from("peripheral_items").select("*").order("patrimonio");
      if (error) throw error;
      return data as PeripheralItem[];
    },
  });

  const isLoading = loadingModels || loadingItems;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["peripheral_models"] });
    queryClient.invalidateQueries({ queryKey: ["peripheral_items"] });
  };

  // Map items to models
  const itemsByModel = useMemo(() => {
    const map = new Map<string, PeripheralItem[]>();
    items.forEach((item) => {
      if (!map.has(item.model_id)) map.set(item.model_id, []);
      map.get(item.model_id)!.push(item);
    });
    return map;
  }, [items]);

  // Per-model matched units (for highlight + count badges)
  const matchedItemsByModel = useMemo(() => {
    const map = new Map<string, PeripheralItem[]>();
    if (!search.trim()) return map;
    items.forEach((i) => {
      if (
        matchesQuery(i, search, [
          "patrimonio",
          "serial",
          "colaborador",
        ] as Array<keyof PeripheralItem>)
      ) {
        if (!map.has(i.model_id)) map.set(i.model_id, []);
        map.get(i.model_id)!.push(i);
      }
    });
    return map;
  }, [items, search]);

  // Search + category filter (model matches OR has unit matches)
  const filteredModels = useMemo(() => {
    let base = models;
    if (categoryFilter !== "Todos") {
      const mainCats = ["Mouse", "Teclado", "Headset"];
      base = base.filter((m) => {
        if (categoryFilter === "Outros") return !mainCats.includes(m.category);
        return m.category === categoryFilter;
      });
    }
    if (!search.trim()) return base;
    return base.filter((m) => {
      if (
        matchesQuery(m, search, [
          "brand",
          "model_name",
          "category",
        ] as Array<keyof PeripheralModel>)
      ) {
        return true;
      }
      return (matchedItemsByModel.get(m.id)?.length || 0) > 0;
    });
  }, [models, search, matchedItemsByModel, categoryFilter]);

  // Auto-open: if exactly ONE model matches AND exactly ONE unit matched within it,
  // open that model's detail modal automatically with the unit highlighted.
  const autoOpenModelId = useMemo(() => {
    if (!search.trim()) return null;
    if (filteredModels.length !== 1) return null;
    const only = filteredModels[0];
    const matched = matchedItemsByModel.get(only.id) || [];
    return matched.length === 1 ? only.id : null;
  }, [filteredModels, matchedItemsByModel, search]);

  const [autoOpenedFor, setAutoOpenedFor] = useState<string | null>(null);

  // Direct patrimônio match (exact, ignorando acentos/case)
  const directMatch = useMemo(() => {
    if (!search.trim()) return null;
    const q = normalizeText(search);
    const item = items.find((i) => normalizeText(i.patrimonio) === q);
    if (!item) return null;
    const model = models.find((m) => m.id === item.model_id);
    return model ? { item, model } : null;
  }, [items, models, search]);

  const totalItems = items.length;
  const availableCount = items.filter((i) => i.status === "Disponível").length;
  const defectCount = items.filter((i) => i.status === "Defeito").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Periféricos</h1>
            <p className="text-sm text-muted-foreground">Controle de periféricos por modelo e patrimônio individual</p>
          </div>
          <div className="flex items-center gap-2">
            <ExcelExportButton onExport={async () => {
              const modelById = new Map(models.map((m) => [m.id, m]));
              const filteredIds = new Set(filteredModels.map((m) => m.id));
              const base = search.trim()
                ? Array.from(matchedItemsByModel.values()).flat().filter((i) => filteredIds.has(i.model_id))
                : items.filter((i) => filteredIds.has(i.model_id));
              const rows = base.map((i) => {
                const m = modelById.get(i.model_id);
                return {
                  patrimonio: i.patrimonio,
                  serial: i.serial,
                  status: i.status,
                  colaborador: i.colaborador,
                  observacoes: i.observacoes,
                  peripheral_models: m ? {
                    brand: m.brand,
                    model_name: m.model_name,
                    category: m.category,
                    unit_price: m.unit_price,
                  } : null,
                };
              });
              await exportPerifericos(rows);
            }} />
            {role === "admin" && (
              <ModelFormDialog
                onSuccess={refresh}
                trigger={<Button className="gap-2"><Plus className="w-4 h-4" /> Novo Modelo</Button>}
              />
            )}
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{models.length}</p>
              <p className="text-xs text-muted-foreground">Modelos</p>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/30 flex items-center justify-center">
              <Package className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalItems}</p>
              <p className="text-xs text-muted-foreground">Total Unidades</p>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">{availableCount}</p>
              <p className="text-xs text-muted-foreground">Disponíveis</p>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{defectCount}</p>
              <p className="text-xs text-muted-foreground">Com Defeito</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por patrimônio, modelo, marca ou colaborador..."
            className="pl-10"
          />
        </div>

        {/* Direct match banner */}
        {directMatch && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{directMatch.item.patrimonio} — {directMatch.model.brand} {directMatch.model.model_name}</p>
              <p className="text-sm text-muted-foreground">
                Status: <Badge className={statusColor(directMatch.item.status)}>{directMatch.item.status}</Badge>
                {" · "}Colaborador: {directMatch.item.colaborador || "Nenhum"}
              </p>
            </div>
          </motion.div>
        )}

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: "Todos", label: "Todos", count: models.length },
            { key: "Mouse", label: "Mouses", count: models.filter((m) => m.category === "Mouse").length },
            { key: "Teclado", label: "Teclados", count: models.filter((m) => m.category === "Teclado").length },
            { key: "Headset", label: "Headsets", count: models.filter((m) => m.category === "Headset").length },
            { key: "Outros", label: "Outros", count: models.filter((m) => !["Mouse", "Teclado", "Headset"].includes(m.category)).length },
          ].map((chip) => {
            const active = categoryFilter === chip.key;
            return (
              <button
                key={chip.key}
                onClick={() => setCategoryFilter(chip.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground"
                }`}
              >
                {chip.label}
                <span className={`ml-2 text-xs ${active ? "opacity-80" : "opacity-60"}`}>{chip.count}</span>
              </button>
            );
          })}
        </div>

        {/* Model cards */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-card border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum modelo encontrado</p>
            <p className="text-sm">Cadastre o primeiro usando o botão acima.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredModels.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                items={itemsByModel.get(model.id) || []}
                role={role}
                onRefresh={refresh}
                matchedItems={matchedItemsByModel.get(model.id)}
                searchTerm={search.trim() || undefined}
                autoOpen={false}
                onOpenedAuto={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
