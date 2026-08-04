import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Table2,
  Search,
  TicketCheck,
  LifeBuoy,
  Package,
  Mouse,
  Users,
  UserCog,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  shortcut?: string;
  adminOnly?: boolean;
  state?: Record<string, unknown>;
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Notebooks", path: "/inventario", icon: Table2 },
  { label: "Busca", path: "/busca", icon: Search },
  { label: "Jira", path: "/jira", icon: TicketCheck },
  { label: "Chamados", path: "/chamados", icon: LifeBuoy },
  { label: "Meus Chamados", path: "/chamados", icon: LifeBuoy, state: { tab: "meus" } },
  { label: "Peças", path: "/estoque-pecas", icon: Package },
  { label: "Periféricos", path: "/perifericos", icon: Mouse },
];

const adminItems: NavItem[] = [
  { label: "Usuários", path: "/admin/usuarios", icon: Users, adminOnly: true },
  { label: "Colaboradores", path: "/admin/colaboradores", icon: UserCog, adminOnly: true },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }

      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  const allItems = [...navItems, ...adminItems];

  const handleSelect = useCallback(
    (path: string, state?: Record<string, unknown>) => {
      setOpen(false);
      if (location.pathname !== path || state) {
        navigate(path, { state });
      }
    },
    [navigate, location.pathname]
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Digite o nome da aba..." />
      <CommandList>
        <CommandGroup heading="Navegação">
          {navItems.map((item) => (
            <CommandItem
              key={item.label}
              onSelect={() => handleSelect(item.path, item.state)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        {isAdmin && (
          <CommandGroup heading="Admin">
            {adminItems.map((item) => (
              <CommandItem
                key={item.label}
                value={`${item.label.toLowerCase()} admin`}
                onSelect={() => handleSelect(item.path, item.state)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
