import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Inventario from "./pages/Inventario";
import Busca from "./pages/Busca";
import JiraView from "./pages/JiraView";
import AdminUsuarios from "./pages/AdminUsuarios";
import AdminColaboradores from "./pages/AdminColaboradores";
import EstoquePecas from "./pages/EstoquePecas";
import Perifericos from "./pages/Perifericos";
import ConsultaChamados from "./pages/ConsultaChamados";
import Chamados from "./pages/Chamados";
import NotFound from "./pages/NotFound";
import { DemoBadge } from "@/components/DemoBadge";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Sonner />
        <AuthProvider>
          <DemoBadge />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/suporte" element={<ConsultaChamados />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inventario" element={<Inventario />} />
              <Route path="/busca" element={<Busca />} />
              <Route path="/jira" element={<JiraView />} />
              <Route path="/chamados" element={<Chamados />} />
              <Route path="/admin/usuarios" element={<AdminUsuarios />} />
              <Route path="/admin/colaboradores" element={<AdminColaboradores />} />
              <Route path="/estoque-pecas" element={<EstoquePecas />} />
              <Route path="/perifericos" element={<Perifericos />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
