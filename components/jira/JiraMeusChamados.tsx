import { useState, useMemo, useEffect } from "react";
import { type JiraDetailedTicket } from "@/lib/jira-utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Search, X } from "lucide-react";

const STORAGE_KEY = "solvis_jira_email";

interface KanbanColumn {
  id: string;
  label: string;
  color: string;
  bgCard: string;
  statuses: string[];
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: "aberto",
    label: "Aberto",
    color: "bg-amber-500",
    bgCard: "border-l-amber-500",
    statuses: ["open", "aberto", "to do", "a fazer", "novo", "new", "backlog"],
  },
  {
    id: "em_progresso",
    label: "Em Progresso",
    color: "bg-blue-500",
    bgCard: "border-l-blue-500",
    statuses: ["in progress", "em andamento", "em progresso", "doing"],
  },
  {
    id: "revisao",
    label: "Revisão / Aprovação",
    color: "bg-purple-500",
    bgCard: "border-l-purple-500",
    statuses: ["review", "revisão", "aprovação", "approval", "waiting", "aguardando", "pending", "em revisão"],
  },
  {
    id: "concluido",
    label: "Concluído",
    color: "bg-green-500",
    bgCard: "border-l-green-500",
    statuses: ["done", "concluído", "concluido", "closed", "fechado", "resolved", "resolvido"],
  },
];

function classifyTicket(status: string): string {
  const s = status.toLowerCase().trim();
  for (const col of KANBAN_COLUMNS) {
    if (col.statuses.includes(s)) return col.id;
  }
  return "aberto"; // default
}

interface Props {
  tickets: JiraDetailedTicket[];
  loading: boolean;
}

export function JiraMeusChamados({ tickets, loading }: Props) {
  const [savedEmail, setSavedEmail] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [inputEmail, setInputEmail] = useState(savedEmail);
  const [isIdentified, setIsIdentified] = useState(!!savedEmail);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSavedEmail(stored);
      setInputEmail(stored);
      setIsIdentified(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = inputEmail.trim().toLowerCase();
    if (!email) return;
    localStorage.setItem(STORAGE_KEY, email);
    setSavedEmail(email);
    setIsIdentified(true);
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSavedEmail("");
    setInputEmail("");
    setIsIdentified(false);
  };

  const myTickets = useMemo(() => {
    if (!savedEmail) return [];
    const email = savedEmail.trim().toLowerCase();
    return tickets.filter((t) => {
      const solicitante = (t.solicitanteEmail || "").trim().toLowerCase();
      return solicitante === email;
    });
  }, [tickets, savedEmail]);

  const columnData = useMemo(() => {
    const grouped: Record<string, JiraDetailedTicket[]> = {};
    for (const col of KANBAN_COLUMNS) grouped[col.id] = [];
    for (const t of myTickets) {
      const colId = classifyTicket(t.status);
      grouped[colId].push(t);
    }
    return grouped;
  }, [myTickets]);

  if (!isIdentified) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="bg-primary/10 rounded-full p-4">
          <Mail className="w-10 h-10 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Identifique-se</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Digite seu e-mail corporativo para visualizar seus chamados.
            Seu e-mail será salvo localmente para acesso rápido.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-sm">
          <Input
            type="email"
            placeholder="seu.nome@solvis.com.br"
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
            className="flex-1"
            required
          />
          <Button type="submit" size="sm">
            <Search className="w-4 h-4 mr-1" /> Buscar
          </Button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Email banner */}
      <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2 border border-border">
        <span className="text-sm text-muted-foreground flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Filtrando por: <strong className="text-foreground">{savedEmail}</strong>
        </span>
        <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4 mr-1" /> Trocar
        </Button>
      </div>

      {myTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Search className="w-12 h-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium text-foreground">Nenhum chamado encontrado</h3>
          <p className="text-sm text-muted-foreground">
            Não há chamados vinculados ao e-mail <strong>{savedEmail}</strong>.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {myTickets.length} chamado{myTickets.length !== 1 ? "s" : ""} encontrado{myTickets.length !== 1 ? "s" : ""}
          </p>

          {/* Kanban Board */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {KANBAN_COLUMNS.map((col) => {
              const items = columnData[col.id];
              return (
                <div key={col.id} className="flex flex-col rounded-lg border border-border bg-muted/30 overflow-hidden">
                  {/* Column header */}
                  <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                      {col.label}
                    </span>
                    <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                      {items.length}
                    </Badge>
                  </div>

                  {/* Cards */}
                  <div className="flex flex-col gap-2 p-2 min-h-[120px]">
                    {items.length === 0 && (
                      <p className="text-[11px] text-muted-foreground text-center py-6">—</p>
                    )}
                    {items.map((t) => (
                      <div
                        key={t.key}
                        className={`bg-card rounded-md border border-border border-l-[3px] ${col.bgCard} p-3 space-y-1.5 shadow-sm`}
                      >
                        <span className="font-mono text-[11px] text-muted-foreground">{t.key}</span>
                        <h4 className="text-xs font-medium text-foreground leading-snug line-clamp-2">
                          {t.summary}
                        </h4>
                        {t.createdAt && (
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
