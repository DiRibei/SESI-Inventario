import { BarChart3, Search, Table2, TicketCheck, LogOut, LayoutDashboard, Server, Users, UserCog, Shield, Package, Mouse, Sparkles, LifeBuoy } from "lucide-react";
import { useDemoMode } from "@/hooks/useDemoMode";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useJiraOpenCount } from "@/hooks/useJiraOpenCount";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Notebooks", url: "/inventario", icon: Table2 },
  { title: "Busca", url: "/busca", icon: Search },
  { title: "Jira", url: "/jira", icon: TicketCheck },
  { title: "Chamados", url: "/chamados", icon: LifeBuoy },
  { title: "Peças", url: "/estoque-pecas", icon: Package },
  { title: "Periféricos", url: "/perifericos", icon: Mouse },
];

const adminItems = [
  { title: "Usuários", url: "/admin/usuarios", icon: Users },
  { title: "Colaboradores", url: "/admin/colaboradores", icon: UserCog },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { logout, role, profile } = useAuth();
  const demo = useDemoMode();
  const { count: jiraOpenCount } = useJiraOpenCount();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-sidebar">
        <div className={`flex items-center gap-3 ${collapsed ? 'p-2 justify-center' : 'p-4'}`}>
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
            <Server className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-sm font-bold text-sidebar-primary-foreground tracking-wide">SOLVIS</h2>
              <p className="text-[10px] text-sidebar-foreground/60 tracking-widest uppercase">Asset Manager</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] tracking-widest uppercase px-4">
            {!collapsed && "Navegação"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const showBadge = item.url === "/jira" && jiraOpenCount > 0;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-primary-foreground transition-all"
                        activeClassName="bg-sidebar-accent text-sidebar-primary-foreground font-medium"
                      >
                        <span className="relative flex-shrink-0">
                          <item.icon className="w-4 h-4" />
                          {showBadge && (
                            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
                              <span className="relative inline-flex min-w-[16px] h-4 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                                {jiraOpenCount > 99 ? "99+" : jiraOpenCount}
                              </span>
                            </span>
                          )}
                        </span>
                        {!collapsed && (
                          <span className="text-sm flex-1">
                            {item.title}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] tracking-widest uppercase px-4">
              {!collapsed && (
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              )}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-primary-foreground transition-all"
                        activeClassName="bg-sidebar-accent text-sidebar-primary-foreground font-medium"
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="bg-sidebar p-3">
        {!collapsed && profile && (
          <div className="px-4 py-2 mb-1">
            <p className="text-xs text-sidebar-foreground/80 font-medium truncate"><p className="text-xs text-sidebar-foreground/80 font-medium truncate">{profile.full_name}</p></p>
            <p className="text-[10px] text-sidebar-foreground/40 truncate">{profile.email}</p>
          </div>
        )}
        {/* TODO: Remover botão ao desativar Modo Demo. */}
        {demo.allowed && (
          <button
            onClick={demo.toggle}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg w-full transition-all mb-1 ${
              demo.active
                ? "bg-amber-500/15 text-amber-500 hover:bg-amber-500/25"
                : "text-sidebar-foreground/50 hover:text-sidebar-primary-foreground hover:bg-sidebar-accent"
            }`}
            title={demo.active ? "Desativar Modo Demo" : "Ativar Modo Demo"}
          >
            <Sparkles className="w-4 h-4" />
            {!collapsed && <span className="text-sm">{demo.active ? "Demo: ON" : "Modo Demo"}</span>}
          </button>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sidebar-foreground/50 hover:text-destructive hover:bg-sidebar-accent transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="text-sm">Sair</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
