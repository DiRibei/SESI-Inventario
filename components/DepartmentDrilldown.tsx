import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { ArrowUpDown, ArrowUp, ArrowDown, Package, Mouse } from "lucide-react";
import type { Asset, PeripheralGlobal } from "@/lib/api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: string;
  assets: Asset[];
  peripherals?: PeripheralGlobal[];
}

type SortKey = "patrimonio" | "colaborador" | "modelo" | "valor";
type SortDir = "asc" | "desc";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="w-3.5 h-3.5 ml-1 opacity-40" />;
  return dir === "asc"
    ? <ArrowUp className="w-3.5 h-3.5 ml-1 text-primary" />
    : <ArrowDown className="w-3.5 h-3.5 ml-1 text-primary" />;
}

function useSort<T>(rows: T[], initial: SortKey = "valor") {
  const [sortKey, setSortKey] = useState<SortKey>(initial);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const toggle = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };
  return { sortKey, sortDir, toggle };
}

export function DepartmentDrilldown({ open, onOpenChange, department, assets, peripherals = [] }: Props) {
  // Assets sort
  const aSort = useSort(assets);
  const sortedAssets = useMemo(() => {
    const copy = [...assets];
    copy.sort((a, b) => {
      let cmp = 0;
      if (aSort.sortKey === "valor") cmp = a.valor - b.valor;
      else cmp = (a[aSort.sortKey] || "").localeCompare(b[aSort.sortKey] || "", "pt-BR");
      return aSort.sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [assets, aSort.sortKey, aSort.sortDir]);

  // Peripherals sort
  const pSort = useSort(peripherals);
  const sortedPeripherals = useMemo(() => {
    const copy = [...peripherals];
    copy.sort((a, b) => {
      let cmp = 0;
      if (pSort.sortKey === "valor") cmp = (a.unit_price || 0) - (b.unit_price || 0);
      else if (pSort.sortKey === "patrimonio") cmp = (a.patrimonio || "").localeCompare(b.patrimonio || "", "pt-BR");
      else if (pSort.sortKey === "colaborador") cmp = (a.colaborador || "").localeCompare(b.colaborador || "", "pt-BR");
      else if (pSort.sortKey === "modelo") cmp = `${a.brand} ${a.model_name}`.localeCompare(`${b.brand} ${b.model_name}`, "pt-BR");
      return pSort.sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [peripherals, pSort.sortKey, pSort.sortDir]);

  const totalAssets = useMemo(() => assets.reduce((s, a) => s + a.valor, 0), [assets]);
  const totalPeripherals = useMemo(() => peripherals.reduce((s, p) => s + (p.unit_price || 0), 0), [peripherals]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>{department}</SheetTitle>
          <SheetDescription>
            Total: {formatCurrency(totalAssets + totalPeripherals)}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="assets" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="assets" className="gap-1.5">
              <Package className="w-3.5 h-3.5" /> Ativos
              <span className="ml-1 text-[10px] opacity-60">({assets.length})</span>
            </TabsTrigger>
            <TabsTrigger value="per" className="gap-1.5">
              <Mouse className="w-3.5 h-3.5" /> Periféricos
              <span className="ml-1 text-[10px] opacity-60">({peripherals.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">
              {assets.length} {assets.length === 1 ? "ativo" : "ativos"} · {formatCurrency(totalAssets)}
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer select-none" onClick={() => aSort.toggle("patrimonio")}>
                    <span className="flex items-center">Patrimônio <SortIcon active={aSort.sortKey === "patrimonio"} dir={aSort.sortDir} /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => aSort.toggle("colaborador")}>
                    <span className="flex items-center">Colaborador <SortIcon active={aSort.sortKey === "colaborador"} dir={aSort.sortDir} /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => aSort.toggle("modelo")}>
                    <span className="flex items-center">Modelo <SortIcon active={aSort.sortKey === "modelo"} dir={aSort.sortDir} /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none text-right" onClick={() => aSort.toggle("valor")}>
                    <span className="flex items-center justify-end">Valor <SortIcon active={aSort.sortKey === "valor"} dir={aSort.sortDir} /></span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAssets.map((a) => (
                  <TableRow key={a.patrimonio}>
                    <TableCell className="font-medium">{a.patrimonio}</TableCell>
                    <TableCell className="truncate max-w-[150px]">{a.colaborador || "Disponível"}</TableCell>
                    <TableCell>{a.modelo || "—"}</TableCell>
                    <TableCell className="text-right">{formatCurrency(a.valor)}</TableCell>
                  </TableRow>
                ))}
                {sortedAssets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhum ativo encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="per" className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">
              {peripherals.length} {peripherals.length === 1 ? "periférico" : "periféricos"} · {formatCurrency(totalPeripherals)}
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer select-none" onClick={() => pSort.toggle("patrimonio")}>
                    <span className="flex items-center">Patrimônio <SortIcon active={pSort.sortKey === "patrimonio"} dir={pSort.sortDir} /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => pSort.toggle("colaborador")}>
                    <span className="flex items-center">Colaborador <SortIcon active={pSort.sortKey === "colaborador"} dir={pSort.sortDir} /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => pSort.toggle("modelo")}>
                    <span className="flex items-center">Modelo <SortIcon active={pSort.sortKey === "modelo"} dir={pSort.sortDir} /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none text-right" onClick={() => pSort.toggle("valor")}>
                    <span className="flex items-center justify-end">Valor <SortIcon active={pSort.sortKey === "valor"} dir={pSort.sortDir} /></span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPeripherals.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.patrimonio || "—"}</TableCell>
                    <TableCell className="truncate max-w-[150px]">{p.colaborador || "Disponível"}</TableCell>
                    <TableCell>{`${p.brand} ${p.model_name}`.trim() || "—"}</TableCell>
                    <TableCell className="text-right">{formatCurrency(p.unit_price || 0)}</TableCell>
                  </TableRow>
                ))}
                {sortedPeripherals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhum periférico encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
