import { useState, useEffect } from "react";
import { JiraMeusChamados } from "@/components/jira/JiraMeusChamados";
import { type JiraDetailedTicket } from "@/lib/jira-utils";
import { Server, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const EDGE_FN_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/get-jira-metrics`;
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdvK4I67tKIP0RLnxaR0I6pn8-YrDCT9O0MYJUzlkaFjSzYoQ/viewform?usp=dialog";

export default function ConsultaChamados() {
  const [tickets, setTickets] = useState<JiraDetailedTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJira() {
      try {
        const res = await fetch(EDGE_FN_URL, {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.tickets && Array.isArray(data.tickets)) {
          setTickets(data.tickets);
        }
      } catch (err) {
        console.error("Falha ao buscar dados do Jira:", err);
        toast.error("Não foi possível carregar os chamados.");
      } finally {
        setLoading(false);
      }
    }
    fetchJira();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
            <Server className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Suporte Solvis TI</h1>
          <p className="text-sm text-muted-foreground">Consulte o status dos seus chamados ou abra um novo.</p>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Button asChild size="lg" className="gap-2">
            <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              Abrir Novo Chamado
            </a>
          </Button>
        </div>

        {/* Ticket lookup */}
        <div className="bg-card rounded-xl border border-border p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              Carregando chamados...
            </div>
          ) : (
            <JiraMeusChamados tickets={tickets} loading={false} />
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Solvis TI — Gestão de Ativos v2.0
        </p>
      </div>
    </div>
  );
}
