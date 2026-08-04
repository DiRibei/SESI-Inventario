import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { toast } from "sonner";
import { Shield, ShieldCheck, Users, Ban, RefreshCw } from "lucide-react";

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  user_roles: string | null;
}

export default function AdminUsuarios() {
  const { role, user } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*");

    if (error) {
      console.error("Error loading profiles:", error.message);
      toast.error("Erro ao carregar usuários: " + error.message);
      setLoading(false);
      return;
    }

    if (profiles) {
      setUsers(
        profiles.map((p: any) => ({
          id: p.id,
          email: p.email || "",
          full_name: p.full_name || "",
          user_roles: p.user_roles || null,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userRow: UserRow, newRole: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ user_roles: newRole })
      .eq("id", userRow.id);

    if (error) {
      console.error("Error updating role:", error);
      toast.error("Erro ao atualizar permissão: " + error.message);
      return;
    }

    toast.success("Permissão atualizada com sucesso!");
    setUsers((prev) =>
      prev.map((u) => (u.id === userRow.id ? { ...u, user_roles: newRole } : u))
    );
  };

  const handleRevokeAccess = async (userRow: UserRow) => {
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userRow.id);

    if (error) {
      console.error("Error revoking access:", error);
      toast.error("Erro ao excluir acesso: " + error.message);
      return;
    }

    toast.success(`Acesso de ${userRow.full_name || "usuário"} excluído. Ao logar novamente, será um usuário comum.`);
    setUsers((prev) => prev.filter((u) => u.id !== userRow.id));
  };

  if (role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-6 h-6" /> Gestão de Usuários
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Gerencie as permissões dos usuários do sistema</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={syncing}
            onClick={async () => {
              setSyncing(true);
              try {
                const res = await fetch(
                  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-profiles`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
                  }
                );
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Erro ao sincronizar");
                if (data.created > 0) {
                  toast.success(`${data.created} perfil(is) sincronizado(s) com sucesso!`);
                  loadUsers();
                } else {
                  toast.info("Todos os usuários já possuem perfil.");
                }
              } catch (err: any) {
                toast.error("Erro ao sincronizar: " + err.message);
              } finally {
                setSyncing(false);
              }
            }}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            Sincronizar Perfis
          </Button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-card rounded-xl shadow-card border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Nome</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">E-mail</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Permissão</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Alterar Permissão</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === user?.id;
                  return (
                    <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{u.full_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3">
                        {u.user_roles ? (
                          <Badge className={u.user_roles === "admin" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}>
                            {u.user_roles === "admin" ? <ShieldCheck className="w-3 h-3 mr-1" /> : <Shield className="w-3 h-3 mr-1" />}
                            {u.user_roles === "admin" ? "Admin" : "Usuário"}
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-destructive/15 text-destructive">
                            <Ban className="w-3 h-3 mr-1" /> Revogado
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!isSelf && (
                          <Select
                            value={u.user_roles || ""}
                            onValueChange={(v) => handleRoleChange(u, v)}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue placeholder="Selecionar" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="user">Usuário</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!isSelf && u.user_roles && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs gap-1">
                                <Ban className="w-3.5 h-3.5" />
                                Revogar Acesso
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir acesso de {u.full_name || u.email}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Isso removerá o perfil deste usuário. Na próxima vez que fizer login, um novo perfil será criado automaticamente como usuário comum (Reader), sem as permissões anteriores.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleRevokeAccess(u)}
                                >
                                  Sim, excluir acesso
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
