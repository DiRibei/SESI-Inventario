import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Asset, fetchPaginatedAssets, fetchAssets, deleteAsset, naturalSort, checkinAsset, isStale, SortColumn, SortDirection } from "@/lib/api";
import { Search, Edit2, Copy, Filter, Building2, Factory, Laptop, Plus, Trash2, Package, Wrench, MessageSquare, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AssetEditModal } from "@/components/AssetEditModal";
import { BulkActionsBar } from "@/components/BulkActionsBar";
import { SelectionReviewModal, type SelectedAssetInfo } from "@/components/SelectionReviewModal";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { toast } from "sonner";
import { UnidadeFilter, type UnidadeFilterValue } from "@/components/UnidadeFilter";
import { ExcelExportButton } from "@/components/ExcelExportButton";
import { exportNotebooks } from "@/lib/excelExport";

const PAGE_SIZE = 50;

const statusStyles: Record<string, string> = {
  "Disponível": "bg-success/15 text-success border border-success/30",
  "Retirado": "bg-primary/15 text-primary border border-primary/30",
  "Em uso": "bg-secondary/15 text-secondary border border-secondary/30",
  "Manutenção": "bg-warning/15 text-warning border border-warning/30",
  "Vendido": "bg-muted text-muted-foreground border border-border",
  "Desconhecido": "bg-warning/10 text-warning border border-warning/20",
  "Em Manutenção / Quebrado": "bg-warning/15 text-warning border border-warning/30",
  "Em Triagem / Aguardando Teste": "bg-violet-500/15 text-violet-600 border border-violet-500/30",
};

const STATUS_FILTERS = ["Todos", "Disponível", "Retirado", "Vendido", "Desconhecido", "Em Manutenção / Quebrado", "Em Triagem / Aguardando Teste"];

