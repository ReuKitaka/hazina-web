import api from '@/lib/api'
import { Organisation, OrganisationRegistration, AuthResponse } from '@/types'

export const organisationsService = {
  register: (data: OrganisationRegistration) =>
    api.post<Organisation>('/api/organisations/register', data).then(r => r.data),

  findAll: (status?: string) =>
    api.get<Organisation[]>('/api/organisations', { params: status ? { status } : {} }).then(r => r.data),

  findById: (id: string) =>
    api.get<Organisation>(`/api/organisations/${id}`).then(r => r.data),

  approve: (id: string) =>
    api.patch<Organisation>(`/api/organisations/${id}/approve`).then(r => r.data),

  reject: (id: string) =>
    api.patch<Organisation>(`/api/organisations/${id}/reject`).then(r => r.data),

  suspend: (id: string) =>
    api.patch<Organisation>(`/api/organisations/${id}/suspend`).then(r => r.data),

  reinstate: (id: string) =>
    api.patch<Organisation>(`/api/organisations/${id}/reinstate`).then(r => r.data),

  switchToOrg: (id: string) =>
    api.post<AuthResponse>(`/api/organisations/${id}/switch`).then(r => r.data),

  exitOrg: () =>
    api.post<AuthResponse>('/api/organisations/exit').then(r => r.data),
}