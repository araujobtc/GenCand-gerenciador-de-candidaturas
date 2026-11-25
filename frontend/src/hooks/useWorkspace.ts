import { useContext } from 'react'
import { WorkspaceContext } from '../features/workspace/WorkspaceContext'

export function useWorkspace() {
  const contexto = useContext(WorkspaceContext)
  if (!contexto) throw new Error('useWorkspace deve ser usado dentro de WorkspaceProvider')
  return contexto
}
