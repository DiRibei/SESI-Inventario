import { useState, useMemo } from "react";
import { type JiraDetailedTicket } from "@/lib/jira-utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Download, Search } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  Done: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "Em andamento": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
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

interface Props {
  tickets: JiraDetailedTicket[];
  jiraBaseUrl?: string;
  limit?: number;
  isAdmin?: boolean;
}

function escapeCsvCell(value: string): string {
  const val = String(value ?? "");
  if (/[",\n\r]/.test(val)) {
    return `"${val.replace(/"/g, "\"\"")}"`;
  }
  return val;
}

function exportTicketsToCsv(tickets: JiraDetailedTicket[]) {
  const headers = ["Ticket", "Título", "Status", "Responsável", "Prioridade"];
  const rows = tickets.map((t) => [
    t.key,
    t.summary,
    t.status,
    t.assignee,
    t.priority,
  ]);

  const csvContent =
    "\ufeff" +
    headers.map(escapeCsvCell).join(",") +
    "\n" +
    rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const date = new Date().toISOString().slice(0, 10);
  link.download = `relatorio-chamados-${date}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function JiraTicketTable({ tickets, jiraBaseUrl, limit = 15, isAdmin = false }: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return tickets;
    const q = searchQuery.toLowerCase();
    return tickets.filter((t) =>
      t.summary.toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q) ||
      t.key.toLowerCase().includes(q)
    );
  }, [tickets, searchQuery]);

  const displayed = filtered.slice(0, limit);

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground">
          Lista de Chamados Recentes
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => exportTicketsToCsv(displayed)}
        >
          <Download className="w-3.5 h-3.5" />
          Exportar Relatório
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por título, descrição ou ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="overflow-auto max-h-[420px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Ticket</TableHead>
              <TableHead>Título</TableHead>
              <TableHead className="w-[130px]">Status</TableHead>
              <TableHead className="w-[150px]">Responsável</TableHead>
              <TableHead className="w-[100px]">Prioridade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayed.map((t) => (
              <TableRow key={t.key}>
                <TableCell className="font-mono text-xs">
                  {isAdmin && jiraBaseUrl ? (
                    <a
                      href={`${jiraBaseUrl}/browse/${t.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {t.key}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-foreground cursor-default">{t.key}</span>
                  )}
                </TableCell>
                <TableCell className="max-w-[300px] truncate text-sm">
                  {t.summary}
                </TableCell>
                <TableCell>
                  <Badge
                    className={STATUS_COLORS[t.status] ?? "bg-muted text-muted-foreground"}
                    variant="outline"
                  >
                    {t.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{t.assignee}</TableCell>
                <TableCell>
                  <Badge
                    className={PRIORITY_COLORS[t.priority] ?? "bg-muted text-muted-foreground"}
                    variant="outline"
                  >
                    {t.priority}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
