import { type JiraDetailedTicket, getAverageLeadTime } from "@/lib/jira-utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ChevronRight, AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_COLORS: Record<string, string> = {
  Done: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "Em andamento": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Concluído: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Open: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  Aberto: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  "To Do": "bg-muted text-muted-foreground",
};

const PRIORITY_COLORS: Record<string, string> = {
  Highest: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  High: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  Low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Lowest: "bg-muted text-muted-foreground",
};

const OPEN_STATUSES = new Set(["Open", "Aberto", "To Do", "In Progress", "Em andamento"]);
const STALE_THRESHOLD_HOURS = 7 * 24;

function getDurationHours(createdAt: string, resolvedAt: string | null): number | null {
  if (!createdAt) return null;
  const start = new Date(createdAt);
  if (isNaN(start.getTime())) return null;
  const end = resolvedAt ? new Date(resolvedAt) : new Date();
  if (isNaN(end.getTime())) return null;
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

function formatDuration(hours: number | null, isOpen: boolean): string {
  if (hours === null) return "—";
  if (hours < 0) return "—";
  const totalMinutes = Math.round(hours * 60);
  if (totalMinutes < 1) return "< 1min";
  const days = Math.floor(totalMinutes / (60 * 24));
  const remainingHours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const mins = totalMinutes % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (remainingHours > 0) parts.push(`${remainingHours}h`);
  if (days === 0 && mins > 0) parts.push(`${mins}min`);
  const label = parts.join(" ");
  return isOpen ? `${label} ⏳` : label;
}

function parseJiraDescription(description?: string) {
  const result = { solicitante: "", email: "", setor: "", tipo: "" };
  if (!description) return result;
  const solMatch = description.match(/Solicitante\s*:\s*(.*?)(?=\s{2,}|\n|E-?mail|$)/i);
  if (solMatch?.[1]) result.solicitante = solMatch[1].trim();
  const emailMatch = description.match(/E-?mail(?:\s+do\s+Solicitante)?\s*:\s*(\S+@\S+)/i);
  if (emailMatch?.[1]) result.email = emailMatch[1].trim();
  const setorMatch = description.match(/Setor\s*:\s*(.*?)(?=\s{2,}|\n|Tipo|Urg|$)/i);
  if (setorMatch?.[1]) result.setor = setorMatch[1].trim();
  const tipoMatch = description.match(/Tipo\s+(?:principal|de\s+Requisi[çc][ãa]o)\s*:\s*(.*?)(?=\s{2,}|\n|Urg|$)/i);
  if (tipoMatch?.[1]) result.tipo = tipoMatch[1].trim();
  return result;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  tickets: JiraDetailedTicket[];
  jiraBaseUrl?: string;
  isAdmin?: boolean;
}

const COL_COUNT = 7;

export function JiraDetailModal({ open, onOpenChange, title, tickets, jiraBaseUrl, isAdmin = false }: Props) {
  const avgHours = useMemo(() => getAverageLeadTime(tickets), [tickets]);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{tickets.length} chamado(s)</p>
        </DialogHeader>
        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[32px]" />
                <TableHead className="w-[100px]">Ticket</TableHead>
                <TableHead>Resumo</TableHead>
                <TableHead className="w-[150px]">Colaborador</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[120px]">Duração</TableHead>
                <TableHead className="w-[100px]">Prioridade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((t) => {
                const isOpenTicket = t.resolvedAt === null;
                const durationH = getDurationHours(t.createdAt, t.resolvedAt);
                const aboveAvg = durationH !== null && avgHours > 0 && durationH > avgHours;
                const isStale = isOpenTicket && OPEN_STATUSES.has(t.status) && durationH !== null && durationH > STALE_THRESHOLD_HOURS;
                const expanded = expandedKeys.has(t.key);

                const parsed = parseJiraDescription(t.description);
                const setor = t.setor || parsed.setor;
                const solicitante = t.solicitanteEmail || parsed.email || parsed.solicitante;
                const tipo = t.tipoRequisicao || parsed.tipo;

                return (
                  <>
                    <TableRow
                      key={t.key}
                      className={`cursor-pointer transition-colors duration-200 ${
                        expanded
                          ? "bg-primary/5 dark:bg-primary/10"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => toggleExpand(t.key)}
                    >
                      <TableCell className="px-2">
                        <motion.div
                          animate={{ rotate: expanded ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </motion.div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {isAdmin && jiraBaseUrl ? (
                          <a
                            href={`${jiraBaseUrl}/browse/${t.key}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {t.key}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-foreground cursor-default">{t.key}</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-sm">{t.summary}</TableCell>
                      <TableCell className="text-sm">{t.assignee}</TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[t.status] ?? "bg-muted text-muted-foreground"} variant="outline">
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm tabular-nums inline-flex items-center gap-1.5 ${aboveAvg ? "font-bold text-destructive" : ""}`}>
                          {isStale && (
                            <AlertTriangle className="w-3.5 h-3.5 text-destructive animate-pulse" />
                          )}
                          {formatDuration(durationH, isOpenTicket)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={PRIORITY_COLORS[t.priority] ?? "bg-muted text-muted-foreground"} variant="outline">
                          {t.priority}
                        </Badge>
                      </TableCell>
                    </TableRow>

                    <AnimatePresence>
                      {expanded && (
                        <tr key={`${t.key}-details`}>
                          <td colSpan={COL_COUNT} className="p-0 border-b">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="py-4 px-6 bg-muted/20 dark:bg-muted/10 border-l-4 border-primary/30">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <DetailField label="Setor" value={setor} />
                                  <DetailField label="Solicitante" value={solicitante} />
                                  <DetailField label="Tipo de Requisição" value={tipo} />
                                </div>
                                <div className="mt-3">
                                  <span className="font-medium text-muted-foreground text-sm">Descrição:</span>
                                  <p className="mt-1 text-sm whitespace-pre-wrap leading-relaxed max-h-32 overflow-auto">
                                    {t.description || "Não informado"}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </>
                );
              })}
              {tickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={COL_COUNT} className="text-center text-muted-foreground py-8">
                    Nenhum chamado encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <span className="font-medium text-muted-foreground">{label}:</span>{" "}
      <span className={value ? "" : "italic text-muted-foreground/60"}>
        {value || "Não informado"}
      </span>
    </div>
  );
}
