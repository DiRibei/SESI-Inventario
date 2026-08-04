import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Asset, fetchCollaboratorHistory, type CollaboratorTimelineEntry } from "@/lib/api";
import { Clock, ArrowRight, User, Package, RefreshCw, Wrench, MapPin, MessageSquare } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaboratorName: string | null;
  allAssets: Asset[];
}

function fieldIcon(campo: string) {
  if (campo === "Colaborador") return <User className="w-4 h-4" />;
  if (campo === "Status") return <RefreshCw className="w-4 h-4" />;
  if (campo === "Unidade") return <MapPin className="w-4 h-4" />;
  if (campo === "Observações") return <MessageSquare className="w-4 h-4" />;
  if (campo === "Criação") return <Package className="w-4 h-4" />;
  return <Wrench className="w-4 h-4" />;
}

function describeEvent(e: CollaboratorTimelineEntry, collaborator: string): string {
  const assetLabel = e.asset
    ? `${e.asset.categoria} ${e.asset.marca} ${e.asset.modelo}`.trim()
    : `Patrimônio ${e.patrimonio}`;

  if (e.campo === "Colaborador") {
    if (e.valor_novo === collaborator) return `Recebeu ${assetLabel}`;
    if (e.valor_antigo === collaborator) return `Devolveu ${assetLabel}`;
    return `Transferência: ${e.valor_antigo || "—"} → ${e.valor_novo || "—"} (${assetLabel})`;
  }
  if (e.campo === "Status") return `Status de ${assetLabel}: ${e.valor_antigo || "—"} → ${e.valor_novo || "—"}`;
  if (e.campo === "Unidade") return `Unidade de ${assetLabel}: ${e.valor_antigo || "—"} → ${e.valor_novo || "—"}`;
  if (e.campo === "Observações") return `Observação em ${assetLabel}: ${e.valor_novo || "—"}`;
  if (e.campo === "Criação") return `${assetLabel} registrado no sistema`;
  return `${e.campo} alterado em ${assetLabel}`;
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function CollaboratorTimelineSheet({ open, onOpenChange, collaboratorName, allAssets }: Props) {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<CollaboratorTimelineEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !collaboratorName) return;
    setLoading(true);
    fetchCollaboratorHistory(collaboratorName, allAssets)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [open, collaboratorName, allAssets]);

  const handleAssetClick = (patrimonio: string) => {
    onOpenChange(false);
    navigate(`/inventario?patrimonio=${encodeURIComponent(patrimonio)}`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Linha do Tempo
          </SheetTitle>
          <SheetDescription>
            {collaboratorName ? `Movimentações de ${collaboratorName}` : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {loading ? (
            <LoadingSpinner />
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma movimentação registrada para este colaborador.
            </p>
          ) : (
            <ol className="relative border-l-2 border-border ml-3 space-y-5">
              {entries.map((e) => (
                <li key={e.id} className="ml-6">
                  <span className="absolute -left-[11px] flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary ring-4 ring-background">
                    {fieldIcon(e.campo)}
                  </span>
                  <div className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <time className="text-xs font-medium text-muted-foreground">
                        {formatDate(e.created_at)}
                      </time>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                        {e.campo}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {describeEvent(e, collaboratorName || "")}
                    </p>
                    <button
                      onClick={() => handleAssetClick(e.patrimonio)}
                      className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Ver ativo {e.patrimonio}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