export default function Inventario() {
  const { role } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [unidadeFilter, setUnidadeFilter] = useState<UnidadeFilterValue>("Todos");
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn>("patrimonio");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [duplicatingAsset, setDuplicatingAsset] = useState<Asset | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState<Map<string, SelectedAssetInfo>>(new Map());
  const [reviewOpen, setReviewOpen] = useState(false);
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, unidadeFilter]);

  // Fetch paginated data
  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await fetchPaginatedAssets({
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch,
      statusFilter,
      unidadeFilter,
      sortColumn,
      sortDirection,
    });
    setAssets(result.data);
    setTotalCount(result.total);
    setLoading(false);
  }, [page, debouncedSearch, statusFilter, unidadeFilter, sortColumn, sortDirection]);

  const toggleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ col }: { col: SortColumn }) => {
    if (sortColumn !== col) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Deeplink: ?patrimonio=XXX abre o modal de edição automaticamente.
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const target = searchParams.get("patrimonio");
    if (!target) return;
    let cancelled = false;
    (async () => {
      // Tenta achar nos ativos já carregados; senão busca tudo.
      let asset = assets.find((a) => a.patrimonio === target);
      if (!asset) {
        const all = await fetchAssets();
        asset = all.find((a) => a.patrimonio === target);
      }
      if (!cancelled && asset) {
        setEditingAsset(asset);
        // Limpa o param para não reabrir ao fechar
        const next = new URLSearchParams(searchParams);
        next.delete("patrimonio");
        setSearchParams(next, { replace: true });
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const rangeStart = (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, totalCount);

  const handleSaved = (updated: Partial<Asset> & { patrimonio: string }) => {
    setAssets((prev) =>
      prev.map((a) => (a.patrimonio === updated.patrimonio ? { ...a, ...updated } : a))
    );
  };

  const handleCreated = () => {
    loadData();
  };

  const handleDelete = async () => {
    if (!deletingAsset) return;
    setDeleting(true);
    const ok = await deleteAsset(deletingAsset.patrimonio);
    if (ok) {
      toast.success("Ativo excluído com sucesso!");
      loadData();
    } else {
      toast.error("Erro ao excluir ativo.");
    }
    setDeleting(false);
    setDeletingAsset(null);
  };

  const toggleSelect = (asset: Asset) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(asset.patrimonio)) {
        next.delete(asset.patrimonio);
      } else {
        next.set(asset.patrimonio, {
          patrimonio: asset.patrimonio,
          modelo: `${asset.marca} ${asset.modelo}`.trim(),
          colaborador: asset.colaborador,
        });
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === assets.length) {
      setSelected(new Map());
    } else {
      setSelected((prev) => {
        const next = new Map(prev);
        assets.forEach((a) =>
          next.set(a.patrimonio, {
            patrimonio: a.patrimonio,
            modelo: `${a.marca} ${a.modelo}`.trim(),
            colaborador: a.colaborador,
          })
        );
        return next;
      });
    }
  };

  const handleBulkUpdated = () => {
    setSelected(new Map());
    loadData();
  };

  const removeFromSelection = (patrimonio: string) => {
    setSelected((prev) => {
      const next = new Map(prev);
      next.delete(patrimonio);
      return next;
    });
  };

  const renderColaborador = (colaborador: string) => {
    const nome = (colaborador || "").trim();
    if (!nome || nome.toLowerCase() === "solvis") {
      return <Badge className="bg-success/15 text-success border border-success/30 font-medium">EM ESTOQUE</Badge>;
    }
    return <span>{nome}</span>;
  };

  // Generate page numbers to show
  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("ellipsis");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  if (loading && assets.length === 0) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notebooks</h1>
            <p className="text-sm text-muted-foreground mt-1">{totalCount} ativos encontrados</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <ExcelExportButton onExport={async () => {
              const all = await fetchPaginatedAssets({
                page: 1,
                pageSize: 100000,
                search: debouncedSearch,
                statusFilter,
                unidadeFilter,
                sortColumn,
                sortDirection,
              });
              await exportNotebooks(all.data);
            }} />
            {role === "admin" && (
              <Button onClick={() => setCreatingNew(true)} size="sm" className="gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-1" /> Novo Ativo
              </Button>
            )}
            <UnidadeFilter value={unidadeFilter} onChange={setUnidadeFilter} />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pesquisar por modelo, marca ou serial..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
          </div>
        </div>

        {role === "admin" && (
          <BulkActionsBar
            selectedCount={selected.size}
            selectedPatrimonios={[...selected.keys()]}
            onClear={() => setSelected(new Map())}
            onUpdated={handleBulkUpdated}
            onReview={() => setReviewOpen(true)}
          />
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card rounded-xl shadow-card border overflow-hidden flex flex-col"
          style={{ maxHeight: "calc(100vh - 220px)" }}
        >
          <div className="overflow-auto flex-1">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm">
                <tr className="border-b">
                  {role === "admin" && (
                    <th className="px-3 py-3 w-10">
                      <Checkbox
                        checked={assets.length > 0 && selected.size === assets.length}
                        onCheckedChange={toggleAll}
                      />
                    </th>
                  )}
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort("patrimonio")}>
                    <span className="inline-flex items-center gap-1">Patrimônio <SortIcon col="patrimonio" /></span>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort("categoria")}>
                    <span className="inline-flex items-center gap-1">Categoria <SortIcon col="categoria" /></span>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort("marca")}>
                    <span className="inline-flex items-center gap-1">Marca/Modelo <SortIcon col="marca" /></span>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                    <span className="inline-flex items-center gap-1">Serial</span>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort("colaborador")}>
                    <span className="inline-flex items-center gap-1">Colaborador <SortIcon col="colaborador" /></span>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort("status")}>
                    <span className="inline-flex items-center gap-1">Status <SortIcon col="status" /></span>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort("unidade")}>
                    <span className="inline-flex items-center gap-1">Unidade <SortIcon col="unidade" /></span>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden xl:table-cell cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort("valor")}>
                    <span className="inline-flex items-center gap-1">Valor <SortIcon col="valor" /></span>
                  </th>
                  {role === "admin" && <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-32">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => {
                  const stale = isStale(asset.atualizadoEm);
                  return (
                  <tr
                    key={asset.patrimonio}
                    className={`border-b last:border-0 transition-colors ${asset.status === "Vendido" ? "opacity-50" : ""} ${asset.status === "Em Manutenção / Quebrado" ? "bg-warning/5" : ""} ${stale ? "ring-1 ring-inset ring-warning/40" : ""} ${selected.has(asset.patrimonio) ? "bg-primary/5" : "hover:bg-muted/30"}`}
                  >
                    {role === "admin" && (
                      <td className="px-3 py-3">
                        <Checkbox
                          checked={selected.has(asset.patrimonio)}
                          onCheckedChange={() => toggleSelect(asset)}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 font-mono text-xs font-medium text-primary">
                      <span className="inline-flex items-center gap-1">
                        {stale && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Sem atualização há mais de 18 meses</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {asset.patrimonio}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {asset.categoria === "Notebook" ? (
                        <Badge className="bg-navy text-navy-foreground hover:bg-navy/90">Notebook</Badge>
                      ) : (
                        <span className="text-xs bg-muted px-2 py-1 rounded-md">{asset.categoria}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{asset.marca} {asset.modelo}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground hidden lg:table-cell">{asset.serial || "—"}</td>
                    <td className="px-4 py-3">{renderColaborador(asset.colaborador)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[asset.status] || "bg-muted text-muted-foreground"}`}>
                        {asset.status === "Em Manutenção / Quebrado" && <Wrench className="w-3 h-3" />}
                        {asset.status === "Em Triagem / Aguardando Teste" && <span>🔍</span>}
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <Badge variant="outline" className="gap-1 text-xs font-normal w-fit">
                        {asset.unidade === "Fábrica" ? (
                          <Factory className="w-3 h-3" />
                        ) : asset.unidade === "Notebooks" ? (
                          <Laptop className="w-3 h-3" />
                        ) : (
                          <Building2 className="w-3 h-3" />
                        )}
                        {asset.unidade}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell font-mono text-xs">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(asset.valor)}
                    </td>
                    {role === "admin" && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {asset.observacoes && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="p-1.5 rounded-lg hover:bg-accent text-warning transition-colors">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-[250px]">
                                <p className="text-xs whitespace-pre-wrap">{asset.observacoes}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={async () => {
                                  const ok = await checkinAsset(asset.patrimonio);
                                  if (ok) {
                                    const now = new Date().toISOString();
                                    setAssets((prev) => prev.map((a) => a.patrimonio === asset.patrimonio ? { ...a, atualizadoEm: now } : a));
                                    toast.success(`Check-in de "${asset.patrimonio}" realizado!`);
                                  } else {
                                    toast.error("Erro ao fazer check-in.");
                                  }
                                }}
                                className="p-1.5 rounded-lg hover:bg-success/10 text-success transition-colors"
                                title="Confirmar Status"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Confirmar auditoria (zerar cronômetro)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <button
                          onClick={() => setEditingAsset(asset)}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDuplicatingAsset(asset)}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                          title="Duplicar"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingAsset(asset)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    )}
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {assets.length === 0 && !loading && (
            <div className="text-center py-12 text-muted-foreground text-sm">Nenhum ativo encontrado</div>
          )}
        </motion.div>

        {/* Pagination - always visible below table */}
        {totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-card rounded-xl border shadow-card">
            <p className="text-xs text-muted-foreground">
              Exibindo <span className="font-medium text-foreground">{rangeStart}-{rangeEnd}</span> de{" "}
              <span className="font-medium text-foreground">{totalCount}</span> ativos
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Anterior
              </Button>
              {getPageNumbers().map((p, idx) =>
                p === "ellipsis" ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground text-xs">…</span>
                ) : (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(p)}
                    disabled={loading}
                    className="w-8 h-8 p-0 text-xs"
                  >
                    {p}
                  </Button>
                )
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="gap-1 text-xs"
              >
                Próximo
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <AssetEditModal
        asset={editingAsset}
        open={!!editingAsset}
        onClose={() => setEditingAsset(null)}
        onSaved={handleSaved}
      />

      <AssetEditModal
        asset={duplicatingAsset}
        open={!!duplicatingAsset}
        onClose={() => setDuplicatingAsset(null)}
        onSaved={handleCreated}
        isDuplicate
      />

      <AssetEditModal
        asset={null}
        open={creatingNew}
        onClose={() => setCreatingNew(false)}
        onSaved={handleCreated}
        isNew
      />

      {/* Delete confirmation modal */}
      <Dialog open={!!deletingAsset} onOpenChange={(v) => !v && setDeletingAsset(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o ativo <strong>{deletingAsset?.patrimonio}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingAsset(null)} disabled={deleting}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SelectionReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        items={[...selected.values()]}
        onRemove={removeFromSelection}
      />
    </DashboardLayout>
  );
}
