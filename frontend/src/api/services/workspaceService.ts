import { apiRequest, apiUpload, apiDownload } from '../apiClient'

export interface Plataforma { id: string; nome: string; dominio: string | null; observacao: string | null; oculta: boolean }
export interface Curriculo { id: string; nome: string; principal: boolean; tamanhoBytes: number }
export interface Dashboard { total: number; porStatus: Record<string, number>; inicio: string | null; fim: string | null }
export interface Preferencias { periodoPadrao: 'MES'|'SEMESTRE'|'ANO'; diasParaParada: number; freqEmail: 'DIARIA'|'SEMANAL'|'DESATIVADA'; freqCelular: 'DIARIA'|'SEMANAL'|'DESATIVADA'; diaSemanaResumo: string }
export interface Entrevista { id: string; tipo: string; dataHora: string; plataformaChamada: string | null; linkChamada: string | null; lembretesMinutosAntes: number[] }
export interface EntrevistaInput { tipo: string; dataHora: string; plataformaChamada?: string | null; linkChamada?: string | null }
export interface Contato { id: string; nome: string; cargo: string | null; email: string | null; telefone: string | null; linkedin: string | null; observacao: string | null }
export interface ContatoInput { contatoId?: string | null; nome?: string; cargo?: string; email?: string; telefone?: string; linkedin?: string; observacao?: string }

export const plataformaService = {
 listar: () => apiRequest<Plataforma[]>('/plataformas'),
 criar: (dados: Pick<Plataforma,'nome'|'dominio'|'observacao'>) => apiRequest<Plataforma>('/plataformas',{method:'POST',body:dados}),
 atualizar: (id:string,dados:Pick<Plataforma,'nome'|'dominio'|'observacao'>) => apiRequest<Plataforma>(`/plataformas/${id}`,{method:'PUT',body:dados}),
 ocultar: (id:string) => apiRequest<void>(`/plataformas/${id}/ocultar`,{method:'PATCH'}),
 excluir: (id:string) => apiRequest<void>(`/plataformas/${id}`,{method:'DELETE'}),
}
export const curriculoService = {
 listar: () => apiRequest<Curriculo[]>('/curriculos'),
 enviar: (nome:string,arquivo:File,principal:boolean) => { const form=new FormData(); form.append('nome',nome); form.append('arquivo',arquivo); form.append('principal',String(principal)); return apiUpload<Curriculo>('/curriculos',form) },
 definirPrincipal: (id:string) => apiRequest<void>(`/curriculos/${id}/principal`,{method:'PATCH'}),
 baixar: (id:string) => apiDownload(`/curriculos/${id}/download`),
 excluir: (id:string) => apiRequest<void>(`/curriculos/${id}`,{method:'DELETE'}),
}
export const dashboardService = { resumo: (inicio?:string,fim?:string) => { const q=new URLSearchParams(); if(inicio)q.set('inicio',inicio);if(fim)q.set('fim',fim);return apiRequest<Dashboard>(`/dashboard${q.size?'?'+q.toString():''}`) } }
export const preferenciasService = {
 obter: () => apiRequest<Preferencias>('/configuracoes'),
 atualizar: (dados:Preferencias) => apiRequest<Preferencias>('/configuracoes',{method:'PUT',body:dados}),
}
export const entrevistaService = {
 listar: (candidaturaId:string) => apiRequest<Entrevista[]>(`/candidaturas/${candidaturaId}/entrevistas`),
 criar: (candidaturaId:string,dados:EntrevistaInput) => apiRequest<Entrevista>(`/candidaturas/${candidaturaId}/entrevistas`,{method:'POST',body:dados}),
 atualizar: (candidaturaId:string,id:string,dados:EntrevistaInput) => apiRequest<Entrevista>(`/candidaturas/${candidaturaId}/entrevistas/${id}`,{method:'PUT',body:dados}),
 excluir: (candidaturaId:string,id:string) => apiRequest<void>(`/candidaturas/${candidaturaId}/entrevistas/${id}`,{method:'DELETE'}),
 adicionarLembrete: (candidaturaId:string,id:string,minutosAntes:number) => apiRequest<Entrevista>(`/candidaturas/${candidaturaId}/entrevistas/${id}/lembretes?minutosAntes=${minutosAntes}`,{method:'POST'}),
 removerLembrete: (candidaturaId:string,id:string,minutosAntes:number) => apiRequest<void>(`/candidaturas/${candidaturaId}/entrevistas/${id}/lembretes?minutosAntes=${minutosAntes}`,{method:'DELETE'}),
}
export const contatoService = {
 listar: (candidaturaId:string) => apiRequest<Contato[]>(`/candidaturas/${candidaturaId}/contatos`),
 vincular: (candidaturaId:string,dados:ContatoInput) => apiRequest<Contato>(`/candidaturas/${candidaturaId}/contatos`,{method:'POST',body:dados}),
 atualizarObservacao: (candidaturaId:string,id:string,observacao:string) => apiRequest<Contato>(`/candidaturas/${candidaturaId}/contatos/${id}/observacao`,{method:'PATCH',body:observacao}),
 desvincular: (candidaturaId:string,id:string) => apiRequest<void>(`/candidaturas/${candidaturaId}/contatos/${id}`,{method:'DELETE'}),
}
