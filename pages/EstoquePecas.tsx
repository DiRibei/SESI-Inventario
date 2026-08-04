import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { dbClient } from "@/lib/dbClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Minus, Package, Trash2, AlertTriangle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ExcelExportButton } from "@/components/ExcelExportButton";
import { exportPecas } from "@/lib/excelExport";

interface SparePart {
  id: string;
  item_name: string;
  category: string;
  quantity: number;
  min_quantity: number;
  unit_price: number | null;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = ["RAM", "SSD", "HDD", "Fonte", "Tela", "Bateria", "Carregador", "Cabo", "Outro"];

function AddPartDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    item_name: "",
    category: "",
    quantity: 0,
    min_quantity: 1,
    unit_price: "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await dbClient().from("spare_parts").insert({
        item_name: form.item_name,
        category: form.category,
        quantity: form.quantity,
        min_quantity: form.min_quantity,
        unit_price: form.unit_price ? parseFloat(form.unit_price) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Peça adicionada com sucesso!");
      setOpen(false);
      setForm({ item_name: "", category: "", quantity: 0, min_quantity: 1, unit_price: "" });
      onSuccess();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Nova Peça
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Peça ao Estoque</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Nome da Peça</Label>
            <Input
              placeholder="Ex: RAM 8GB DDR4"
              value={form.item_name}
              onChange={(e) => setForm((f) => ({ ...f, item_name: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Categoria</Label>
            <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Quantidade Inicial</Label>
              <Input
                type="number"
                min={0}
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Qtd. Mínima (alerta)</Label>
              <Input
                type="number"
                min={0}
                value={form.min_quantity}
                onChange={(e) => setForm((f) => ({ ...f, min_quantity: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Preço Unitário (opcional)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="R$ 0,00"
              value={form.unit_price}
              onChange={(e) => setForm((f) => ({ ...f, unit_price: e.target.value }))}
            />
          </div>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!form.item_name || !form.category || mutation.isPending}
          >
            {mutation.isPending ? "Salvando..." : "Adicionar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditPartDialog({ part, onSuccess }: { part: SparePart; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    item_name: part.item_name,
    category: part.category,
    min_quantity: part.min_quantity,
    unit_price: part.unit_price != null ? String(part.unit_price) : "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await dbClient()
        .from("spare_parts")
        .update({
          item_name: form.item_name,
          category: form.category,
          min_quantity: form.min_quantity,
          unit_price: form.unit_price ? parseFloat(form.unit_price) : null,
        })
        .eq("id", part.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Peça atualizada com sucesso!");
      setOpen(false);
      onSuccess();
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Reset form when dialog opens
  const handleOpenChange = (v: boolean) => {
    if (v) {
      setForm({
        item_name: part.item_name,
        category: part.category,
        min_quantity: part.min_quantity,
        unit_price: part.unit_price != null ? String(part.unit_price) : "",
      });
    }
    setOpen(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="text-muted-foreground/40 hover:text-primary transition-colors">
          <Pencil className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Peça</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Nome da Peça</Label>
            <Input
              value={form.item_name}
              onChange={(e) => setForm((f) => ({ ...f, item_name: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Categoria</Label>
            <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Qtd. Mínima (alerta)</Label>
            <Input
              type="number"
              min={0}
              value={form.min_quantity}
              onChange={(e) => setForm((f) => ({ ...f, min_quantity: parseInt(e.target.value) || 0 }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Preço Unitário (opcional)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="R$ 0,00"
              value={form.unit_price}
              onChange={(e) => setForm((f) => ({ ...f, unit_price: e.target.value }))}
            />
          </div>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!form.item_name || !form.category || mutation.isPending}
          >
            {mutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SparePartCard({ part, onRefresh, isAdmin }: { part: SparePart; onRefresh: () => void; isAdmin: boolean }) {
  const isLow = part.quantity <= part.min_quantity;
  const queryClient = useQueryClient();

  const updateQty = useMutation({
    mutationFn: async (delta: number) => {
      const newQty = Math.max(0, part.quantity + delta);
      const { error } = await dbClient()
        .from("spare_parts")
        .update({ quantity: newQty })
        .eq("id", part.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["spare_parts"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const deletePart = useMutation({
    mutationFn: async () => {
      const { error } = await dbClient().from("spare_parts").delete().eq("id", part.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Peça removida.");
      onRefresh();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative rounded-xl border bg-card p-5 transition-all ${
        isLow
          ? "border-destructive/60 shadow-[0_0_15px_-3px_hsl(var(--destructive)/0.4)] animate-pulse-subtle"
          : "border-border hover:border-primary/30"
      }`}
    >
      {isLow && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-destructive text-xs font-medium">
          <AlertTriangle className="w-3.5 h-3.5" />
          Estoque baixo
        </div>
      )}

      {isAdmin && (
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <EditPartDialog part={part} onSuccess={onRefresh} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="text-muted-foreground/40 hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover Item?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir <span className="font-semibold text-foreground">"{part.item_name}"</span> do estoque? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deletePart.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Confirmar Exclusão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {part.category}
        </span>
      </div>

      <h3 className="font-semibold text-sm text-foreground mt-2 mb-4 pr-16 leading-snug">{part.item_name}</h3>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full"
                disabled={part.quantity <= 0 || updateQty.isPending}
                onClick={() => updateQty.mutate(-1)}
              >
                <Minus className="w-3.5 h-3.5" />
              </Button>

              <span className={`text-3xl font-bold tabular-nums min-w-[3ch] text-center ${isLow ? "text-destructive" : "text-foreground"}`}>
                {part.quantity}
              </span>

              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full"
                disabled={updateQty.isPending}
                onClick={() => updateQty.mutate(1)}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </>
          ) : (
            <span className={`text-3xl font-bold tabular-nums min-w-[3ch] text-center ${isLow ? "text-destructive" : "text-foreground"}`}>
              {part.quantity}
            </span>
          )}
        </div>

        {part.unit_price != null && (
          <span className="text-xs text-muted-foreground">
            R$ {part.unit_price.toFixed(2)}
          </span>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground/60 mt-3">
        Mín: {part.min_quantity} un.
      </p>
    </motion.div>
  );
}

export default function EstoquePecas() {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const queryClient = useQueryClient();
  const [filterCat, setFilterCat] = useState<string>("all");

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ["spare_parts"],
    queryFn: async () => {
      const { data, error } = await dbClient()
        .from("spare_parts")
        .select("*")
        .order("category")
        .order("item_name");
      if (error) throw error;
      return data as SparePart[];
    },
  });

  const categories = [...new Set(parts.map((p) => p.category))].sort();
  const filtered = filterCat === "all" ? parts : parts.filter((p) => p.category === filterCat);
  const lowCount = parts.filter((p) => p.quantity <= p.min_quantity).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Estoque de Peças</h1>
            <p className="text-sm text-muted-foreground">
              {parts.length} itens cadastrados
              {lowCount > 0 && (
                <span className="text-destructive font-medium ml-2">• {lowCount} com estoque baixo</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ExcelExportButton onExport={() => exportPecas(filtered)} />
            {isAdmin && (
              <AddPartDialog onSuccess={() => queryClient.invalidateQueries({ queryKey: ["spare_parts"] })} />
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Package className="w-5 h-5 animate-spin mr-2" /> Carregando...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Package className="w-10 h-10 mb-3 opacity-40" />
            <p>Nenhuma peça encontrada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((part) => (
                <SparePartCard
                  key={part.id}
                  part={part}
                  isAdmin={isAdmin}
                  onRefresh={() => queryClient.invalidateQueries({ queryKey: ["spare_parts"] })}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
