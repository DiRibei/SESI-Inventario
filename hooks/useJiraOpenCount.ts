import { useEffect, useState } from "react";
import { type JiraDetailedTicket } from "@/lib/jira-utils";
import { isDemoActive } from "@/lib/demoMode";
import { demoStore } from "@/lib/demoData";

const EDGE_FN_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/get-jira-metrics`;
const OPEN_STATUSES = ["Open", "In Progress", "To Do", "Aberto", "Em andamento", "Em Aberto"];

type JiraData = {
  tickets: JiraDetailedTicket[];
  openTickets: JiraDetailedTicket[];
  count: number;
  jiraBaseUrl?: string;
  loading: boolean;
};

let cache: { tickets: JiraDetailedTicket[]; jiraBaseUrl?: string } | null = null;
let pending: Promise<void> | null = null;
const listeners = new Set<() => void>();

async function loadOnce() {
  if (cache || pending) return pending ?? Promise.resolve();
  pending = (async () => {
    try {
      if (isDemoActive()) {
        cache = { tickets: demoStore.jira, jiraBaseUrl: "https://demo.atlassian.net" };
      } else {
        const res = await fetch(EDGE_FN_URL, {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        cache = {
          tickets: Array.isArray(data.tickets) ? data.tickets : [],
          jiraBaseUrl: data.jiraBaseUrl,
        };
      }
    } catch (err) {
      console.error("useJiraOpenCount: falha ao carregar", err);
      cache = { tickets: [] };
    } finally {
      listeners.forEach((l) => l());
      pending = null;
    }
  })();
  return pending;
}

export function useJiraOpenCount(): JiraData {
  const [, setTick] = useState(0);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    const notify = () => {
      setTick((n) => n + 1);
      setLoading(false);
    };
    listeners.add(notify);
    if (!cache) {
      loadOnce();
    } else {
      setLoading(false);
    }
    return () => {
      listeners.delete(notify);
    };
  }, []);

  const tickets = cache?.tickets ?? [];
  const openTickets = tickets.filter((t) => OPEN_STATUSES.includes(t.status));
  return {
    tickets,
    openTickets,
    count: openTickets.length,
    jiraBaseUrl: cache?.jiraBaseUrl,
    loading,
  };
}
