import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { fetchColaboradores } from "@/lib/api";
import { supabase } from "@/lib/supabase";

const DEPT_TO_SETOR: Record<string, string> = {
  "Analytics": "ANALYTICS",
  "CX": "C.X.",
  "Desenvolvimento": "DEVELOPER",
  "Diretoria": "DIRETORIA",
  "Financeiro": "FINANCEIRO",
  "Marketing": "MARKETING",
  "Operações": "OPERAÇÕES",
  "RH": "R.H.",
  "Vendas": "VENDAS",
};

const SETORES = ["ANALYTICS", "C.X.", "DIRETORIA", "DEVELOPER", "FINANCEIRO", "MARKETING", "OPERAÇÕES", "R.H.", "VENDAS"];
const TIPOS = ["INCIDENTE", "REQUISIÇÃO", "ACESSO OU REVOGAÇÃO"] as const;
const HARDWARE = ["Headset", "Mouse", "Teclado", "Monitor", "Suporte de notebook", "Impressora", "Webcam", "CFTV (câmera de segurança)", "Carregador de notebook", "Outros"];
const SOFTWARE = ["Notebook travando", "Notebook não está ligando", "Notebook sem som/vídeo", "Notebook sem internet", "Configuração de impressora", "Tela azul", "Atualizações de sistema", "Configuração de assinatura", "Wallpaper da tela inicial", "Problema com meu ramal", "Erros em aplicativos (qual)", "Outros incidentes"];
const AUTORIZADORES = ["ederson@solvis.com.br", "eduardo@solvis.com.br", "emannuelle.ferreira@solvis.com.br", "evandro@solvis.com.br", "fernanda.campanelli@solvis.com.br", "edson.veloso@solvis.com.br", "leonardo@solvis.com.br", "nairon.stimer@solvis.com.br", "priscila.saito@solvis.com.br", "Eu mesmo (a)."];
const APLICATIVOS = ["Authentik", "Survey System", "Movidesk", "Pacote Office", "Google Workspace", "n8n (Workflow)", "Site24/7", "Simples Clique", "Jira", "GitHub", "Bitwarden", "GPT da Solvis", "Outros aplicativos"];
const URGENCIAS = ["BAIXA", "MÉDIA", "ALTA", "ALTÍSSIMA"] as const;

type Tipo = (typeof TIPOS)[number];

const schema = z.object({
  nome: z.string().trim().min(1, "Informe seu nome").max(100),
  email: z.string().trim().email("E-mail inválido"),
  setor: z.string().min(1, "Selecione o setor"),
  tipo: z.enum(TIPOS, { errorMap: () => ({ message: "Selecione o tipo" }) }),
  hardware: z.string().optional(),
  software: z.string().optional(),
  outros: z.string().max(200).optional(),
  descricaoReq: z.string().max(2000).optional(),
  autorizador: z.string().optional(),
  aplicativos: z.array(z.string()).optional(),
  descricao: z.string().trim().min(5, "Descreva com pelo menos 5 caracteres").max(2000),
  urgencia: z.enum(URGENCIAS, { errorMap: () => ({ message: "Selecione a urgência" }) }),
}).superRefine((v, ctx) => {
  if (v.tipo === "INCIDENTE" && !v.hardware && !v.software) {
    ctx.addIssue({ code: "custom", path: ["hardware"], message: "Selecione hardware ou software" });
  }
  if (v.tipo === "REQUISIÇÃO") {
    if (!v.descricaoReq || v.descricaoReq.trim().length < 5)
      ctx.addIssue({ code: "custom", path: ["descricaoReq"], message: "Descreva a requisição" });
    if (!v.autorizador)
      ctx.addIssue({ code: "custom", path: ["autorizador"], message: "Selecione quem autorizou" });
  }
  if (v.tipo === "ACESSO OU REVOGAÇÃO") {
    if (!v.aplicativos || v.aplicativos.length === 0)
      ctx.addIssue({ code: "custom", path: ["aplicativos"], message: "Selecione ao menos 1 aplicativo" });
    if (!v.autorizador)
      ctx.addIssue({ code: "custom", path: ["autorizador"], message: "Selecione quem autorizou" });
  }
});

type FormState = z.infer<typeof schema>;

