import { useState } from "react";
import { Download, Loader2, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { exportDashboard } from "@/lib/excelExport";

export function ExcelExportDialog() {
  const [open, setOpen] = useState(false);
  const [notebooks, setNotebooks] = useState(true);
  const [perifericos, setPerifericos] = useState(true);
  const [pecas, setPecas] = useState(true);
  const [loading, setLoading] = useState(false);

  const anySelected = notebooks || perifericos || pecas;

  async function handleExport() {
    if (!anySelected) return;
    setLoading(true);
    try {
      await exportDashboard({ notebooks, perifericos, pecas });
      toast.success("Relatório exportado com sucesso!");
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao exportar relatório");
    } finally {
      setLoading(false);
    }
  }

  const options = [
    { key: "notebooks", label: "Notebooks", desc: "Inventário completo de notebooks", checked: notebooks, set: setNotebooks },
    { key: "perifericos", label: "Periféricos", desc: "Mouses, teclados, headsets e outros", checked: perifericos, set: setPerifericos },
    { key: "pecas", label: "Peças", desc: "Estoque de peças de reposição", checked: pecas, set: setPecas },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Exportar Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" /> Exportar Relatório
          </DialogTitle>
          <DialogDescription>
            Selecione as categorias para incluir no arquivo .xlsx. Cada categoria será exportada como uma aba separada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {options.map((opt) => (
            <label
              key={opt.key}
              className="flex items-start gap-3 rounded-lg border bg-card p-3 cursor-pointer transition-all hover:bg-accent/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <Checkbox
                checked={opt.checked}
                onCheckedChange={(v) => opt.set(Boolean(v))}
                className="mt-0.5"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={!anySelected || loading} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {loading ? "Gerando..." : "Exportar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
