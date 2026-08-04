import { useDemoMode } from "@/hooks/useDemoMode";
import { Sparkles } from "lucide-react";

/**
 * Selo fixo no canto inferior direito quando o Modo Demo está ativo.
 * TODO: Remover ao desativar o Modo Demo.
 */
export function DemoBadge() {
  const { active } = useDemoMode();
  if (!active) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] pointer-events-none">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 backdrop-blur-md shadow-lg">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 tracking-wide">
          Modo Demo Ativo
        </span>
      </div>
    </div>
  );
}
