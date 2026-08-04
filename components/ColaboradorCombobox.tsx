import { useState, useEffect, useRef } from "react";
import { dbClient } from "@/lib/dbClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { normalizeText, smartFilter } from "@/lib/fuzzySearch";

interface ColaboradorComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef?: (el: HTMLInputElement | null) => void;
}

export function ColaboradorCombobox({ value, onChange, onKeyDown, inputRef }: ColaboradorComboboxProps) {
  const [options, setOptions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dbClient().from("Colaboradores").select("nome").order("nome").then(({ data }: any) => {
      const names = (data || [])
        .map((d: any) => d.nome)
        .filter((n: string) => n && n.toLowerCase() !== "solvis");
      setOptions(names);
    });
  }, []);

  const filtered = value.trim()
    ? smartFilter(options, value, [(name) => name])
    : options;

  const exactMatch = options.some((o) => normalizeText(o) === normalizeText(value));

  const handleCreate = async () => {
    if (!value.trim()) return;
    setCreating(true);
    const { error } = await dbClient().from("Colaboradores").insert({ nome: value.trim() });
    if (error) {
      toast.error("Erro ao criar: " + error.message);
    } else {
      setOptions((prev) => [...prev, value.trim()].sort());
      toast.success(`"${value.trim()}" adicionado!`);
    }
    setCreating(false);
    setOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Buscar colaborador..."
        autoComplete="off"
      />
      {open && (filtered.length > 0 || (value.trim() && !exactMatch)) && (
        <div className="absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-md max-h-48 overflow-y-auto">
          {filtered.slice(0, 20).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors",
                value === opt && "bg-accent/50"
              )}
            >
              {value === opt && <Check className="w-3 h-3 text-primary" />}
              {opt}
            </button>
          ))}
          {value.trim() && !exactMatch && (
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-primary/10 flex items-center gap-2 border-t"
            >
              <Plus className="w-3 h-3" />
              Cadastrar "{value.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
