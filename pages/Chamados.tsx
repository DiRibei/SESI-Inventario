import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LifeBuoy, Loader2 } from "lucide-react";
import { ChamadoForm } from "@/components/chamados/ChamadoForm";
import { JiraMeusChamados } from "@/components/jira/JiraMeusChamados";
import { type JiraDetailedTicket } from "@/lib/jira-utils";
import { toast } from "sonner";
import { isDemoActive } from "@/lib/demoMode";
import { demoStore } from "@/lib/demoData";

const EDGE_FN_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/get-jira-metrics`;

export default function Chamados() {
  const location = useLocation();
  const initialTab = (location.state as { tab?: string } | null)?.tab;
  const [tab, setTab] = useState(initialTab === "meus" ? "meus" : "novo");
  const [tickets, setTickets] = useState<JiraDetailedTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJira() {
      if (isDemoActive()) {
        setTickets(demoStore.jira);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(EDGE_FN_URL, {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.tickets && Array.isArray(data.tickets)) setTickets(data.tickets);
      } catch (err) {
        console.error("Falha ao buscar dados do Jira:", err);
        toast.error("Não foi possível carregar seus chamados.");
      } finally {
        setLoading(false);
      }
    }
    fetchJira();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <LifeBuoy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Chamados</h1>
            <p className="text-sm text-muted-foreground">Abra um novo chamado de TI ou acompanhe os seus.</p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="novo">Abrir chamado</TabsTrigger>
            <TabsTrigger value="meus">Meus chamados</TabsTrigger>
          </TabsList>

          <TabsContent value="novo" className="mt-4">
            <ChamadoForm onSent={() => setTab("meus")} />
          </TabsContent>

          <TabsContent value="meus" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" /> Carregando chamados...
              </div>
            ) : (
              <JiraMeusChamados tickets={tickets} loading={false} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
