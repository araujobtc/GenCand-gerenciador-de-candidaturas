import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoginPage from '../pages/LoginPage'
import CadastroPage from '../pages/CadastroPage'
import ConfirmarEmailPage from '../pages/ConfirmarEmailPage'
import RecuperarSenhaPage from '../pages/RecuperarSenhaPage'
import CandidaturasPage from '../pages/CandidaturasPage'
import NovaCandidaturaPage from '../pages/NovaCandidaturaPage'
import EditarCandidaturaPage from '../pages/EditarCandidaturaPage'
import { DashboardPage, PlataformasPage, CurriculosPage, ConfiguracoesPage, DetalhesCandidaturaPage } from '../pages/WorkspacePages'
import RotaPrivada from './RotaPrivada'

function RotaPublica({ children }: { children: React.ReactNode }) {
 const { autenticado } = useAuth()
 return autenticado ? <Navigate to="/painel" replace /> : children
}
function AppRoutes() {
 return <Routes>
  <Route path="/login" element={<RotaPublica><LoginPage /></RotaPublica>} />
  <Route path="/cadastro" element={<RotaPublica><CadastroPage /></RotaPublica>} />
  <Route path="/confirmar-email" element={<ConfirmarEmailPage />} />
  <Route path="/recuperar-senha" element={<RotaPublica><RecuperarSenhaPage /></RotaPublica>} />
  <Route path="/redefinir-senha" element={<RotaPublica><RecuperarSenhaPage /></RotaPublica>} />
  <Route element={<RotaPrivada />}>
   <Route path="/painel" element={<DashboardPage />} />
   <Route path="/candidaturas" element={<CandidaturasPage />} />
   <Route path="/candidaturas/nova" element={<NovaCandidaturaPage />} />
   <Route path="/candidaturas/:id" element={<DetalhesCandidaturaPage />} />
   <Route path="/candidaturas/:id/editar" element={<EditarCandidaturaPage />} />
   <Route path="/plataformas" element={<PlataformasPage />} />
   <Route path="/curriculos" element={<CurriculosPage />} />
   <Route path="/configuracoes" element={<ConfiguracoesPage />} />
  </Route>
  <Route path="/" element={<Navigate to="/painel" replace />} />
  <Route path="*" element={<h1>Página não encontrada</h1>} />
 </Routes>
}
export default AppRoutes