const initial = (nome = "", email = ""): FormState => ({
  nome,
  email,
  setor: "",
  tipo: "" as unknown as Tipo,
  hardware: "",
  software: "",
  outros: "",
  descricaoReq: "",
  autorizador: "",
  aplicativos: [],
  descricao: "",
  urgencia: "" as unknown as typeof URGENCIAS[number],
});

const WEBHOOK_URL = "https://n8n.solvis.app/webhook/abrir-chamado";

function toPayload(form: FormState) {
  return {
    nome: form.nome,
    email: form.email,
    setor: form.setor,
    tipo: form.tipo,
    hardware: form.tipo === "INCIDENTE" ? (form.hardware || null) : null,
    software: form.tipo === "INCIDENTE" ? (form.software || null) : null,
    outros: form.outros || null,
    descricao_req: form.tipo === "REQUISIÇÃO" ? (form.descricaoReq || null) : null,
    autorizador:
      form.tipo === "REQUISIÇÃO" || form.tipo === "ACESSO OU REVOGAÇÃO"
        ? (form.autorizador || null)
        : null,
    aplicativos:
      form.tipo === "ACESSO OU REVOGAÇÃO" ? (form.aplicativos || []) : null,
    descricao: form.descricao,
    urgencia: form.urgencia,
  };
}

