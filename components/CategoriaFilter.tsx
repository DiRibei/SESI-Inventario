import { Layers, Laptop } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type CategoriaFilterValue = "Tudo" | "Notebooks";

interface Props {
  value: CategoriaFilterValue;
  onChange: (v: CategoriaFilterValue) => void;
}

const OPTIONS: { value: CategoriaFilterValue; label: string; icon: React.ReactNode }[] = [
  { value: "Tudo", label: "Tudo (Ativos + Periféricos)", icon: <Layers className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /> },
  { value: "Notebooks", label: "Apenas Notebooks", icon: <Laptop className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /> },
];

export function CategoriaFilter({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as CategoriaFilterValue)}>
      <SelectTrigger className="w-[230px]">
        <Layers className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            <span className="flex items-center">
              {o.icon}
              {o.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
