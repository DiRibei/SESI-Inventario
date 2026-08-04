import { useEffect, useState } from "react";
import { isDemoActive, subscribeDemo, setDemoActive, canUseDemo, DEMO_ALLOWED_EMAIL } from "@/lib/demoMode";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook reativo para Modo Demo. Retorna o estado atual e helpers
 * para alternar/desligar. O toggle só fica disponível para o e-mail
 * autorizado (DEMO_ALLOWED_EMAIL).
 */
export function useDemoMode() {
  const { profile } = useAuth();
  const [active, setActive] = useState(isDemoActive());

  useEffect(() => {
    return subscribeDemo(setActive);
  }, []);

  const allowed = canUseDemo(profile?.email);

  return {
    active,
    allowed,
    toggle: () => {
      if (allowed) setDemoActive(!active);
    },
    enable: () => allowed && setDemoActive(true),
    disable: () => setDemoActive(false),
    DEMO_ALLOWED_EMAIL,
  };
}