export function ChamadoForm({ onSent }: { onSent?: () => void }) {
  const { profile } = useAuth();
  const [form, setForm] = useState<FormState>(() =>
    initial(profile?.full_name || "", profile?.email || "")
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm((f) => ({
      ...f,
      nome: f.nome || profile?.full_name || "",
      email: f.email || profile?.email || "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.full_name, profile?.email]);

  // Autofill setor (e e-mail/nome) com base no colaborador cadastrado
  useEffect(() => {
    const email = (profile?.email || "").trim().toLowerCase();
    const fullName = (profile?.full_name || "").trim().toLowerCase();
    if (!email && !fullName) return;
    let cancelled = false;
    fetchColaboradores().then((list) => {
      if (cancelled) return;
      const match =
        list.find((c) => (c.email || "").trim().toLowerCase() === email) ||
        list.find((c) => (c.nome || "").trim().toLowerCase() === fullName);
      if (!match) return;
      setForm((f) => ({
        ...f,
        nome: f.nome || match.nome,
        email: f.email || (match.email || ""),
        setor: f.setor || DEPT_TO_SETOR[match.departamento || ""] || f.setor,
      }));
    });
    return () => { cancelled = true; };
  }, [profile?.email, profile?.full_name]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key as string]: "" }));
  };

  const toggleApp = (app: string, checked: boolean) => {
    setForm((f) => {
      const set = new Set(f.aplicativos || []);
      if (checked) set.add(app); else set.delete(app);
      return { ...f, aplicativos: Array.from(set) };
    });
    setErrors((e) => ({ ...e, aplicativos: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        const key = err.path[0] as string;
        if (key && !fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      toast.error("Revise os campos destacados.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(form)),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      toast.success(
        "Chamado registrado! A TI foi notificada e você receberá um e-mail de confirmação em instantes.",
        { duration: 8000 }
      );
      setForm(initial(profile?.full_name || "", profile?.email || ""));
      setErrors({});
      onSent?.();
    } catch (err) {
      console.error("Erro ao registrar chamado:", err);
      toast.error("Não foi possível registrar o chamado. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const tipo = form.tipo as Tipo | "";
  const showIncidente = tipo === "INCIDENTE";
  const showRequisicao = tipo === "REQUISIÇÃO";
  const showAcesso = tipo === "ACESSO OU REVOGAÇÃO";

  const errClass = (k: string) => (errors[k] ? "border-destructive" : "");

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Abrir chamado para a TI</CardTitle>
          <CardDescription>
            Preencha os dados e envie. A TI é notificada na hora e você recebe um e-mail de confirmação.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Seu nome</Label>
              <Input id="nome" value={form.nome} onChange={(e) => update("nome", e.target.value)} className={errClass("nome")} />
              {errors.nome && <p className="text-xs text-destructive">{errors.nome}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Seu e-mail</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={errClass("email")} placeholder="voce@solvis.com.br" />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Setor</Label>
              <Select value={form.setor} onValueChange={(v) => update("setor", v)}>
                <SelectTrigger className={errClass("setor")}><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {SETORES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.setor && <p className="text-xs text-destructive">{errors.setor}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>O que você precisa?</Label>
            <Select value={form.tipo} onValueChange={(v) => update("tipo", v as Tipo)}>
              <SelectTrigger className={errClass("tipo")}><SelectValue placeholder="Selecione o tipo..." /></SelectTrigger>
              <SelectContent>
                {TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.tipo && <p className="text-xs text-destructive">{errors.tipo}</p>}
          </div>

          {showIncidente && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border border-border bg-muted/30">
              <div className="space-y-2">
                <Label>Caso seja HARDWARE</Label>
                <Select value={form.hardware} onValueChange={(v) => update("hardware", v)}>
                  <SelectTrigger className={errClass("hardware")}><SelectValue placeholder="Selecione (opcional)..." /></SelectTrigger>
                  <SelectContent>
                    {HARDWARE.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Caso seja SOFTWARE</Label>
                <Select value={form.software} onValueChange={(v) => update("software", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione (opcional)..." /></SelectTrigger>
                  <SelectContent>
                    {SOFTWARE.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {errors.hardware && <p className="text-xs text-destructive md:col-span-2">{errors.hardware}</p>}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="outros">Se escolheu "Outros", especifique</Label>
                <Input id="outros" value={form.outros} onChange={(e) => update("outros", e.target.value)} placeholder="Opcional" />
              </div>
            </div>
          )}

          {showRequisicao && (
            <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
              <div className="space-y-2">
                <Label htmlFor="descReq">Descreva o equipamento, quantidade e motivo</Label>
                <Textarea id="descReq" rows={3} value={form.descricaoReq} onChange={(e) => update("descricaoReq", e.target.value)} className={errClass("descricaoReq")} />
                {errors.descricaoReq && <p className="text-xs text-destructive">{errors.descricaoReq}</p>}
              </div>
              <div className="space-y-2">
                <Label>Quem autorizou</Label>
                <Select value={form.autorizador} onValueChange={(v) => update("autorizador", v)}>
                  <SelectTrigger className={errClass("autorizador")}><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {AUTORIZADORES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.autorizador && <p className="text-xs text-destructive">{errors.autorizador}</p>}
              </div>
            </div>
          )}

          {showAcesso && (
            <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
              <div className="space-y-2">
                <Label>Aplicativos (acesso ou revogação)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {APLICATIVOS.map((app) => {
                    const checked = (form.aplicativos || []).includes(app);
                    return (
                      <label key={app} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox checked={checked} onCheckedChange={(c) => toggleApp(app, !!c)} />
                        <span>{app}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.aplicativos && <p className="text-xs text-destructive">{errors.aplicativos}</p>}
              </div>
              <div className="space-y-2">
                <Label>Quem autorizou</Label>
                <Select value={form.autorizador} onValueChange={(v) => update("autorizador", v)}>
                  <SelectTrigger className={errClass("autorizador")}><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {AUTORIZADORES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.autorizador && <p className="text-xs text-destructive">{errors.autorizador}</p>}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="descricao">Descreva, em detalhes, o que está havendo</Label>
            <Textarea id="descricao" rows={5} value={form.descricao} onChange={(e) => update("descricao", e.target.value)} className={errClass("descricao")} placeholder="Inclua links/prints relevantes (uploads de arquivo não são suportados aqui)." />
            {errors.descricao && <p className="text-xs text-destructive">{errors.descricao}</p>}
          </div>

          <div className="space-y-2 max-w-xs">
            <Label>Urgência</Label>
            <Select value={form.urgencia} onValueChange={(v) => update("urgencia", v as typeof URGENCIAS[number])}>
              <SelectTrigger className={errClass("urgencia")}><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {URGENCIAS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.urgencia && <p className="text-xs text-destructive">{errors.urgencia}</p>}
          </div>

          <div className="flex flex-col items-end gap-2 pt-2">
            <Button type="submit" disabled={submitting} size="lg" className="gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? "Enviando..." : "Enviar chamado"}
            </Button>
            <p className="text-xs text-muted-foreground">
              A TI recebe o chamado automaticamente e abre o ticket no Jira.
            </p>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
