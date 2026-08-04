import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColaboradorCombobox } from "@/components/ColaboradorCombobox";
import { bulkUpdateAssets, Asset } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";

const STATUS_OPTIONS = ["Disponível", "Retirado", "Vendido", "Desconhecido", "Em Manutenção / Quebrado", "Em Triagem / Aguardando Teste"];
const CATEGORIA_OPTIONS = ["Notebook", "Desktop"];
const UNIDADE_OPTIONS = ["Matriz", "Fábrica"];

type FieldKey = "categoria" | "marca" | "modelo" | "unidade" | "status" | "valor" | "colaborador" | "observacoes";

interface BulkEditModalProps {
  open: boolean;
  onClose: () => void;
  selectedPatrimonios: string[];
  onUpdated: () => void;
}

const emptyValues: Record<FieldKey, string> = {
  categoria: "", marca: "", modelo: "", unidade: "", status: "",
  valor: "", colaborador: "", observacoes: "",
};

export function BulkEditModal({ open, onClose, selectedPatrimonios, onUpdated }: BulkEditModalProps) {
  const [enabled, setEnabled] = useState<Record<FieldKey, boolean>>({
    categoria: false, marca: false, modelo: false, unidade: false,
    status: false, valor: false, colaborador: false, observacoes: false,
  });
  const [values, setValues] = useState<Record<FieldKey, string>>({ ...emptyValues });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setEnabled({ categoria: false, marca: false, modelo: false, unidade: false, status: false, valor: false, colaborador: false, observacoes: false });
      setValues({ ...emptyValues });
      setSaving(false);
    }
  }, [open]);

  const toggle = (k: FieldKey) => setEnabled((p) => ({ ...p, [k]: !p[k] }));
  const setVal = (k: FieldKey, v: string) => setValues((p) => ({ ...p, [k]: v }));

  const activeCount = Object.values(enabled).filter(Boolean).length;

  const handleApply = async () => {
    if (activeCount === 0) {
      toast.warning("Marque ao menos um campo para alterar.");
      return;
    }
    const updates: Partial<Asset> = {};
    if (enabled.categoria) updates.categoria = values.categoria;
    if (enabled.marca) updates.marca = values.marca;
    if (enabled.modelo) updates.modelo = values.modelo;
    if (enabled.unidade) updates.unidade = values.unidade as Asset["unidade"];
    if (enabled.status) updates.status = values.status;
    if (enabled.valor) updates.valor = parseFloat(values.valor.replace(",", ".")) || 0;
    if (enabled.colaborador) updates.colaborador = values.colaborador;
    if (enabled.observacoes) updates.observacoes = values.observacoes;

    // Auto colaborador when Vendido and not explicitly set
    if (enabled.status && values.status === "Vendido" && !enabled.colaborador) {
      updates.colaborador = "Vendido/Ex-Ativo";
    }

    setSaving(true);
    const ok = await bulkUpdateAssets(selectedPatrimonios, updates);
    if (ok) {
      toast.success(`${selectedPatrimonios.length} ativos atualizados (${activeCount} campo${activeCount > 1 ? "s" : ""}).`);
      onUpdated();
      onClose();
    } else {
      toast.error("Erro ao atualizar em massa.");
    }
    setSaving(false);
  };

  const row = (key: FieldKey, label: string, control: React.ReactNode) => (
    <div className="flex items-start gap-3 py-2">
      <Checkbox
        checked={enabled[key]}
        onCheckedChange={() => toggle(key)}
        className="mt-2.5"
        id={`bulk-${key}`}
      />
      <div className="flex-1 space-y-1">
        <Label htmlFor={`bulk-${key}`} className="text-xs font-medium text-muted-foreground">{label}</Label>
        <div className={enabled[key] ? "" : "opacity-40 pointer-events-none"}>
          {control}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !saving && onClose()}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edição em Massa</DialogTitle>
          <DialogDescription>
            Marque os campos que deseja alterar em <strong>{selectedPatrimonios.length}</strong> ativo{selectedPatrimonios.length > 1 ? "s" : ""} selecionado{selectedPatrimonios.length > 1 ? "s" : ""}.
            Somente campos marcados serão sobrescritos.
          </DialogDescription>
        </DialogHeader>

        <div className="divide-y">
          {row("status", "Status",
            <Select value={values.status} onValueChange={(v) => setVal("status", v)}>
              <SelectTrigger><SelectValue placeholder="Selecionar status" /></SelectTrigger>
              <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          )}
          {row("colaborador", "Colaborador",
            <ColaboradorCombobox value={values.colaborador} onChange={(v) => setVal("colaborador", v)} />
          )}
          {row("categoria", "Categoria",
            <Select value={values.categoria} onValueChange={(v) => setVal("categoria", v)}>
              <SelectTrigger><SelectValue placeholder="Selecionar categoria" /></SelectTrigger>
              <SelectContent>{CATEGORIA_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          )}
          {row("unidade", "Unidade",
            <Select value={values.unidade} onValueChange={(v) => setVal("unidade", v)}>
              <SelectTrigger><SelectValue placeholder="Selecionar unidade" /></SelectTrigger>
              <SelectContent>{UNIDADE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          )}
          {row("marca", "Marca",
            <Input value={values.marca} onChange={(e) => setVal("marca", e.target.value)} placeholder="Ex.: Dell" />
          )}
          {row("modelo", "Modelo",
            <Input value={values.modelo} onChange={(e) => setVal("modelo", e.target.value)} placeholder="Ex.: Latitude 5420" />
          )}
          {row("valor", "Valor (R$)",
            <Input type="text" inputMode="decimal" value={values.valor} onChange={(e) => setVal("valor", e.target.value)} placeholder="0,00" />
          )}
          {row("observacoes", "Observações",
            <Textarea value={values.observacoes} onChange={(e) => setVal("observacoes", e.target.value)} rows={3} placeholder="Texto será aplicado a todos" />
          )}
        </div>

        {activeCount > 0 && (
          <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              <strong>{activeCount} campo{activeCount > 1 ? "s" : ""}</strong> será{activeCount > 1 ? "ão" : ""} sobrescrito{activeCount > 1 ? "s" : ""} em <strong>{selectedPatrimonios.length}</strong> ativo{selectedPatrimonios.length > 1 ? "s" : ""}. Esta ação não pode ser desfeita.
            </span>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={handleApply} disabled={saving || activeCount === 0} className="gradient-primary text-primary-foreground">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Aplicar em {selectedPatrimonios.length} ativo{selectedPatrimonios.length > 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
