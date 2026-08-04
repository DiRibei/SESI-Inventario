import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface SelectedAssetInfo {
  patrimonio: string;
  modelo: string;
  colaborador: string;
}

interface SelectionReviewModalProps {
  open: boolean;
  onClose: () => void;
  items: SelectedAssetInfo[];
  onRemove: (patrimonio: string) => void;
}

export function SelectionReviewModal({ open, onClose, items, onRemove }: SelectionReviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Itens Selecionados ({items.length})</DialogTitle>
          <DialogDescription>
            Revise os ativos antes de aplicar alterações em massa.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] pr-2">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum item selecionado.</p>
          ) : (
            <div className="space-y-1">
              {items.map((item) => (
                <div
                  key={item.patrimonio}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 group transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-xs font-medium text-primary">{item.patrimonio}</span>
                    <span className="mx-2 text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{item.modelo || "—"}</span>
                    <span className="mx-2 text-muted-foreground">·</span>
                    <span className="text-xs">{item.colaborador || "—"}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    onClick={() => onRemove(item.patrimonio)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
