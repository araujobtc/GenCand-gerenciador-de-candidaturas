import { useContext } from 'react'
import { AuthContext } from '../features/auth/context/AuthContext'

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth deve ser utilizado dentro de AuthProvider.')
  return contexto
}
