import { useState } from "react";
import { Download, Loader2, FileSpreadsheet, FileText, FileType, ArrowDownAZ, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  exportColaboradoresXlsx,
  exportColaboradoresTxt,
  exportColaboradoresCsv,
  type ColaboradoresSort,
} from "@/lib/excelExport";

import type { ColaboradorExportRow } from "@/lib/excelExport";

interface Props {
  data?: ColaboradorExportRow[];
}

export function ColaboradoresExportButton({ data }: Props = {}) {
  const [loading, setLoading] = useState(false);

  async function run(format: "xlsx" | "txt" | "csv", sort: ColaboradoresSort) {
    setLoading(true);
    try {
      if (format === "xlsx") await exportColaboradoresXlsx(sort, data);
      else if (format === "txt") await exportColaboradoresTxt(sort, data);
      else await exportColaboradoresCsv(sort, data);
      toast.success(`Arquivo ${format.toUpperCase()} exportado com sucesso!`);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao exportar arquivo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {loading ? "Gerando..." : "Exportar"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FileSpreadsheet className="w-4 h-4 mr-2 text-primary" />
            Excel (.xlsx)
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-52">
            <DropdownMenuItem onClick={() => run("xlsx", "nome")}>
              <ArrowDownAZ className="w-4 h-4 mr-2 text-muted-foreground" />
              Ordenar por Nome
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => run("xlsx", "departamento")}>
              <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
              Ordenar por Departamento
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
            Texto (.txt)
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-52">
            <DropdownMenuItem onClick={() => run("txt", "nome")}>
              <ArrowDownAZ className="w-4 h-4 mr-2 text-muted-foreground" />
              Ordenar por Nome
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => run("txt", "departamento")}>
              <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
              Ordenar por Departamento
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FileType className="w-4 h-4 mr-2 text-muted-foreground" />
            CSV (.csv)
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-52">
            <DropdownMenuItem onClick={() => run("csv", "nome")}>
              <ArrowDownAZ className="w-4 h-4 mr-2 text-muted-foreground" />
              Ordenar por Nome
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => run("csv", "departamento")}>
              <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
              Ordenar por Departamento
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
