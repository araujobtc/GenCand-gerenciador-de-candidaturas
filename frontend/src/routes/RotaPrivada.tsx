import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { WorkspaceProvider } from '../features/workspace/WorkspaceProvider'

function RotaPrivada() {
  const { autenticado } = useAuth()
  if (!autenticado) return <Navigate to="/login" replace />
  return <WorkspaceProvider><Outlet /></WorkspaceProvider>
}
export default RotaPrivada
