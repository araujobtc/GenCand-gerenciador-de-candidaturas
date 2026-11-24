import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function RotaPrivada() {
  const { autenticado } = useAuth()
  return autenticado ? <Outlet /> : <Navigate to="/login" replace />
}
export default RotaPrivada
