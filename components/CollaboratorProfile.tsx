import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  User, Clock, Package, DollarSign, Ticket, Building2, MapPin,
  Laptop, Mouse, Keyboard, Headphones, Monitor, Webcam, Wrench, ExternalLink,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Asset,
  Colaborador,
  PeripheralForCollaborator,
  fetchPeripheralsByCollaborator,
  fetchJiraTicketsByCollaborator,
  getAssetsByCollaborator,
  getTotalValue,
} from "@/lib/api";
import type { JiraDetailedTicket } from "@/lib/jira-utils";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Props {
  name: string;
  assets: Asset[];
  colaboradores: Colaborador[];
  onOpenTimeline: () => void;
}

const JIRA_BASE_URL = "https://solvis.atlassian.net";

const BRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

function categoryIcon(cat: string) {
  const k = cat.toLowerCase();
  if (k.includes("mouse")) return Mouse;
  if (k.includes("teclado")) return Keyboard;
  if (k.includes("headset") || k.includes("fone")) return Headphones;
  if (k.includes("monitor")) return Monitor;
  if (k.includes("webcam") || k.includes("câmera")) return Webcam;
  if (k.includes("notebook") || k.includes("laptop")) return Laptop;
  return Package;
}

function statusAssetColor(s: string) {
  if (s === "Retirado") return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  if (s === "Disponível") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (s.toLowerCase().includes("manutenção") || s.toLowerCase().includes("quebrado"))
    return "bg-destructive/15 text-destructive border-destructive/30";
  return "bg-muted text-muted-foreground border-border";
}

function statusPeripheralColor(s: string) {
  if (s === "Em Uso") return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  if (s === "Disponível") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (s === "Defeito") return "bg-destructive/15 text-destructive border-destructive/30";
  return "bg-muted text-muted-foreground border-border";
}

function jiraStatusColor(s: string) {
  const k = s.toLowerCase();
  if (k.includes("done") || k.includes("resolv") || k.includes("conclu"))
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (k.includes("progress") || k.includes("andamento"))
    return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  if (k.includes("review")) return "bg-purple-500/15 text-purple-400 border-purple-500/30";
  if (k.includes("to do") || k.includes("open") || k.includes("aberto"))
    return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  return "bg-muted text-muted-foreground border-border";
}

