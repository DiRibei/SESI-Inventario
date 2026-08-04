import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { bulkUpdateAssets } from "@/lib/api";
import { toast } from "sonner";
import { CheckSquare, X, Loader2, Eye, Pencil } from "lucide-react";
import { BulkEditModal } from "@/components/BulkEditModal";

interface BulkActionsBarProps {
  selectedCount: number;
  selectedPatrimonios: string[];
  onClear: () => void;
  onUpdated: (updates: { status?: string; colaborador?: string }) => void;
  onReview: () => void;
}

const STATUS_OPTIONS = ["Disponível", "Retirado", "Vendido", "Desconhecido"];

export function BulkActionsBar({ selectedCount, selectedPatrimonios, onClear, onUpdated, onReview }: BulkActionsBarProps) {
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkLocal, setBulkLocal] = useState("");
  const [saving, setSaving] = useState(false);
  const [editAllOpen, setEditAllOpen] = useState(false);

  if (selectedCount === 0) return null;

  const handleApply = async () => {
    const updates: { status?: string; colaborador?: string } = {};
    if (bulkStatus) updates.status = bulkStatus;
    if (bulkLocal.trim()) updates.colaborador = bulkLocal.trim();

    // Auto-set colaborador when status is Vendido
    if (bulkStatus === "Vendido" && !bulkLocal.trim()) {
      updates.colaborador = "Vendido/Ex-Ativo";
    }

    if (!updates.status && !updates.colaborador) {
      toast.warning("Selecione um status ou informe um colaborador para atualizar.");
      return;
    }

    setSaving(true);
    const ok = await bulkUpdateAssets(selectedPatrimonios, updates);
    if (ok) {
      toast.success(`${selectedCount} ativos atualizados com sucesso!`);
      onUpdated(updates);
    } else {
      toast.error("Erro ao atualizar ativos.");
    }
    setBulkStatus("");
    setBulkLocal("");
    setSaving(false);
  };

  return (
    <>
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-wrap items-center gap-3">
        <button
          onClick={onReview}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:underline cursor-pointer"
        >
          <CheckSquare className="w-4 h-4" />
          {selectedCount} selecionado{selectedCount > 1 ? "s" : ""}
          <Eye className="w-3.5 h-3.5 ml-0.5" />
        </button>

        <div className="flex flex-wrap items-center gap-2 flex-1">
          <Select value={bulkStatus} onValueChange={setBulkStatus}>
            <SelectTrigger className="w-40 h-9 text-xs">
              <SelectValue placeholder="Alterar Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Alterar Colaborador"
            value={bulkLocal}
            onChange={(e) => setBulkLocal(e.target.value)}
            className="w-52 h-9 text-xs"
          />

          <Button size="sm" onClick={handleApply} disabled={saving} className="gradient-primary text-primary-foreground h-9">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Aplicar"}
          </Button>

          <div className="h-6 w-px bg-border mx-1" />

          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditAllOpen(true)}
            className="h-9 gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" />
            Editar todos os campos
          </Button>

          <Button size="sm" variant="ghost" onClick={onClear} className="h-9">
            <X className="w-3 h-3 mr-1" /> Limpar
          </Button>
        </div>
      </div>

      <BulkEditModal
        open={editAllOpen}
        onClose={() => setEditAllOpen(false)}
        selectedPatrimonios={selectedPatrimonios}
        onUpdated={() => onUpdated({})}
      />
    </>
  );
}

