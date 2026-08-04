import { useState, useEffect, useRef, useCallback, KeyboardEvent } from "react";
import { Asset, updateAsset, createAsset, logAuditChanges, logAuditCreation, fetchAuditHistory, AuditEntry } from "@/lib/api";
import { supabase as typedSupabase } from "@/lib/supabase";
const supabase = typedSupabase as any;
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColaboradorCombobox } from "@/components/ColaboradorCombobox";
import { toast } from "sonner";
import { Loader2, Lock, Check, AlertTriangle, CheckCircle2, History, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssetEditModalProps {
  asset: Asset | null;
  open: boolean;
  onClose: () => void;
  onSaved: (updated: Partial<Asset> & { patrimonio: string }) => void;
  isDuplicate?: boolean;
  isNew?: boolean;
}

const STATUS_OPTIONS = ["Disponível", "Retirado", "Vendido", "Desconhecido", "Em Manutenção / Quebrado", "Em Triagem / Aguardando Teste"];
const CATEGORIA_OPTIONS = ["Notebook", "Desktop"];
const UNIDADE_OPTIONS = ["Matriz", "Fábrica"];

const emptyForm = {
  patrimonio: "",
  categoria: "",
  marca: "",
  modelo: "",
  serial: "",
  colaborador: "",
  status: "",
  valor: "0",
  unidade: "",
  observacoes: "",
};

const FIELD_ORDER = ["patrimonio", "serial", "marca", "modelo", "colaborador", "valor"];

export function AssetEditModal({ asset, open, onClose, onSaved, isDuplicate, isNew }: AssetEditModalProps) {
  const { profile, user } = useAuth();
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [patrimonioStatus, setPatrimonioStatus] = useState<"idle" | "checking" | "exists" | "available">("idle");
  const [history, setHistory] = useState<AuditEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dados");
  const patrimonioRef = useRef<HTMLInputElement>(null);
  const fieldRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const checkPatrimonio = useCallback(async (value: string) => {
    if (!value.trim()) { setPatrimonioStatus("idle"); return; }
    setPatrimonioStatus("checking");
    const { data } = await supabase
      .from("EstoqueSolvis")
      .select("\"Patrimônio\"")
      .eq("Patrimônio", value.trim())
      .limit(1);
    setPatrimonioStatus(data && data.length > 0 ? "exists" : "available");
  }, []);

  const buildDuplicateForm = (source: Asset) => ({
    patrimonio: "",
    categoria: source.categoria,
    marca: source.marca,
    modelo: source.modelo,
    serial: "",
    colaborador: "",
    status: "Disponível",
    valor: source.valor.toString(),
    unidade: source.unidade,
    observacoes: "",
  });

  const loadHistory = useCallback(async (pat: string) => {
    setHistoryLoading(true);
    const data = await fetchAuditHistory(pat);
    setHistory(data);
    setHistoryLoading(false);
  }, []);

  useEffect(() => {
    if (!open) {
      setSavedCount(0);
      setPatrimonioStatus("idle");
      setHistory([]);
      setActiveTab("dados");
      return;
    }
    if (isNew) {
      setForm({ ...emptyForm });
    } else if (asset) {
      if (isDuplicate) {
        setForm(buildDuplicateForm(asset));
      } else {
        setForm({
          patrimonio: asset.patrimonio,
          categoria: asset.categoria,
          marca: asset.marca,
          modelo: asset.modelo,
          serial: asset.serial,
          colaborador: asset.colaborador,
          status: asset.status,
          valor: asset.valor.toString(),
          unidade: asset.unidade,
          observacoes: asset.observacoes || "",
        });
        loadHistory(asset.patrimonio);
      }
    }
    setTimeout(() => patrimonioRef.current?.focus(), 100);
  }, [open, asset, isDuplicate, isNew, loadHistory]);

  const handleSave = async () => {
    if (!form.patrimonio.trim()) {
      toast.warning("Patrimônio é obrigatório.");
      patrimonioRef.current?.focus();
      return;
    }
    if ((isNew || isDuplicate) && patrimonioStatus === "exists") {
      toast.warning("Este patrimônio já está cadastrado.");
      patrimonioRef.current?.focus();
      return;
    }
    if (!form.categoria.trim()) {
      toast.warning("Categoria é obrigatória.");
      return;
    }
    setSaving(true);
    try {
      const parsedValor = parseFloat(form.valor) || 0;
      const payload = {
        patrimonio: form.patrimonio,
        categoria: form.categoria,
        marca: form.marca,
        modelo: form.modelo,
        serial: form.serial,
        colaborador: form.colaborador,
        status: form.status,
        valor: parsedValor,
        unidade: form.unidade as Asset["unidade"],
        observacoes: form.observacoes,
      };

      let result: { ok: boolean; error?: string };
      const userName = profile?.full_name || user?.email || "Sistema";

      if (isNew || isDuplicate) {
        result = await createAsset(payload);
        if (result.ok) {
          // Log creation as a single entry
          await logAuditCreation(form.patrimonio, userName, user?.id);
        }
      } else {
        // Build old values for diff
        const oldValues: Record<string, string> = {
          Categoria: asset!.categoria,
          Marca: asset!.marca,
          Modelo: asset!.modelo,
          Serial: asset!.serial,
          Colaborador: asset!.colaborador,
          Status: asset!.status,
          Valor: asset!.valor.toString(),
          Unidade: asset!.unidade,
          Observações: asset!.observacoes || "",
        };
        const newValues: Record<string, string> = {
          Categoria: form.categoria,
          Marca: form.marca,
          Modelo: form.modelo,
          Serial: form.serial,
          Colaborador: form.colaborador,
          Status: form.status,
          Valor: parsedValor.toString(),
          Unidade: form.unidade,
          Observações: form.observacoes,
        };

        result = await updateAsset(asset!.patrimonio, payload);
        if (result.ok) {
          await logAuditChanges(asset!.patrimonio, oldValues, newValues, userName, user?.id);
        }
      }

      if (result.ok) {
        onSaved({ ...payload, atualizadoEm: new Date().toISOString() });
        if (isNew || isDuplicate) {
          toast.success(`Ativo "${form.patrimonio}" criado com sucesso!`);
        } else {
          toast.success("Ativo atualizado com sucesso!");
        }
        onClose();
      } else {
        toast.error(`Erro ao salvar: ${result.error || "Erro desconhecido"}`);
      }
    } catch (err: any) {
      toast.error(`Erro ao salvar: ${err?.message || "Erro desconhecido"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, fieldName: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const idx = FIELD_ORDER.indexOf(fieldName);
      if (idx >= 0 && idx < FIELD_ORDER.length - 1) {
        const nextField = FIELD_ORDER[idx + 1];
        fieldRefs.current[nextField]?.focus();
      } else {
        handleSave();
      }
    }
  };

  const setFieldRef = (name: string) => (el: HTMLInputElement | null) => {
    fieldRefs.current[name] = el;
    if (name === "patrimonio") {
      (patrimonioRef as any).current = el;
    }
  };

  const isEditing = !isDuplicate && !isNew;
  const title = isNew ? "Novo Ativo" : isDuplicate ? "Novo Ativo (Modelo)" : "Gerenciar Ativo";
  const description = isNew
    ? "Preencha os dados do novo ativo."
    : isDuplicate
    ? "Cadastrando novo ativo baseado em modelo existente."
    : "Edite as informações do ativo e salve para atualizar.";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            {title}
            {savedCount > 0 && (
              <Badge variant="secondary" className="text-xs font-normal">
                {savedCount} criado{savedCount > 1 ? "s" : ""}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          {isDuplicate && (
            <div className="flex items-center gap-2 text-xs text-warning bg-warning/10 border border-warning/20 rounded-lg px-3 py-2 mt-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Cadastrando novo ativo baseado em modelo existente. Preencha o Patrimônio e Serial.
            </div>
          )}
          {isEditing && asset?.atualizadoEm && (
            <p className="text-xs text-muted-foreground mt-1">
              Última atualização em: {new Date(asset.atualizadoEm).toLocaleDateString("pt-BR")}
            </p>
          )}
        </DialogHeader>

        {isEditing ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="dados">Dados</TabsTrigger>
              <TabsTrigger value="historico" className="flex items-center gap-1">
                <History className="w-3.5 h-3.5" /> Histórico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dados">
              {renderForm()}
            </TabsContent>

            <TabsContent value="historico">
              <div className="space-y-2 max-h-[400px] overflow-y-auto py-2">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : history.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">Nenhuma alteração registrada.</p>
                ) : (
                  history.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border text-xs">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <span className="text-muted-foreground">
                          {(() => {
                            if (!entry.created_at) return "Sem data";
                            const d = new Date(entry.created_at);
                            if (isNaN(d.getTime())) return "Sem data";
                            const date = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
                            const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                            return `${date} às ${time}`;
                          })()}
                        </span>
                        {" — "}
                        <span className="font-medium text-foreground">{entry.usuario_nome}</span>
                        {" alterou "}
                        <span className="font-medium text-primary">{entry.campo}</span>
                        {entry.valor_antigo && (
                          <> de "<span className="text-destructive line-through">{entry.valor_antigo}</span>"</>
                        )}
                        {" para "}
                        "<span className="text-success font-medium">{entry.valor_novo}</span>"
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          renderForm()
        )}

        <DialogFooter className="gap-2">
          {(isNew || isDuplicate) ? (
            <Button variant="outline" onClick={onClose} disabled={saving}>Concluir</Button>
          ) : (
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          )}
          <Button onClick={handleSave} disabled={saving || ((isNew || isDuplicate) && patrimonioStatus === "exists")} className="gradient-primary text-primary-foreground">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : (isNew || isDuplicate) ? "Criar Ativo" : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  function renderForm() {
    return (
      <div className="grid gap-4 py-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="patrimonio">Patrimônio <span className="text-destructive">*</span></Label>
            {isEditing ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Input id="patrimonio" value={form.patrimonio} disabled className="bg-muted pr-8 uppercase" />
                      <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Chave primária — não pode ser alterada.<br />Para corrigir, exclua e crie um novo.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className="space-y-1">
                <div className="relative">
                  <Input
                    id="patrimonio"
                    ref={setFieldRef("patrimonio")}
                    value={form.patrimonio}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setForm({ ...form, patrimonio: val });
                      setPatrimonioStatus("idle");
                      clearTimeout(debounceRef.current);
                      debounceRef.current = setTimeout(() => checkPatrimonio(val), 500);
                    }}
                    onBlur={() => { if (form.patrimonio.trim()) checkPatrimonio(form.patrimonio); }}
                    onKeyDown={(e) => handleKeyDown(e, "patrimonio")}
                    className={cn("uppercase pr-8", patrimonioStatus === "exists" && "border-destructive focus-visible:ring-destructive")}
                    autoComplete="off"
                  />
                  {patrimonioStatus === "checking" && <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground animate-spin" />}
                  {patrimonioStatus === "available" && <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-success" />}
                  {patrimonioStatus === "exists" && <AlertTriangle className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-destructive" />}
                </div>
                {patrimonioStatus === "exists" && (
                  <p className="text-xs text-destructive flex items-center gap-1">⚠️ ID já cadastrado em outro ativo.</p>
                )}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="serial">Serial</Label>
            <Input
              id="serial"
              ref={setFieldRef("serial")}
              value={form.serial}
              onChange={(e) => setForm({ ...form, serial: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, "serial")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Categoria <span className="text-destructive">*</span></Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIA_OPTIONS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setForm({ ...form, categoria: cat })}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                  form.categoria === cat
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {form.categoria === cat && <Check className="w-3 h-3" />}
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="marca">Marca</Label>
            <Input
              id="marca"
              ref={setFieldRef("marca")}
              value={form.marca}
              onChange={(e) => setForm({ ...form, marca: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, "marca")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modelo">Modelo</Label>
            <Input
              id="modelo"
              ref={setFieldRef("modelo")}
              value={form.modelo}
              onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, "modelo")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="colaborador">Colaborador</Label>
          <ColaboradorCombobox
            value={form.colaborador}
            onChange={(v) => {
              const updates: Partial<typeof form> = { colaborador: v };
              const trimmed = (v || "").trim();
              if (!trimmed && form.status === "Retirado") {
                updates.status = "Disponível";
              }
              setForm({ ...form, ...updates });
            }}
            onKeyDown={(e) => handleKeyDown(e as any, "colaborador")}
            inputRef={setFieldRef("colaborador")}
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={form.status || undefined} onValueChange={(v) => {
              const updates: Partial<typeof form> = { status: v };
              if (v === "Vendido") updates.colaborador = "Vendido/Ex-Ativo";
              setForm({ ...form, ...updates });
            }}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.status === "Vendido" && (
              <p className="text-xs text-warning flex items-center gap-1">
                ⚠️ Este item sairá do cálculo de patrimônio ativo.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="unidade">Unidade</Label>
            <Select value={form.unidade || undefined} onValueChange={(v) => setForm({ ...form, unidade: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {UNIDADE_OPTIONS.map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              ref={setFieldRef("valor")}
              type="number"
              step="0.01"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, "valor")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            placeholder="Anotações gerais sobre o ativo..."
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            className="min-h-[60px] resize-none"
          />
        </div>
      </div>
    );
  }
}
