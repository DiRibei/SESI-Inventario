import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  label?: string;
  onExport: () => Promise<void> | void;
  disabled?: boolean;
}

export function ExcelExportButton({ label = "Exportar Excel", onExport, disabled }: Props) {
  const [loading, setLoading] = useState(false);
  async function handle() {
    setLoading(true);
    try {
      await onExport();
      toast.success("Arquivo exportado com sucesso!");
    } catch (e: any) {
      toast.error(e?.message || "Erro ao exportar arquivo");
    } finally {
      setLoading(false);
    }
  }
  return (
    <Button size="sm" variant="outline" className="gap-2" onClick={handle} disabled={loading || disabled}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {loading ? "Gerando..." : label}
    </Button>
  );
}