function jiraPriorityColor(p: string) {
  const k = p.toLowerCase();
  if (k === "highest") return "bg-destructive/20 text-destructive border-destructive/40";
  if (k === "high") return "bg-orange-500/20 text-orange-400 border-orange-500/40";
  if (k === "medium") return "bg-amber-500/20 text-amber-400 border-amber-500/40";
  if (k === "low") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
  return "bg-muted text-muted-foreground border-border";
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function CollaboratorProfile({ name, assets, colaboradores, onOpenTimeline }: Props) {
  const [peripherals, setPeripherals] = useState<PeripheralForCollaborator[]>([]);
  const [tickets, setTickets] = useState<JiraDetailedTicket[]>([]);
  const [loadingPer, setLoadingPer] = useState(true);
  const [loadingJira, setLoadingJira] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedPeripheral, setSelectedPeripheral] = useState<PeripheralForCollaborator | null>(null);
  const [selectedJiraTicket, setSelectedJiraTicket] = useState<JiraDetailedTicket | null>(null);

  useEffect(() => {
    setLoadingPer(true);
    setLoadingJira(true);
    fetchPeripheralsByCollaborator(name).then((p) => {
      setPeripherals(p);
      setLoadingPer(false);
    });
    fetchJiraTicketsByCollaborator(name).then((t) => {
      setTickets(t);
      setLoadingJira(false);
    });
  }, [name]);

  const ownAssets = useMemo(() => getAssetsByCollaborator(assets, name), [assets, name]);
  const peripheralsValue = useMemo(
    () => peripherals.reduce((s, p) => s + (p.unit_price || 0), 0),
    [peripherals],
  );
  const totalValue = useMemo(
    () => getTotalValue(ownAssets) + peripheralsValue,
    [ownAssets, peripheralsValue],
  );

  const collab = colaboradores.find((c) => c.nome === name);
  const setor = collab?.departamento || "Sem departamento";

  // Unidade: pegar a unidade mais frequente entre os ativos vinculados
  const unidade = useMemo(() => {
    const map: Record<string, number> = {};
    ownAssets.forEach((a) => { map[a.unidade] = (map[a.unidade] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
  }, [ownAssets]);

  const equipamentos = ownAssets; // notebooks e demais ativos do estoque principal
  const activeTickets = tickets.filter((t) => {
    const k = (t.status || "").toLowerCase();
    return !(k.includes("done") || k.includes("resolv") || k.includes("conclu"));
  }).length;

  return (
    <motion.div
      key={name}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5"
    >
      {/* ── Cabeçalho VIP ── */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative z-10 flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow shrink-0">
            <User className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-foreground truncate tracking-tight">{name}</h2>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <Badge variant="outline" className="gap-1.5 bg-primary/10 text-primary border-primary/30">
                <Building2 className="w-3 h-3" /> {setor}
              </Badge>
              <Badge variant="outline" className="gap-1.5 bg-accent/10 text-foreground border-border">
                <MapPin className="w-3 h-3" /> {unidade}
              </Badge>
            </div>
          </div>
          <Button
            onClick={onOpenTimeline}
            variant="outline"
            size="sm"
            className="gap-2 shrink-0 backdrop-blur bg-background/40"
          >
            <Clock className="w-4 h-4" />
            Histórico
          </Button>
        </div>
      </div>

      {/* ── 3 Cards de atalho ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard
          icon={<DollarSign className="w-4 h-4" />}
          label="Total Investido"
          value={BRL(totalValue)}
        />
        <KpiCard
          icon={<Package className="w-4 h-4" />}
          label="Ativos / Periféricos"
          value={`${ownAssets.length} / ${peripherals.length}`}
        />
        <KpiCard
          icon={<Ticket className="w-4 h-4" />}
          label="Chamados Ativos"
          value={String(activeTickets)}
          highlight={activeTickets > 0}
        />
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="equip" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="equip" className="gap-1.5">
            <Laptop className="w-3.5 h-3.5" /> Equipamentos
            <span className="ml-1 text-[10px] opacity-60">({equipamentos.length})</span>
          </TabsTrigger>
          <TabsTrigger value="per" className="gap-1.5">
            <Mouse className="w-3.5 h-3.5" /> Periféricos
            <span className="ml-1 text-[10px] opacity-60">({peripherals.length})</span>
          </TabsTrigger>
          <TabsTrigger value="jira" className="gap-1.5">
            <Ticket className="w-3.5 h-3.5" /> Suporte Jira
            <span className="ml-1 text-[10px] opacity-60">({tickets.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Equipamentos */}
        <TabsContent value="equip" className="mt-4">
          <div className="bg-card rounded-xl shadow-card border overflow-hidden">
            {equipamentos.length === 0 ? (
              <EmptyRow text="Nenhum equipamento vinculado." />
            ) : (
              <div className="divide-y">
                {equipamentos.map((a) => {
                  const Icon = categoryIcon(a.categoria);
                  return (
                    <div
                      key={a.patrimonio}
                      onClick={() => setSelectedAsset(a)}
                      className="px-5 py-3 flex items-center gap-3 cursor-pointer transition-all hover:bg-muted/50 hover:scale-[1.01]"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {a.categoria} · {a.marca} {a.modelo}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          {a.patrimonio} · SN {a.serial || "—"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-sm font-semibold tabular-nums text-foreground">
                          {BRL(a.valor || 0)}
                        </span>
                        <Badge variant="outline" className={`text-[10px] ${statusAssetColor(a.status)}`}>
                          {a.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Periféricos */}
        <TabsContent value="per" className="mt-4">
          <div className="bg-card rounded-xl shadow-card border overflow-hidden">
            {loadingPer ? (
              <div className="py-8"><LoadingSpinner /></div>
            ) : peripherals.length === 0 ? (
              <EmptyRow text="Nenhum periférico vinculado." />
            ) : (
              <div className="divide-y">
                {peripherals.map((p) => {
                  const Icon = categoryIcon(p.category);
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPeripheral(p)}
                      className="px-5 py-3 flex items-center gap-3 cursor-pointer transition-all hover:bg-muted/50 hover:scale-[1.01]"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {p.category} · {p.brand} {p.model_name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          {p.patrimonio || "Sem patrimônio"} · SN {p.serial || "—"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-sm font-semibold tabular-nums text-foreground">
                          {BRL(p.unit_price || 0)}
                        </span>
                        <Badge variant="outline" className={`text-[10px] ${statusPeripheralColor(p.status)}`}>
                          {p.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Jira */}
        <TabsContent value="jira" className="mt-4">
          <div className="bg-card rounded-xl shadow-card border overflow-hidden">
            {loadingJira ? (
              <div className="py-8"><LoadingSpinner /></div>
            ) : tickets.length === 0 ? (
              <EmptyRow text="Nenhum chamado encontrado para esta pessoa." />
            ) : (
              <div className="divide-y">
                {tickets.slice(0, 10).map((t) => (
                  <div
                    key={t.key}
                    onClick={() => setSelectedJiraTicket(t)}
                    className="px-5 py-3 flex items-start gap-3 cursor-pointer transition-all hover:bg-muted/50 hover:scale-[1.01]"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">{t.summary}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[10px] font-mono text-muted-foreground">{t.key}</span>
                        <Badge variant="outline" className={`text-[10px] ${jiraStatusColor(t.status)}`}>
                          {t.status}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] ${jiraPriorityColor(t.priority)}`}>
                          {t.priority}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(t.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Modal: Equipamento ── */}
      <Dialog open={!!selectedAsset} onOpenChange={(o) => !o && setSelectedAsset(null)}>
        <DialogContent className="max-w-2xl">
          {selectedAsset && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-primary" />
                  {selectedAsset.categoria} · {selectedAsset.marca} {selectedAsset.modelo}
                </DialogTitle>
                <DialogDescription className="font-mono text-xs">
                  Patrimônio {selectedAsset.patrimonio}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <DetailField label="Patrimônio" value={selectedAsset.patrimonio} mono />
                <DetailField label="Número de Série" value={selectedAsset.serial || "—"} mono />
                <DetailField label="Marca / Modelo" value={`${selectedAsset.marca} ${selectedAsset.modelo}`} />
                <DetailField label="Categoria" value={selectedAsset.categoria} />
                <DetailField
                  label="Status"
                  value={
                    <Badge variant="outline" className={statusAssetColor(selectedAsset.status)}>
                      {selectedAsset.status}
                    </Badge>
                  }
                />
                <DetailField label="Unidade" value={selectedAsset.unidade} />
                <DetailField label="Valor" value={BRL(selectedAsset.valor || 0)} />
                <DetailField label="Última Atualização" value={formatDate(selectedAsset.atualizadoEm)} />
                <div className="sm:col-span-2">
                  <DetailField label="Observações" value={selectedAsset.observacoes || "—"} />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Modal: Periférico ── */}
      <Dialog open={!!selectedPeripheral} onOpenChange={(o) => !o && setSelectedPeripheral(null)}>
        <DialogContent className="max-w-xl">
          {selectedPeripheral && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mouse className="w-5 h-5 text-primary" />
                  {selectedPeripheral.category} · {selectedPeripheral.brand} {selectedPeripheral.model_name}
                </DialogTitle>
                <DialogDescription className="font-mono text-xs">
                  {selectedPeripheral.patrimonio || "Sem patrimônio"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <DetailField label="Tipo" value={selectedPeripheral.category} />
                <DetailField label="Marca" value={selectedPeripheral.brand} />
                <DetailField label="Modelo" value={selectedPeripheral.model_name} />
                <DetailField label="Número de Série" value={selectedPeripheral.serial || "—"} mono />
                <DetailField
                  label="Status"
                  value={
                    <Badge variant="outline" className={statusPeripheralColor(selectedPeripheral.status)}>
                      {selectedPeripheral.status}
                    </Badge>
                  }
                />
                <DetailField label="Valor" value={BRL(selectedPeripheral.unit_price || 0)} />
                <div className="sm:col-span-2">
                  <DetailField label="Atribuído a" value={name} />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Modal: Chamado Jira ── */}
      <Dialog open={!!selectedJiraTicket} onOpenChange={(o) => !o && setSelectedJiraTicket(null)}>
        <DialogContent className="max-w-2xl">
          {selectedJiraTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-base px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/30">
                    {selectedJiraTicket.key}
                  </span>
                  <span className="text-base font-semibold">{selectedJiraTicket.summary}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <DetailField
                  label="Status"
                  value={
                    <Badge variant="outline" className={jiraStatusColor(selectedJiraTicket.status)}>
                      {selectedJiraTicket.status}
                    </Badge>
                  }
                />
                <DetailField
                  label="Prioridade"
                  value={
                    <Badge variant="outline" className={jiraPriorityColor(selectedJiraTicket.priority)}>
                      {selectedJiraTicket.priority}
                    </Badge>
                  }
                />
                <DetailField label="Aberto em" value={formatDate(selectedJiraTicket.createdAt)} />
                <DetailField
                  label="Resolvido em"
                  value={selectedJiraTicket.resolvedAt ? formatDate(selectedJiraTicket.resolvedAt) : "—"}
                />
                <div className="sm:col-span-2">
                  <DetailField
                    label="Descrição"
                    value={
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {selectedJiraTicket.description?.trim() || "Sem descrição."}
                      </p>
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button asChild variant="outline" className="gap-2">
                  <a
                    href={`${JIRA_BASE_URL}/browse/${selectedJiraTicket.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir no Jira
                  </a>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function KpiCard({
  icon, label, value, highlight,
}: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 bg-card shadow-card transition-all ${highlight ? "ring-1 ring-primary/40" : ""}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          {label}
        </span>
      </div>
      <p className="text-lg font-bold tracking-tight">{value}</p>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <p className="text-sm text-muted-foreground text-center py-8">{text}</p>
  );
}

function DetailField({
  label, value, mono,
}: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </p>
      <div className={`text-sm text-foreground break-words ${mono ? "font-mono" : ""}`}>
        {value}
      </div>
    </div>
  );
}
