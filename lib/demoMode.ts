/**
 * Modo Demo / Apresentação
 *
 * Quando ativo, todos os dados reais são substituídos por dados fictícios
 * em memória. Restrito ao e-mail do administrador de manutenção.
 *
 * TODO: Remover este modo assim que a apresentação para CEOs for concluída.
 */

const STORAGE_KEY = "solvis_demo_mode";
export const DEMO_ALLOWED_EMAIL = "diego.ferreira@solvis.com.br";

type Listener = (active: boolean) => void;
const listeners = new Set<Listener>();

let _active = (() => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
})();

export function isDemoActive(): boolean {
  return _active;
}

export function setDemoActive(value: boolean) {
  _active = value;
  try {
    if (value) localStorage.setItem(STORAGE_KEY, "1");
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* no-op */
  }
  listeners.forEach((fn) => fn(value));
}

export function subscribeDemo(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** True only se for o e-mail liberado E o modo estiver ativo. */
export function canUseDemo(email?: string | null): boolean {
  return !!email && email.toLowerCase() === DEMO_ALLOWED_EMAIL;
}
